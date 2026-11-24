'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, UserRole, Milestone, ScheduleHealth, ProjectStatus } from '@/types';
import {
  IconClose,
  IconCheck,
  IconEscalation,
  IconPlus,
  IconTrash,
  IconSave,
} from '@/components/ui/Icons';
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect';
import { useToast } from '@/context/ToastContext';

const PROJECT_STATUS_OPTIONS: SelectOption[] = [
  { value: 'Commercial Negotiation', label: 'Commercial Negotiation' },
  { value: 'Pre-Construction', label: 'Pre-Construction' },
  { value: 'BOQ Approved / PO Pending', label: 'BOQ Approved / PO Pending' },
  { value: 'Ready for Handover', label: 'Ready for Handover' },
  { value: 'Commissioned', label: 'Commissioned' },
];

const SCHEDULE_HEALTH_OPTIONS: SelectOption[] = [
  { value: 'Completed', label: 'Completed' },
  { value: 'On Track', label: 'On Track' },
  { value: 'Watchlist', label: 'Watchlist' },
  { value: 'Delayed (>30d)', label: 'Delayed (>30d)' },
  { value: 'Action Needed', label: 'Action Needed' },
];

const BLOCKER_CATEGORY_OPTIONS: SelectOption[] = [
  { value: 'Landlord', label: 'Landlord Negotiation' },
  { value: 'River OEM', label: 'River OEM Approvals' },
  { value: 'Municipal / Legal', label: 'Municipal / Legal' },
  { value: 'Civil Contractor', label: 'Civil Contractor' },
  { value: 'Internal Management', label: 'Internal Management' },
];

const BLOCKER_SEVERITY_OPTIONS: SelectOption[] = [
  { value: 'Critical', label: 'Critical (Immediate Block)' },
  { value: 'Major', label: 'Major' },
  { value: 'Moderate', label: 'Moderate' },
  { value: 'Minor', label: 'Minor' },
];

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

  const [showBlockerForm, setShowBlockerForm] = useState(false);
  const [blockerCategory, setBlockerCategory] = useState('Landlord');
  const [blockerSeverity, setBlockerSeverity] = useState<'Critical' | 'Major' | 'Moderate' | 'Minor'>('Critical');
  const [blockerTitle, setBlockerTitle] = useState('');
  const [blockerDesc, setBlockerDesc] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'milestones' | 'blockers' | 'audit'>('milestones');

  const toast = useToast();

  if (!project) return null;

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
      toast.success(
        'Project Updated',
        `Master parameters and target dates saved for ${project.location.name}`
      );
      onUpdateSuccess();
    } catch (err) {
      console.error(err);
      toast.error('Save Failed', 'Could not update project master parameters');
    } finally {
      setIsSaving(false);
    }
  };

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
      toast.success(
        isCompleted ? 'Milestone Completed' : 'Milestone Marked Pending',
        `"${milestone.title}" updated for ${project.location.name}`
      );
      onUpdateSuccess();
    } catch (err) {
      console.error(err);
      toast.error('Update Failed', 'Failed to update milestone checkpoint');
    }
  };

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
      toast.warning(
        'Blocker Escalated',
        `Logged [${blockerSeverity}] bottleneck: "${blockerTitle}"`
      );
      setBlockerTitle('');
      setBlockerDesc('');
      setShowBlockerForm(false);
      onUpdateSuccess();
    } catch (err) {
      console.error(err);
      toast.error('Error', 'Unable to record project blocker');
    }
  };

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
      toast.success('Blocker Cleared', 'Bottleneck marked as resolved and unblocked');
      onUpdateSuccess();
    } catch (err) {
      console.error(err);
      toast.error('Error', 'Unable to resolve blocker');
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm(`Are you sure you want to delete project ${project.code}? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete project');
      toast.info('Project Deleted', `Dealership track ${project.code} removed from system`);
      onUpdateSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Delete Failed', 'Failed to delete project track');
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
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-2xs"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="relative z-10 bg-white border-l border-slate-200 w-full max-w-2xl h-full flex flex-col shadow-2xl overflow-hidden text-slate-900"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold font-mono text-sm shadow-xs">
                  {project.location.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">
                      {project.location.name} – {project.facilityType}
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded font-mono bg-white text-slate-700 border border-slate-200 shadow-2xs">
                      {project.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Brand: <strong className="text-slate-800">{project.brand.name}</strong> • State: Kerala
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                {userRole === 'Admin' && (
                  <button
                    onClick={handleDeleteProject}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Project"
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <IconClose className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center px-5 border-b border-slate-200 bg-white text-xs space-x-4">
              {[
                { id: 'milestones', label: '21 Milestones', icon: IconCheck },
                {
                  id: 'blockers',
                  label: `Blockers (${project.blockers.filter((b) => b.status !== 'Resolved').length})`,
                  icon: IconEscalation,
                },
                { id: 'audit', label: 'Audit Trail', icon: IconCheck },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`relative py-3 font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer ${
                      isActive ? 'text-blue-700' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="drawerTabIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Master Controls Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Project Master Controls</span>
                  <span className="text-[11px] text-slate-500">
                    Mode: <strong className="text-slate-800 font-mono">{userRole}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <CustomSelect
                      label="Status"
                      value={currentStatus}
                      onChange={(val) => setCurrentStatus(val as ProjectStatus)}
                      options={PROJECT_STATUS_OPTIONS}
                      disabled={userRole !== 'Admin'}
                      size="sm"
                    />
                  </div>

                  <div>
                    <CustomSelect
                      label="Schedule Health"
                      value={scheduleHealth}
                      onChange={(val) => setScheduleHealth(val as ScheduleHealth)}
                      options={SCHEDULE_HEALTH_OPTIONS}
                      disabled={userRole !== 'Admin'}
                      size="sm"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Progress %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={workPercentage}
                      onChange={(e) => setWorkPercentage(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Target Completion</label>
                    <input
                      type="date"
                      disabled={userRole !== 'Admin'}
                      value={fixedTargetDate}
                      onChange={(e) => setFixedTargetDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500 shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Remarks / Action Items</label>
                  <textarea
                    rows={2}
                    value={keyRemarks}
                    onChange={(e) => setKeyRemarks(e.target.value)}
                    placeholder="Enter latest site progress notes..."
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveProject}
                    disabled={isSaving}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <IconSave className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Saving...' : 'Save Updates'}</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: 21 MILESTONES */}
              {activeTab === 'milestones' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <h3 className="font-bold text-slate-900">Lifecycle Milestone Checkpoints</h3>
                    <span className="text-slate-500 font-mono">
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
                      <div key={phaseNum} className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs">
                        <div className="bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-800 border-b border-slate-200">
                          {phaseNames[phaseNum]}
                        </div>

                        <div className="divide-y divide-slate-100">
                          {phaseMilestones.map((m) => {
                            const isDone = m.status === 'Completed';

                            return (
                              <div
                                key={m.id}
                                className={`p-3 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors ${
                                  isDone ? 'bg-emerald-50/20' : ''
                                }`}
                              >
                                <div className="flex items-center space-x-3 flex-1 pr-3">
                                  <input
                                    type="checkbox"
                                    checked={isDone}
                                    onChange={(e) => handleMilestoneUpdate(m, e.target.checked)}
                                    className="w-4 h-4 text-emerald-600 bg-white border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                                  />
                                  <div>
                                    <div className={`font-medium ${isDone ? 'text-slate-900' : 'text-slate-600'}`}>
                                      {m.title}
                                    </div>
                                    {m.actualDate && (
                                      <div className="text-[10px] text-emerald-700 font-mono font-semibold mt-0.5">
                                        Completed: {m.actualDate.split('T')[0]}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                      isDone
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-slate-100 text-slate-600 border-slate-200'
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
                    <h3 className="font-bold text-slate-900 text-xs">Logged Bottlenecks & Delays</h3>
                    <button
                      onClick={() => setShowBlockerForm(!showBlockerForm)}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      <IconPlus className="w-3.5 h-3.5" />
                      <span>Log Issue</span>
                    </button>
                  </div>

                  {showBlockerForm && (
                    <form
                      onSubmit={handleAddBlocker}
                      className="bg-slate-50 p-4 rounded-xl border border-rose-200 space-y-3 text-xs"
                    >
                      <div className="font-bold text-slate-900">Log Site Bottleneck</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <CustomSelect
                            label="Category"
                            value={blockerCategory}
                            onChange={setBlockerCategory}
                            options={BLOCKER_CATEGORY_OPTIONS}
                            size="sm"
                          />
                        </div>

                        <div>
                          <CustomSelect
                            label="Severity"
                            value={blockerSeverity}
                            onChange={(val) => setBlockerSeverity(val as any)}
                            options={BLOCKER_SEVERITY_OPTIONS}
                            size="sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Landlord delay in lease draft signing"
                          value={blockerTitle}
                          onChange={(e) => setBlockerTitle(e.target.value)}
                          required
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Details & Plan</label>
                        <textarea
                          rows={2}
                          placeholder="Describe the issue and resolution plan..."
                          value={blockerDesc}
                          onChange={(e) => setBlockerDesc(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 shadow-2xs"
                        />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setShowBlockerForm(false)}
                          className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-lg bg-rose-600 text-white font-semibold shadow-xs"
                        >
                          Submit Blocker
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-2.5">
                    {project.blockers.map((blk) => (
                      <div
                        key={blk.id}
                        className={`p-3.5 rounded-lg border text-xs space-y-1.5 ${
                          blk.status === 'Resolved'
                            ? 'bg-slate-50 border-slate-200 opacity-60'
                            : 'bg-white border-slate-200 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900">{blk.title}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                              {blk.category}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 font-semibold">
                            {blk.severity}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600">{blk.description}</p>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                          <span>Status: <strong className={blk.status === 'Resolved' ? 'text-emerald-700' : 'text-rose-700'}>{blk.status}</strong></span>
                          {blk.status !== 'Resolved' && (
                            <button
                              onClick={() => handleResolveBlocker(blk.id)}
                              className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-semibold cursor-pointer"
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

              {/* TAB 3: AUDIT */}
              {activeTab === 'audit' && (
                <div className="space-y-2.5">
                  <h3 className="font-bold text-slate-900 text-xs">Activity & Audit Trail</h3>
                  <div className="space-y-2">
                    {project.auditLogs?.map((log) => (
                      <div key={log.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                        <div className="flex items-center justify-between text-slate-500 text-[10px] mb-1">
                          <span className="font-bold text-blue-700 font-mono">{log.userRole}</span>
                          <span className="font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="text-slate-800">{log.details}</div>
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
