'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, Milestone, Blocker, ScheduleHealth, ProjectStatus, UserRole } from '@/types';
import {
  IconChevronLeft,
  IconChevronRight,
  IconCheck,
  IconEscalation,
  IconPlus,
  IconFacility,
  IconLocation,
  IconSave,
  IconTrash,
} from '@/components/ui/Icons';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getUserAvatarInfo } from '@/lib/userAvatar';

interface ProjectDetailGanttViewProps {
  project: Project;
  onBack: () => void;
  onRefresh: () => void;
  onOpenEditDrawer: () => void;
}

interface TimelineMonth {
  id: string; // e.g. '2026-11'
  label: string; // e.g. 'Nov-26'
  year: number;
  month: number;
  isCurrent: boolean;
  isTarget: boolean;
}

export const ProjectDetailGanttView: React.FC<ProjectDetailGanttViewProps> = ({
  project,
  onBack,
  onRefresh,
  onOpenEditDrawer,
}) => {
  const { user, isAdmin, userRole } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'gantt' | 'milestones' | 'blockers' | 'audit'>('gantt');
  const [updatingMilestoneId, setUpdatingMilestoneId] = useState<string | null>(null);
  const [availableUsers, setAvailableUsers] = useState<Array<{ value: string; label: string }>>([
    { value: 'user1', label: 'User 1' },
    { value: 'user2', label: 'User 2' },
    { value: 'user3', label: 'User 3' },
  ]);

  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const nonAdmins = json.data.filter((u: { role: string }) => u.role !== 'Admin');
          if (nonAdmins.length > 0) {
            setAvailableUsers(
              nonAdmins.map((u: { username: string; name: string }) => ({
                value: u.username,
                label: u.name && u.name !== u.username ? `${u.name} (${u.username})` : u.username,
              }))
            );
          }
        }
      })
      .catch(() => {});
  }, []);

  // Group milestones by Phase
  const phases = useMemo(() => {
    const list = project.milestones || [];
    const grouped: Record<number, { name: string; items: Milestone[] }> = {
      1: { name: '1. Property & Agreement', items: [] },
      2: { name: '2. Design & GFC Approval', items: [] },
      3: { name: '3. BOQ & PO Release', items: [] },
      4: { name: '4. Site Execution & Handover', items: [] },
    };

    list.forEach((m) => {
      const pNum = m.phaseNumber || 1;
      if (!grouped[pNum]) {
        grouped[pNum] = { name: m.phaseName || `Phase ${pNum}`, items: [] };
      }
      grouped[pNum].items.push(m);
    });

    return Object.entries(grouped).map(([num, data]) => ({
      phaseNumber: Number(num),
      phaseName: data.name,
      milestones: data.items.sort((a, b) => a.orderIndex - b.orderIndex),
    }));
  }, [project.milestones]);

  // Quick milestone status toggle
  const handleToggleMilestone = async (m: Milestone, nextStatus: 'Pending' | 'In Progress' | 'Completed') => {
    setUpdatingMilestoneId(m.id);
    try {
      const res = await fetch(`/api/milestones/${m.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          userRole,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Milestone Updated', `"${m.title}" set to ${nextStatus}`);
        onRefresh();
      } else {
        toast.error('Update Failed', data.error || 'Server rejected change');
      }
    } catch {
      toast.error('Network Error', 'Failed to update milestone');
    } finally {
      setUpdatingMilestoneId(null);
    }
  };

  // Reassign milestone to user
  const handleAssignMilestone = async (m: Milestone, assignedTo: string) => {
    try {
      const res = await fetch(`/api/milestones/${m.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignedTo,
          userRole,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Assignee Updated', `"${m.title}" assigned to ${assignedTo}`);
        onRefresh();
      }
    } catch {
      toast.error('Error', 'Failed to update milestone assignee');
    }
  };

  // Delete project
  const [isDeleting, setIsDeleting] = useState(false);
  const handleDeleteProject = async () => {
    if (
      !confirm(
        `Are you sure you want to delete project track "${project.code} — ${project.location?.name}"?\n\nThis will permanently remove the project and all 21 milestone tasks.`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Project Deleted', `Track ${project.code} has been deleted.`);
        onBack();
        onRefresh();
      } else {
        toast.error('Delete Failed', data.error || 'Server rejected delete request');
      }
    } catch {
      toast.error('Network Error', 'Failed to reach server');
    } finally {
      setIsDeleting(false);
    }
  };

  // Dynamically compute the project's timeline window, months, and waterfall bars
  const timelineData = useMemo(() => {
    const list = project.milestones ? [...project.milestones].sort((a, b) => a.orderIndex - b.orderIndex) : [];

    // Determine active date bounds
    const now = new Date();
    let minMs = project.startDate ? new Date(project.startDate).getTime() : now.getTime();
    let maxMs = project.fixedTargetDate ? new Date(project.fixedTargetDate).getTime() : now.getTime() + 180 * 86400000;

    if (isNaN(minMs)) minMs = now.getTime();
    if (isNaN(maxMs)) maxMs = minMs + 180 * 86400000;

    list.forEach((m) => {
      if (m.actualDate) {
        const t = new Date(m.actualDate).getTime();
        if (!isNaN(t)) {
          minMs = Math.min(minMs, t);
          maxMs = Math.max(maxMs, t);
        }
      }
      if (m.plannedDate) {
        const t = new Date(m.plannedDate).getTime();
        if (!isNaN(t)) {
          minMs = Math.min(minMs, t);
          maxMs = Math.max(maxMs, t);
        }
      }
    });

    const startD = new Date(minMs);
    const endD = new Date(maxMs);

    // Timeline start: 1st day of start month (00:00:00)
    const timelineStart = new Date(startD.getFullYear(), startD.getMonth(), 1, 0, 0, 0);
    // Timeline end: Last day of target month + 1 buffer month (23:59:59)
    const timelineEnd = new Date(endD.getFullYear(), endD.getMonth() + 2, 0, 23, 59, 59);

    const totalMs = Math.max(86400000 * 30, timelineEnd.getTime() - timelineStart.getTime());

    // Generate monthly headers
    const months: TimelineMonth[] = [];
    const cur = new Date(timelineStart);
    const currentYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const targetYm = project.fixedTargetDate ? project.fixedTargetDate.slice(0, 7) : '';

    while (cur <= timelineEnd) {
      const y = cur.getFullYear();
      const m = cur.getMonth();
      const ym = `${y}-${String(m + 1).padStart(2, '0')}`;
      const label = cur.toLocaleDateString('en-US', { month: 'short' }) + '-' + String(y).slice(-2);

      months.push({
        id: ym,
        label,
        year: y,
        month: m,
        isCurrent: ym === currentYm,
        isTarget: ym === targetYm,
      });

      cur.setMonth(cur.getMonth() + 1);
    }

    // Ensure at least 6 months minimum
    while (months.length < 6) {
      const last = months[months.length - 1];
      const nextDate = new Date(last.year, last.month + 1, 1);
      const y = nextDate.getFullYear();
      const m = nextDate.getMonth();
      const ym = `${y}-${String(m + 1).padStart(2, '0')}`;
      const label = nextDate.toLocaleDateString('en-US', { month: 'short' }) + '-' + String(y).slice(-2);
      months.push({
        id: ym,
        label,
        year: y,
        month: m,
        isCurrent: ym === currentYm,
        isTarget: ym === targetYm,
      });
    }

    // Precalculate waterfall milestone positions
    let prevFinishDate: Date = project.startDate && !isNaN(new Date(project.startDate).getTime())
      ? new Date(project.startDate)
      : new Date(timelineStart);

    const milestoneBars = new Map<
      string,
      {
        startDate: Date;
        endDate: Date;
        durationDays: number;
        leftPercent: number;
        widthPercent: number;
        isEstimated: boolean;
      }
    >();

    list.forEach((m, idx) => {
      let mEnd: Date | null = null;
      let isEstimated = false;

      if (m.actualDate) {
        const d = new Date(m.actualDate);
        if (!isNaN(d.getTime())) mEnd = d;
      }
      if (!mEnd && m.plannedDate) {
        const d = new Date(m.plannedDate);
        if (!isNaN(d.getTime())) mEnd = d;
      }

      if (!mEnd) {
        isEstimated = true;
        const days = m.benchmarkDays || 5;
        mEnd = new Date(prevFinishDate.getTime() + days * 86400000);
      }

      let mStart: Date;
      if (idx === 0) {
        mStart = project.startDate && !isNaN(new Date(project.startDate).getTime())
          ? new Date(project.startDate)
          : new Date(mEnd.getTime() - (m.benchmarkDays || 7) * 86400000);
      } else {
        if (prevFinishDate < mEnd) {
          mStart = new Date(prevFinishDate);
        } else {
          mStart = new Date(mEnd.getTime() - Math.max(1, m.benchmarkDays || 3) * 86400000);
        }
      }

      if (mStart.getTime() > mEnd.getTime()) {
        mStart = new Date(mEnd.getTime() - (m.benchmarkDays || 1) * 86400000);
      }

      prevFinishDate = new Date(mEnd);

      const startMs = Math.max(timelineStart.getTime(), mStart.getTime());
      const endMs = Math.min(timelineEnd.getTime(), mEnd.getTime());
      const leftPercent = Math.max(0, Math.min(96, ((startMs - timelineStart.getTime()) / totalMs) * 100));
      const rawW = ((endMs - startMs) / totalMs) * 100;
      const widthPercent = Math.max(2.5, Math.min(100 - leftPercent, rawW));
      const durationDays = Math.max(1, Math.round((mEnd.getTime() - mStart.getTime()) / 86400000));

      milestoneBars.set(m.id, {
        startDate: mStart,
        endDate: mEnd,
        durationDays,
        leftPercent,
        widthPercent,
        isEstimated,
      });
    });

    const todayMs = now.getTime();
    const todayPercent = ((todayMs - timelineStart.getTime()) / totalMs) * 100;

    return {
      timelineStart,
      timelineEnd,
      totalMs,
      months,
      milestoneBars,
      todayPercent,
      isTodayInRange: todayPercent >= 0 && todayPercent <= 100,
    };
  }, [project.startDate, project.fixedTargetDate, project.milestones]);

  return (
    <div className="w-full space-y-5">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="group inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-black transition-colors cursor-pointer py-1"
          title="Return to Projects List"
        >
          <div className="w-6 h-6 rounded-md bg-white border border-slate-200 group-hover:border-slate-400 group-hover:bg-slate-50 flex items-center justify-center transition-all shadow-2xs">
            <IconChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span>Projects</span>
          <span className="text-slate-300">/</span>
          <span className="font-mono text-slate-700">{project.code}</span>
        </button>

        <div className="flex items-center space-x-2">
          {/* Edit Drawer Button */}
          <button
            onClick={onOpenEditDrawer}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-2xs"
          >
            <span>{isAdmin ? 'Edit Settings' : 'View Specs'}</span>
          </button>

          {/* Admin Delete Project Button */}
          {isAdmin && (
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteProject}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-rose-600 hover:bg-rose-50/80 border border-transparent hover:border-rose-200 transition-all cursor-pointer disabled:opacity-50"
              title="Delete this project track"
            >
              <IconTrash className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Delete Track</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Project Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left: Project Identity */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-slate-900 text-white font-bold tracking-tight">
                {project.code}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/70">
                {project.brand?.name || 'River EV'}
              </span>
              <span className="px-2.5 py-0.5 rounded-md border text-xs font-semibold bg-slate-50 text-slate-700 border-slate-200">
                {project.facilityType}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${
                  project.scheduleHealth === 'On Track' || project.scheduleHealth === 'Completed'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : project.scheduleHealth === 'Watchlist'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {project.scheduleHealth || 'On Track'}
              </span>
            </div>

            <div className="flex items-baseline space-x-3">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {project.location?.name}
              </h1>
              <span className="text-sm font-medium text-slate-400">
                Kerala
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400">Current Status:</span>
                <span className="font-semibold text-slate-800">{project.currentStatus}</span>
              </div>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400">Target Date:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {project.fixedTargetDate
                    ? new Date(project.fixedTargetDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '31 Mar 2027'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Progress Metric Pill */}
          <div className="flex items-center space-x-4 bg-slate-50 border border-slate-200/80 rounded-xl px-5 py-3.5 self-start lg:self-auto min-w-[200px]">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Overall Progress
                </span>
                <span className="font-mono font-black text-slate-900 text-sm">
                  {Math.round(project.workPercentage)}%
                </span>
              </div>
              <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    project.workPercentage === 100 ? 'bg-emerald-500' : 'bg-slate-900'
                  }`}
                  style={{ width: `${project.workPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modern Clean Navigation Tabs */}
        <div className="flex items-center space-x-1.5 mt-6 pt-3 border-t border-slate-100 overflow-x-auto no-scrollbar">
          {[
            { id: 'gantt', label: 'Gantt Timeline' },
            { id: 'milestones', label: 'Milestones', count: project.milestones?.length || 21 },
            { id: 'blockers', label: 'Bottlenecks', count: project.blockers?.length || 0 },
            { id: 'audit', label: 'Audit Trail', count: project.auditLogs?.length || 0 },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'gantt' | 'milestones' | 'blockers' | 'audit')}
                className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Gantt Timeline */}
      {activeTab === 'gantt' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          {/* Card Header & Legend */}
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  Rollout Waterfall Timeline ({timelineData.months[0]?.label} – {timelineData.months[timelineData.months.length - 1]?.label})
                </h2>
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white shadow-2xs">
                  {timelineData.months.length} Months
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Sequential phase execution track for {project.location?.name} ({project.code})
              </p>
            </div>

            {/* Status Legend */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
                <span className="text-slate-800">Completed</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-100" />
                <span className="text-slate-800">In Progress</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 border border-slate-400" />
                <span className="text-slate-700">Pending</span>
              </span>
              {timelineData.isTodayInRange && (
                <span className="flex items-center space-x-1.5 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-rose-700 font-mono text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span>Today Line</span>
                </span>
              )}
            </div>
          </div>

          {/* Unified Gantt Canvas with Sticky Left Pane & Aligned Columns */}
          <div className="overflow-x-auto select-none bg-white">
            <div style={{ minWidth: `${Math.max(1050, 400 + timelineData.months.length * 115)}px` }}>
              {/* Header Row */}
              <div className="flex items-stretch border-b border-slate-200 bg-slate-100/95 h-10 text-[11px] font-bold">
                {/* Left Frozen Table Header */}
                <div className="w-[400px] shrink-0 sticky left-0 z-30 bg-slate-100 border-r-2 border-slate-300 px-3 flex items-center shadow-[2px_0_6px_rgba(0,0,0,0.04)]">
                  <span className="w-14 text-center font-mono font-bold text-slate-800">SI No.</span>
                  <span className="flex-1 font-bold text-slate-800 uppercase tracking-wider pl-1">Milestone Task Name</span>
                  <span className="w-24 text-center font-bold text-slate-800 uppercase tracking-wider">Assignee</span>
                  <span className="w-24 text-right font-bold text-slate-800 uppercase tracking-wider pr-2">Target Date</span>
                </div>

                {/* Right Month Columns Header */}
                <div
                  className="flex-1 grid relative"
                  style={{ gridTemplateColumns: `repeat(${timelineData.months.length}, minmax(0, 1fr))` }}
                >
                  {timelineData.months.map((m) => (
                    <div
                      key={m.id}
                      className={`py-2 px-1 text-center font-mono text-[11px] font-bold border-r border-slate-200 flex flex-col justify-center ${
                        m.isCurrent
                          ? 'bg-rose-50 text-rose-950 border-rose-300 font-black'
                          : m.isTarget
                          ? 'bg-amber-50 text-amber-900 border-amber-300'
                          : 'text-slate-700'
                      }`}
                    >
                      <span>{m.label}</span>
                      {m.isCurrent && (
                        <span className="text-[9px] text-rose-600 font-sans uppercase font-bold tracking-tight">Today</span>
                      )}
                    </div>
                  ))}

                  {/* Red Today Marker Indicator in Header */}
                  {timelineData.isTodayInRange && (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10 pointer-events-none"
                      style={{ left: `${timelineData.todayPercent}%` }}
                    />
                  )}
                </div>
              </div>

              {/* Phases and Milestone Waterfall Breakdown */}
              <div className="divide-y divide-slate-100">
                {phases.map((phase) => {
                  const completedInPhase = phase.milestones.filter((m) => m.status === 'Completed').length;
                  const totalInPhase = phase.milestones.length;

                  // Find phase envelope bounds
                  const phaseBars = phase.milestones
                    .map((m) => timelineData.milestoneBars.get(m.id))
                    .filter(Boolean) as Array<{ leftPercent: number; widthPercent: number }>;
                  
                  const phaseLeft = phaseBars.length > 0 ? Math.min(...phaseBars.map((b) => b.leftPercent)) : 0;
                  const phaseRight = phaseBars.length > 0 ? Math.max(...phaseBars.map((b) => b.leftPercent + b.widthPercent)) : 0;
                  const phaseWidth = Math.max(2, phaseRight - phaseLeft);

                  return (
                    <div key={phase.phaseNumber} className="bg-white">
                      {/* Phase Summary Row */}
                      <div className="flex items-stretch bg-slate-50/90 border-y border-slate-200/90 h-9 font-bold text-xs">
                        {/* Left Sticky Phase Name */}
                        <div className="w-[400px] shrink-0 sticky left-0 z-30 bg-slate-50 border-r-2 border-slate-300 px-3 flex items-center justify-between shadow-[2px_0_6px_rgba(0,0,0,0.03)]">
                          <span className="font-black text-slate-900 truncate tracking-tight">{phase.phaseName}</span>
                          <span className="text-[10px] font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {completedInPhase} / {totalInPhase} Done
                          </span>
                        </div>

                        {/* Right Phase Envelope Track */}
                        <div className="flex-1 relative h-9 flex items-center px-1">
                          {/* Grid Column Lines */}
                          <div
                            className="absolute inset-0 grid pointer-events-none divide-x divide-slate-200/50"
                            style={{ gridTemplateColumns: `repeat(${timelineData.months.length}, minmax(0, 1fr))` }}
                          >
                            {timelineData.months.map((m) => (
                              <div key={m.id} className="h-full" />
                            ))}
                          </div>

                          {/* Today Line */}
                          {timelineData.isTodayInRange && (
                            <div
                              className="absolute top-0 bottom-0 w-px border-l-2 border-rose-500/70 border-dashed pointer-events-none z-10"
                              style={{ left: `${timelineData.todayPercent}%` }}
                            />
                          )}

                          {/* Phase Envelope Span Bar */}
                          {phaseBars.length > 0 && (
                            <div
                              className="absolute h-5 rounded-md bg-slate-200/70 border border-slate-300/80 flex items-center px-2 pointer-events-none"
                              style={{
                                left: `${phaseLeft}%`,
                                width: `${phaseWidth}%`,
                              }}
                            >
                              <span className="text-[10px] font-mono font-bold text-slate-700 truncate">
                                {phase.phaseName.replace(/^\d+\.\s*/, '')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Milestones inside Phase */}
                      {phase.milestones.map((m) => {
                        const barData = timelineData.milestoneBars.get(m.id);
                        const isComplete = m.status === 'Completed';
                        const isInProgress = m.status === 'In Progress';
                        const isOverdue = !isComplete && barData && barData.endDate.getTime() < Date.now();

                        return (
                          <div
                            key={m.id}
                            className="flex items-stretch hover:bg-slate-50/80 transition-colors border-b border-slate-100 h-11 text-xs"
                          >
                            {/* Left Sticky Milestone Info */}
                            <div className="w-[400px] shrink-0 sticky left-0 z-20 bg-white hover:bg-slate-50/80 border-r-2 border-slate-300 px-3 flex items-center shadow-[2px_0_6px_rgba(0,0,0,0.03)]">
                              {/* Sl. No. Dark & Bold */}
                              <span className="w-14 text-center font-mono font-black text-slate-900 text-xs">
                                {m.orderIndex}
                              </span>

                              {/* Task Title */}
                              <div className="flex-1 min-w-0 pr-2">
                                <p className="font-semibold text-slate-900 truncate" title={m.title}>
                                  {m.title}
                                </p>
                              </div>

                              {/* Assignee Badge */}
                              <div className="w-24 shrink-0 flex justify-center">
                                {m.assignedTo && m.assignedTo !== 'unassigned' ? (() => {
                                  const av = getUserAvatarInfo(m.assignedTo);
                                  const isMe = m.assignedTo === user?.username;
                                  return (
                                    <span
                                      className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono border shrink-0 ${
                                        isMe
                                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                                          : 'bg-slate-100 text-slate-700 border-slate-200 font-medium'
                                      }`}
                                      title={`Assigned to ${m.assignedTo}`}
                                    >
                                      <span
                                        className={`w-3.5 h-3.5 rounded-full inline-flex items-center justify-center text-[9px] font-black shrink-0 ${av.bg}`}
                                      >
                                        {av.text}
                                      </span>
                                      <span className="truncate max-w-[50px]">@{m.assignedTo}</span>
                                    </span>
                                  );
                                })() : (
                                  <span className="text-[10px] font-mono text-slate-400 italic">Unassigned</span>
                                )}
                              </div>

                              {/* Target / Completed Date */}
                              <div className="w-24 shrink-0 text-right pr-2">
                                {m.actualDate ? (
                                  <span className="font-mono text-[11px] font-bold text-emerald-700">
                                    {new Date(m.actualDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                  </span>
                                ) : m.plannedDate ? (
                                  <span className={`font-mono text-[11px] font-bold ${isOverdue ? 'text-rose-600' : 'text-slate-800'}`}>
                                    {new Date(m.plannedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                  </span>
                                ) : (
                                  <span className="font-mono text-[10px] text-slate-400 italic">Est. {m.benchmarkDays}d</span>
                                )}
                              </div>
                            </div>

                            {/* Right Timeline Canvas Row with Synchronized Grid */}
                            <div className="flex-1 relative h-11 flex items-center px-1">
                              {/* Background Month Column Lines (100% matched to Header) */}
                              <div
                                className="absolute inset-0 grid pointer-events-none divide-x divide-slate-100"
                                style={{ gridTemplateColumns: `repeat(${timelineData.months.length}, minmax(0, 1fr))` }}
                              >
                                {timelineData.months.map((mo) => (
                                  <div key={mo.id} className="h-full" />
                                ))}
                              </div>

                              {/* Vertical Today Line */}
                              {timelineData.isTodayInRange && (
                                <div
                                  className="absolute top-0 bottom-0 w-px border-l-2 border-rose-500/70 border-dashed pointer-events-none z-10"
                                  style={{ left: `${timelineData.todayPercent}%` }}
                                />
                              )}

                              {/* True Duration Gantt Bar */}
                              {barData && (
                                <div
                                  className={`absolute h-6 rounded-md px-2 flex items-center space-x-1.5 shadow-2xs text-[10px] transition-all cursor-pointer group ${
                                    isComplete
                                      ? 'bg-emerald-500 text-white font-bold border border-emerald-600 hover:bg-emerald-600'
                                      : isInProgress
                                      ? 'bg-amber-500 text-white font-bold border border-amber-600 hover:bg-amber-600'
                                      : isOverdue
                                      ? 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200 font-semibold'
                                      : barData.isEstimated
                                      ? 'bg-slate-50 text-slate-500 border border-dashed border-slate-300'
                                      : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 hover:border-slate-400 font-medium'
                                  }`}
                                  style={{
                                    left: `${barData.leftPercent}%`,
                                    width: `${barData.widthPercent}%`,
                                  }}
                                  onClick={() => {
                                    const next = isComplete ? 'Pending' : 'Completed';
                                    handleToggleMilestone(m, next);
                                  }}
                                  title={`${m.orderIndex}. ${m.title}\nStatus: ${m.status}\nStart: ${barData.startDate.toLocaleDateString('en-GB')}\nTarget: ${barData.endDate.toLocaleDateString('en-GB')}\nDuration: ${barData.durationDays} days\nAssignee: @${m.assignedTo || 'unassigned'}\n\n(Click to toggle status)`}
                                >
                                  {isComplete && <IconCheck className="w-3 h-3 shrink-0" />}
                                  {isInProgress && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping shrink-0" />
                                  )}
                                  <span className="truncate">
                                    {isComplete ? 'Done' : isInProgress ? 'In Progress' : `${barData.durationDays}d`}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Milestone Checklist */}
      {activeTab === 'milestones' && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              21 Sequential Checkpoints
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Role: {userRole}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4 w-12 text-center">#</th>
                  <th className="py-2.5 px-4">Milestone Title</th>
                  <th className="py-2.5 px-4">Phase</th>
                  <th className="py-2.5 px-4 w-32">Status</th>
                  <th className="py-2.5 px-4 w-36">Assignee</th>
                  <th className="py-2.5 px-4">Actual Date</th>
                  <th className="py-2.5 px-4">Benchmark</th>
                  <th className="py-2.5 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {project.milestones?.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-slate-400">
                      {m.orderIndex}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {m.title}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {m.phaseName}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={m.status}
                        onChange={(e) =>
                          handleToggleMilestone(
                            m,
                            e.target.value as 'Pending' | 'In Progress' | 'Completed'
                          )
                        }
                        disabled={updatingMilestoneId === m.id}
                        className={`text-xs font-bold rounded px-2 py-1 border cursor-pointer ${
                          m.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : m.status === 'In Progress'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-rose-50 text-rose-700 border-rose-300'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      {isAdmin ? (
                        <select
                          value={m.assignedTo || 'user1'}
                          onChange={(e) => handleAssignMilestone(m, e.target.value)}
                          className="text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 font-semibold text-slate-800 cursor-pointer w-full shadow-2xs"
                        >
                          {availableUsers.map((u) => (
                            <option key={u.value} value={u.value}>
                              {u.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        (() => {
                          const av = getUserAvatarInfo(m.assignedTo || 'unassigned');
                          const isMe = m.assignedTo === user?.username;
                          return (
                            <span
                              className={`inline-flex items-center space-x-1.5 px-2 py-1 rounded-md text-xs font-semibold ${
                                isMe
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold'
                                  : 'bg-slate-50 text-slate-700 border border-slate-200'
                              }`}
                            >
                              <span
                                className={`w-4 h-4 rounded-full inline-flex items-center justify-center text-[10px] font-black shrink-0 ${av.bg}`}
                              >
                                {av.text}
                              </span>
                              <span>@{m.assignedTo || 'unassigned'}</span>
                              {isMe && (
                                <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-bold">
                                  You
                                </span>
                              )}
                            </span>
                          );
                        })()
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {m.actualDate
                        ? new Date(m.actualDate).toLocaleDateString('en-GB')
                        : '—'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {m.benchmarkDays ? `${m.benchmarkDays}d` : '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {m.remarks || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Bottlenecks (Blockers) */}
      {activeTab === 'blockers' && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Project Bottlenecks & Escalations
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Blockers affecting {project.location?.name} ({project.code})
              </p>
            </div>
          </div>

          {project.blockers?.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No active bottlenecks recorded for this project track.
            </div>
          ) : (
            <div className="space-y-3">
              {project.blockers?.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 border border-slate-200 rounded-lg bg-slate-50/50 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.severity === 'Critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {b.severity}
                      </span>
                      <span className="font-bold text-sm text-slate-900">{b.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">[{b.category}]</span>
                    </div>
                    <p className="text-xs text-slate-600">{b.description}</p>
                    <div className="text-[10px] text-slate-400 font-mono pt-1">
                      Logged: {new Date(b.loggedAt).toLocaleDateString('en-GB')} • Status: <strong>{b.status}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Audit History */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs p-5 space-y-3">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
            Audit Activity Trail
          </h2>
          {project.auditLogs?.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No audit logs recorded for this track yet.
            </div>
          ) : (
            <div className="space-y-2">
              {project.auditLogs?.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-slate-50 rounded border border-slate-100 text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-black font-mono">[{log.userRole}]</span>{' '}
                    <span className="text-slate-700">{log.details}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 whitespace-nowrap ml-4">
                    {new Date(log.timestamp).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
