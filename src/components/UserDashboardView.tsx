'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, Milestone } from '@/types';
import {
  IconSearch,
  IconCheck,
  IconChevronDown,
  IconClose,
} from '@/components/ui/Icons';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

interface UserDashboardViewProps {
  projects: Project[];
  onRefresh: () => void;
}

interface UserTaskItem {
  milestone: Milestone;
  project: Project;
}

/**
 * Sequential waterfall dependency rule:
 * A milestone is unlocked IF AND ONLY IF all preceding milestones
 * in that project track have status === 'Completed' (or it is task #1).
 */
function isMilestoneUnlocked(project: Project, milestone: Milestone): boolean {
  if (milestone.orderIndex <= 1) return true;
  const prevMilestones = project.milestones?.filter((m) => m.orderIndex < milestone.orderIndex) || [];
  return prevMilestones.every((m) => m.status === 'Completed');
}

export const UserDashboardView: React.FC<UserDashboardViewProps> = ({
  projects,
  onRefresh,
}) => {
  const { user, userRole } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // In-House Status Dropdown state (anchored portal)
  const [mounted, setMounted] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<{
    milestone: Milestone;
    project: Project;
    top: number;
    bottom: number;
    right: number;
    openUpward: boolean;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close floating dropdown on scroll or Escape key
  useEffect(() => {
    if (!activeDropdown) return;
    const handleClose = () => setActiveDropdown(null);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveDropdown(null);
    };

    window.addEventListener('scroll', handleClose, true);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('scroll', handleClose, true);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeDropdown]);

  const handleOpenDropdown = (
    item: UserTaskItem,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (activeDropdown?.milestone.id === item.milestone.id) {
      setActiveDropdown(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < 180;

    setActiveDropdown({
      milestone: item.milestone,
      project: item.project,
      top: rect.bottom + 6,
      bottom: window.innerHeight - rect.top + 6,
      right: window.innerWidth - rect.right,
      openUpward,
    });
  };

  // Completion confirmation popup state
  const [milestoneToComplete, setMilestoneToComplete] = useState<{
    milestone: Milestone;
    project: Project;
  } | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  // Group tasks assigned to the current user into Active Actionable and Completed History
  const { activeActionableTasks, completedTasks } = useMemo(() => {
    if (!user?.username) {
      return { activeActionableTasks: [], completedTasks: [] };
    }

    const active: UserTaskItem[] = [];
    const completed: UserTaskItem[] = [];

    projects.forEach((p) => {
      p.milestones?.forEach((m) => {
        if (m.assignedTo === user.username) {
          if (m.status === 'Completed') {
            completed.push({ milestone: m, project: p });
          } else {
            const unlocked = isMilestoneUnlocked(p, m);
            if (unlocked) {
              active.push({ milestone: m, project: p });
            }
          }
        }
      });
    });

    // Sort active: In Progress first, then orderIndex
    active.sort((a, b) => {
      if (a.milestone.status === 'In Progress' && b.milestone.status !== 'In Progress') return -1;
      if (b.milestone.status === 'In Progress' && a.milestone.status !== 'In Progress') return 1;
      return a.milestone.orderIndex - b.milestone.orderIndex;
    });

    // Sort completed by actualDate desc (most recent first)
    completed.sort((a, b) => {
      const dateA = a.milestone.actualDate ? new Date(a.milestone.actualDate).getTime() : 0;
      const dateB = b.milestone.actualDate ? new Date(b.milestone.actualDate).getTime() : 0;
      return dateB - dateA;
    });

    return {
      activeActionableTasks: active,
      completedTasks: completed,
    };
  }, [projects, user?.username]);

  // Filter current tab's list based on search term
  const displayedTasks = useMemo(() => {
    const list = activeTab === 'active' ? activeActionableTasks : completedTasks;

    if (!search.trim()) return list;

    const q = search.toLowerCase();
    return list.filter(({ milestone, project }) => {
      const titleMatch = milestone.title.toLowerCase().includes(q);
      const cityMatch = project.location?.name.toLowerCase().includes(q);
      const codeMatch = project.code.toLowerCase().includes(q);
      const phaseMatch = milestone.phaseName?.toLowerCase().includes(q);
      return titleMatch || cityMatch || codeMatch || phaseMatch;
    });
  }, [activeTab, activeActionableTasks, completedTasks, search]);

  // Quick Status Update (for non-completed statuses e.g. In Progress, Pending)
  const handleToggleStatus = async (
    milestone: Milestone,
    nextStatus: 'Pending' | 'In Progress'
  ) => {
    setUpdatingId(milestone.id);
    try {
      const res = await fetch(`/api/milestones/${milestone.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          userRole,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Status Updated', `"${milestone.title}" set to ${nextStatus}`);
        onRefresh();
      } else {
        toast.error('Update Failed', data.error || 'Server rejected change');
      }
    } catch {
      toast.error('Network Error', 'Failed to reach server');
    } finally {
      setUpdatingId(null);
    }
  };

  // Confirm Completion Handler (advances pipeline & unlocks next milestone)
  const handleConfirmCompletion = async () => {
    if (!milestoneToComplete) return;

    setIsCompleting(true);
    const { milestone, project } = milestoneToComplete;

    try {
      const res = await fetch(`/api/milestones/${milestone.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Completed',
          actualDate: new Date(),
          userRole,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(
          'Milestone Completed',
          `"${milestone.title}" has been completed.`
        );

        setMilestoneToComplete(null);
        onRefresh();
      } else {
        toast.error('Completion Failed', data.error || 'Server rejected completion');
      }
    } catch {
      toast.error('Network Error', 'Failed to reach server');
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="w-full space-y-5">
      {/* Sleek Modern Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            My Actionable Tasks
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Checkpoints currently active and waiting for your execution
          </p>
        </div>

        {/* Tab switchers: Actionable vs Completed */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <span>Actionable Tasks</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'active' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
              }`}
            >
              {activeActionableTasks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <span>Completed History</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'completed' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {completedTasks.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Task List Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-visible">
        {/* Table Filter Sub-Bar */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-t-2xl">
          <div className="text-xs font-bold text-slate-700">
            {activeTab === 'active' ? (
              <span>Actionable Checkpoints ({displayedTasks.length})</span>
            ) : (
              <span>Completed History ({displayedTasks.length})</span>
            )}
          </div>

          {/* Search Filter */}
          <div className="relative max-w-xs w-full">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <IconSearch className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by task, showroom, city..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
            />
          </div>
        </div>

        {/* Tab Content */}
        {displayedTasks.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            {activeTab === 'active' ? (
              <div>
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <IconCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="font-bold text-slate-800">No Actionable Tasks Right Now</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  All active milestones have been completed! When upstream tasks on your assigned tracks are finished, new tasks will unlock here automatically.
                </p>
              </div>
            ) : (
              <div>
                <p className="font-bold text-slate-800">No Completed Tasks Yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  Once you mark an active milestone as Completed, it will be catalogued here for your records.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[850px]">
              <thead className="bg-slate-100/90 border-b border-slate-200">
                <tr className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center whitespace-nowrap">#</th>
                  <th className="py-3 px-4 whitespace-nowrap">Showroom Track</th>
                  <th className="py-3 px-4 whitespace-nowrap">Milestone Checkpoint</th>
                  <th className="py-3 px-4 whitespace-nowrap">Phase</th>
                  <th className="py-3 px-4 whitespace-nowrap">Target Date</th>
                  <th className="py-3 px-4 w-52 whitespace-nowrap">Status & Execution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {displayedTasks.map((item) => {
                  const { milestone, project } = item;
                  const isUpdating = updatingId === milestone.id;

                  return (
                    <tr
                      key={milestone.id}
                      className={`transition-colors ${
                        activeTab === 'active'
                          ? 'hover:bg-blue-50/40 bg-white'
                          : 'hover:bg-emerald-50/30 bg-slate-50/30'
                      }`}
                    >
                      {/* Milestone Order Index */}
                      <td className="py-3.5 px-4 text-center font-mono text-slate-400 font-semibold whitespace-nowrap">
                        {milestone.orderIndex}
                      </td>

                      {/* Showroom Track Code & Location */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-bold text-black">
                            {project.code}
                          </span>
                          <span className="font-bold text-slate-900">
                            {project.location?.name}
                          </span>
                          {project.brand?.name && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200 font-semibold">
                              {project.brand.name}
                            </span>
                          )}
                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-50 text-slate-600 rounded border border-slate-200 font-medium">
                            {project.facilityType}
                          </span>
                        </div>
                      </td>

                      {/* Milestone Checkpoint */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 text-xs">
                          {milestone.title}
                        </div>
                        {milestone.benchmarkDays ? (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Benchmark: {milestone.benchmarkDays} days
                          </div>
                        ) : null}
                      </td>

                      {/* Phase */}
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap font-medium">
                        {milestone.phaseName}
                      </td>

                      {/* Target Date / Actual Date */}
                      <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {activeTab === 'completed' && milestone.actualDate ? (
                          <div className="text-emerald-700 font-semibold">
                            Completed: {new Date(milestone.actualDate).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                        ) : milestone.plannedDate ? (
                          new Date(milestone.plannedDate).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* Status / Interactive In-House Execution */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {activeTab === 'active' ? (
                          (() => {
                            const isDropdownOpen = activeDropdown?.milestone.id === milestone.id;

                            return (
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={(e) => handleOpenDropdown(item, e)}
                                className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold transition-all cursor-pointer bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/70"
                              >
                                <span>{milestone.status}</span>
                                <IconChevronDown
                                  className={`w-3 h-3 transition-transform duration-150 ${
                                    isDropdownOpen ? 'rotate-180' : ''
                                  } text-rose-500`}
                                />
                              </button>
                            );
                          })()
                        ) : (
                          <div className="flex items-center space-x-1.5">
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
                              <IconCheck className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                              <span>Completed</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              (Locked)
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Floating In-House Dropdown Portal - Clean & Direct */}
      {mounted && activeDropdown && typeof document !== 'undefined' && (
        createPortal(
          <>
            {/* Click-outside backdrop */}
            <div
              className="fixed inset-0 z-[9998] cursor-default"
              onClick={() => setActiveDropdown(null)}
            />

            {/* In-House Dropdown Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: activeDropdown.openUpward ? 4 : -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: activeDropdown.openUpward ? 4 : -4 }}
              transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'fixed',
                top: activeDropdown.openUpward ? undefined : activeDropdown.top,
                bottom: activeDropdown.openUpward ? activeDropdown.bottom : undefined,
                right: activeDropdown.right,
                zIndex: 9999,
              }}
              className="w-36 bg-white border border-slate-200 rounded-lg shadow-lg py-1 overflow-hidden"
            >
              {/* Option 1: Pending */}
              <button
                type="button"
                onClick={() => {
                  const item = activeDropdown;
                  setActiveDropdown(null);
                  handleToggleStatus(item.milestone, 'Pending');
                }}
                className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                  activeDropdown.milestone.status === 'Pending'
                    ? 'bg-rose-50 text-rose-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Pending
              </button>

              {/* Option 2: Completed */}
              <button
                type="button"
                onClick={() => {
                  const item = activeDropdown;
                  setActiveDropdown(null);
                  setMilestoneToComplete({ milestone: item.milestone, project: item.project });
                }}
                className="w-full text-left px-3.5 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                Completed
              </button>
            </motion.div>
          </>,
          document.body
        )
      )}

      {/* Milestone Completion Confirmation Popup Modal - Clean & Focused */}
      <AnimatePresence>
        {milestoneToComplete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isCompleting && setMilestoneToComplete(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative z-10 bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-slate-900 p-6 space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <IconCheck className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Confirm Milestone Completion
                    </h3>
                    <p className="text-xs text-slate-500">
                      Step #{milestoneToComplete.milestone.orderIndex} • {milestoneToComplete.project.code}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isCompleting}
                  onClick={() => setMilestoneToComplete(null)}
                  className="p-1 text-slate-400 hover:text-black rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <IconClose className="w-4 h-4" />
                </button>
              </div>

              {/* Task Details Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-1.5">
                <div className="font-bold text-xs text-slate-900">
                  {milestoneToComplete.milestone.title}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center space-x-2">
                  <span>{milestoneToComplete.project.location?.name}</span>
                  <span>•</span>
                  <span>Phase: {milestoneToComplete.milestone.phaseName}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600">
                Are you sure you want to mark this milestone as completed? Once completed, this task will be permanently locked.
              </p>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-1">
                <button
                  type="button"
                  disabled={isCompleting}
                  onClick={() => setMilestoneToComplete(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-black rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isCompleting}
                  onClick={handleConfirmCompletion}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isCompleting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Completing...</span>
                    </>
                  ) : (
                    <span>Yes, Mark Completed</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
