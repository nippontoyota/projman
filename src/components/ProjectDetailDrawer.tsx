'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, UserRole, Milestone, ScheduleHealth, ProjectStatus } from '@/types';
import {
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Building2,
  Trash2,
  Save,
  PlusCircle,
  History,
  Shield,
  FileText,
} from 'lucide-react';

interface ProjectDetailDrawerProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
  onUpdateSuccess: () => void;
}

export const ProjectDetailDrawer: React.FC<ProjectDetailDrawerProps> = ({
  project,
  isOpen,
  onClose,
  userRole,
  onUpdateSuccess,
}) => {
  const [currentStatus, setCurrentStatus] = useState<ProjectStatus>(
    project?.currentStatus || 'Pre-Construction'
  );
  const [scheduleHealth, setScheduleHealth] = useState<ScheduleHealth>(
    project?.scheduleHealth || 'On Track'
  );
  const [workPercentage, setWorkPercentage] = useState<number>(
    project?.workPercentage || 0
  );
  const [keyRemarks, setKeyRemarks] = useState(project?.keyRemarks || '');
  const [fixedTargetDate, setFixedTargetDate] = useState(
    project?.fixedTargetDate ? project.fixedTargetDate.split('T')[0] : '2027-03-31'
  );

  // Blocker form state
  const [showBlockerForm, setShowBlockerForm] = useState(false);
  const [blockerCategory, setBlockerCategory] = useState('Landlord');
  const [blockerSeverity, setBlockerSeverity] = useState<'Critical' | 'Major' | 'Moderate' | 'Minor'>('Critical');
  const [blockerTitle, setBlockerTitle] = useState('');
  const [blockerDesc, setBlockerDesc] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'milestones' | 'blockers' | 'audit'>('milestones');

  if (!project) return null;

  // Save project overall changes
  const handleSaveProject = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentStatus,
          scheduleHealth,
          workPercentage,
          fixedTargetDate,
          keyRemarks,
          userRole,
        }),
      });

      if (!res.ok) throw new Error('Failed to update project');
      onUpdateSuccess();
    } catch (err) {
      console.error(err);
      alert('Error updating project');
    } finally {
      setIsSaving(false);
    }
  };

  // Update milestone
  const handleMilestoneUpdate = async (milestone: Milestone, isCompleted: boolean) => {
    try {
      const newStatus = isCompleted ? 'Completed' : 'Pending';
      const actualDate = isCompleted ? new Date().toISOString().split('T')[0] : null;

      const res = await fetch(`/api/milestones/${milestone.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          actualDate,
          userRole,
        }),
      });

      if (!res.ok) throw new Error('Failed to update milestone');
      onUpdateSuccess();
    } catch (err) {
      console.error(err);
      alert('Failed to update milestone');
    }
  };

  // Add Blocker
  const handleAddBlocker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockerTitle) return;

    try {
      const res = await fetch('/api/blockers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          category: blockerCategory,
          severity: blockerSeverity,
          title: blockerTitle,
          description: blockerDesc,
          userRole,
        }),
      });

      if (!res.ok) throw new Error('Failed to log blocker');
      setBlockerTitle('');
      setBlockerDesc('');
      setShowBlockerForm(false);
      onUpdateSuccess();
    } catch (err) {
      console.error(err);
      alert('Error logging blocker');
    }
  };

  // Resolve Blocker
  const handleResolveBlocker = async (blockerId: string) => {
    try {
      const res = await fetch(`/api/blockers/${blockerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Resolved',
          userRole,
        }),
      });

      if (!res.ok) throw new Error('Failed to resolve blocker');
      onUpdateSuccess();
    } catch (err) {
      console.error(err);
      alert('Error resolving blocker');
    }
  };

  // Delete project (Admin only)
  const handleDeleteProject = async () => {
    if (!confirm(`Are you sure you want to delete project ${project.code}? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete project');
      onUpdateSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to delete project');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative z-10 bg-slate-900 border-l border-slate-800 w-full max-w-2xl h-full flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold font-mono">
                  {project.location.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-bold text-white tracking-tight">
                      {project.location.name} – {project.facilityType}
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded font-mono bg-slate-800 text-slate-300">
                      {project.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Brand: <strong className="text-slate-200">{project.brand.name}</strong> • State: Kerala
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {userRole === 'Admin' && (
                  <button
                    onClick={handleDeleteProject}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sub Navigation */}
            <div className="flex items-center px-5 border-b border-slate-800 bg-slate-900/60 text-xs space-x-4">
              {[
                { id: 'milestones', label: '21 Milestones', icon: CheckCircle2 },
                {
                  id: 'blockers',
                  label: `Blockers (${project.blockers.filter((b) => b.status !== 'Resolved').length})`,
                  icon: AlertTriangle,
                },
                { id: 'audit', label: 'Audit History', icon: History },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`relative py-3 font-semibold transition-colors flex items-center space-x-1.5 ${
                      isActive ? 'text-sky-400' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="drawerTabIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Project Master Parameters Card */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Project Master Parameters</span>
                  <span className="text-[11px] text-slate-400">
                    Active Role: <strong className={userRole === 'Admin' ? 'text-purple-400 font-mono' : 'text-sky-400 font-mono'}>{userRole}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Current Status</label>
                    <select
                      disabled={userRole !== 'Admin'}
                      value={currentStatus}
                      onChange={(e) => setCurrentStatus(e.target.value as ProjectStatus)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-sky-500 disabled:opacity-60"
                    >
                      <option value="Commercial Negotiation">Commercial Negotiation</option>
                      <option value="Pre-Construction">Pre-Construction</option>
                      <option value="BOQ Approved / PO Pending">BOQ Approved / PO Pending</option>
                      <option value="Ready for Handover">Ready for Handover</option>
                      <option value="Commissioned">Commissioned</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Schedule Health</label>
                    <select
                      disabled={userRole !== 'Admin'}
                      value={scheduleHealth}
                      onChange={(e) => setScheduleHealth(e.target.value as ScheduleHealth)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-sky-500 disabled:opacity-60"
                    >
                      <option value="Completed">Completed</option>
                      <option value="On Track">On Track</option>
                      <option value="Watchlist">Watchlist</option>
                      <option value="Delayed (>30d)">Delayed (&gt;30d)</option>
                      <option value="Action Needed">Action Needed</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Progress %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={workPercentage}
                      onChange={(e) => setWorkPercentage(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Target Completion</label>
                    <input
                      type="date"
                      disabled={userRole !== 'Admin'}
                      value={fixedTargetDate}
                      onChange={(e) => setFixedTargetDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-sky-500 disabled:opacity-60"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Remarks / Action Items</label>
                  <textarea
                    rows={2}
                    value={keyRemarks}
                    onChange={(e) => setKeyRemarks(e.target.value)}
                    placeholder="Enter latest site progress notes..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveProject}
                    disabled={isSaving}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs shadow transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Saving...' : 'Save Updates'}</span>
                  </motion.button>
                </div>
              </div>

              {/* TAB 1: 21 MILESTONES */}
              {activeTab === 'milestones' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <h3 className="font-bold text-white">Lifecycle Milestone Checkpoints</h3>
                    <span className="text-slate-400 font-mono">
                      {project.milestones.filter((m) => m.status === 'Completed').length} /{' '}
                      {project.milestones.length} Completed
                    </span>
                  </div>

                  {[1, 2, 3, 4].map((phaseNum) => {
                    const phaseMilestones = project.milestones.filter((m) => m.phaseNumber === phaseNum);
                    const phaseNames = [
                      '',
                      'Phase 1: Property Identification & Agreement',
                      'Phase 2: Architectural & Engineering Design (GFC)',
                      'Phase 3: BOQ, PO & Advance Release',
                      'Phase 4: Site Execution, Handover & Commissioning',
                    ];

                    return (
                      <div key={phaseNum} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
                        <div className="bg-slate-950 px-3.5 py-2 text-xs font-bold text-sky-400 border-b border-slate-800">
                          {phaseNames[phaseNum]}
                        </div>

                        <div className="divide-y divide-slate-800/60">
                          {phaseMilestones.map((m) => {
                            const isDone = m.status === 'Completed';

                            return (
                              <div
                                key={m.id}
                                className={`p-3 flex items-center justify-between text-xs hover:bg-slate-800/40 transition-colors ${
                                  isDone ? 'bg-emerald-950/10' : ''
                                }`}
                              >
                                <div className="flex items-center space-x-3 flex-1 pr-3">
                                  <input
                                    type="checkbox"
                                    checked={isDone}
                                    onChange={(e) => handleMilestoneUpdate(m, e.target.checked)}
                                    className="w-4 h-4 text-emerald-500 bg-slate-900 border-slate-700 rounded focus:ring-emerald-500 cursor-pointer"
                                  />
                                  <div>
                                    <div className={`font-medium ${isDone ? 'text-white' : 'text-slate-300'}`}>
                                      {m.title}
                                    </div>
                                    {m.actualDate && (
                                      <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                                        Completed: {m.actualDate.split('T')[0]}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                      isDone
                                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                        : 'bg-slate-800 text-slate-400 border-slate-700'
                                    }`}
                                  >
                                    {m.status}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 2: BLOCKERS */}
              {activeTab === 'blockers' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-xs">Logged Bottlenecks & Delays</h3>
                    <button
                      onClick={() => setShowBlockerForm(!showBlockerForm)}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 transition-colors cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Log Blocker</span>
                    </button>
                  </div>

                  {showBlockerForm && (
                    <form
                      onSubmit={handleAddBlocker}
                      className="bg-slate-950 p-4 rounded-xl border border-rose-500/30 space-y-3 text-xs"
                    >
                      <div className="font-bold text-white">Log Bottleneck / Site Issue</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Category</label>
                          <select
                            value={blockerCategory}
                            onChange={(e) => setBlockerCategory(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                          >
                            <option value="Landlord">Landlord Negotiation</option>
                            <option value="River OEM">River OEM Approvals</option>
                            <option value="Municipal / Legal">Municipal / Legal</option>
                            <option value="Civil Contractor">Civil Contractor</option>
                            <option value="Internal Management">Internal Management</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Severity</label>
                          <select
                            value={blockerSeverity}
                            onChange={(e) => setBlockerSeverity(e.target.value as any)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                          >
                            <option value="Critical">Critical (Immediate Block)</option>
                            <option value="Major">Major</option>
                            <option value="Moderate">Moderate</option>
                            <option value="Minor">Minor</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Landlord delay in lease draft signing"
                          value={blockerTitle}
                          onChange={(e) => setBlockerTitle(e.target.value)}
                          required
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Details & Resolution Plan</label>
                        <textarea
                          rows={2}
                          placeholder="Describe the blocker and who owns resolution..."
                          value={blockerDesc}
                          onChange={(e) => setBlockerDesc(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                        />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setShowBlockerForm(false)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-lg bg-rose-500 text-white font-bold"
                        >
                          Submit Blocker
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-3">
                    {project.blockers.map((blk) => (
                      <div
                        key={blk.id}
                        className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                          blk.status === 'Resolved'
                            ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                            : 'bg-slate-950 border-rose-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white">{blk.title}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              {blk.category}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">
                            {blk.severity}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-300">{blk.description}</p>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                          <span>Status: <strong className={blk.status === 'Resolved' ? 'text-emerald-400' : 'text-rose-400'}>{blk.status}</strong></span>
                          {blk.status !== 'Resolved' && (
                            <button
                              onClick={() => handleResolveBlocker(blk.id)}
                              className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 font-semibold cursor-pointer"
                            >
                              Mark Resolved
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {project.blockers.length === 0 && (
                      <div className="p-8 text-center text-slate-500 text-xs">
                        No active blockers logged for this project track.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: AUDIT HISTORY */}
              {activeTab === 'audit' && (
                <div className="space-y-3">
                  <h3 className="font-bold text-white text-xs">Change & Audit Trail</h3>
                  <div className="space-y-2">
                    {project.auditLogs?.map((log) => (
                      <div key={log.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                        <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                          <span className="font-bold text-sky-400 font-mono">{log.userRole}</span>
                          <span className="font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="text-slate-300">{log.details}</div>
                      </div>
                    ))}

                    {(!project.auditLogs || project.auditLogs.length === 0) && (
                      <div className="p-8 text-center text-slate-500 text-xs">
                        No audit records yet.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
