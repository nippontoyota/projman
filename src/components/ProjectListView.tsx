'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Project, FacilityType, ProjectStatus, ScheduleHealth } from '@/types';
import {
  IconChevronRight,
  IconCheck,
  IconFacility,
  IconTrash,
} from '@/components/ui/Icons';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

interface ProjectListViewProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onOpenCreateModal?: () => void;
  onRefresh?: () => void;
}

export const ProjectListView: React.FC<ProjectListViewProps> = ({
  projects,
  onSelectProject,
  onOpenCreateModal,
  onRefresh,
}) => {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteProject = async (project: Project) => {
    if (
      !confirm(
        `Are you sure you want to delete project track "${project.code} — ${project.location?.name}" (${project.facilityType})?\n\nThis will permanently remove the project and all 21 milestone tasks.`
      )
    ) {
      return;
    }

    setDeletingId(project.id);
    try {
      const res = await fetch(`/api/projects/${project.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Project Deleted', `Track ${project.code} has been deleted.`);
        if (onRefresh) onRefresh();
      } else {
        toast.error('Delete Failed', data.error || 'Server rejected delete request');
      }
    } catch {
      toast.error('Network Error', 'Failed to reach server');
    } finally {
      setDeletingId(null);
    }
  };

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = projects.length;
    const commissioned = projects.filter((p) => p.currentStatus === 'Commissioned').length;
    const delayed = projects.filter(
      (p) => p.scheduleHealth === 'Delayed (>30d)' || p.scheduleHealth === 'Action Needed'
    ).length;
    const onTrack = projects.filter(
      (p) => p.scheduleHealth === 'On Track' || p.scheduleHealth === 'Completed'
    ).length;
    const avgProgress =
      total > 0 ? Math.round(projects.reduce((acc, p) => acc + p.workPercentage, 0) / total) : 0;

    return { total, commissioned, delayed, onTrack, avgProgress };
  }, [projects]);

  const facilityBadges: Record<string, string> = {
    Sales: 'bg-blue-50 text-blue-700 border-blue-200',
    Service: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Stock Yard': 'bg-purple-50 text-purple-700 border-purple-200',
    'Sales & Service': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  const healthBadges: Record<string, string> = {
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'On Track': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Watchlist: 'bg-amber-50 text-amber-700 border-amber-200',
    'Delayed (>30d)': 'bg-rose-50 text-rose-700 border-rose-200',
    'Action Needed': 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner / Metrics Cards - Spacious & Clean */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Tracks */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-colors">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total Showroom Tracks
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-2 tracking-tight">
            {metrics.total}
          </div>
          <div className="text-xs text-slate-500 mt-1">Kerala Dealership Rollouts</div>
        </div>

        {/* Commissioned */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-colors">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Commissioned
          </div>
          <div className="text-3xl sm:text-4xl font-black text-emerald-600 mt-2 tracking-tight">
            {metrics.commissioned}
          </div>
          <div className="text-xs text-slate-500 mt-1">Live & Fully Operational</div>
        </div>

        {/* Portfolio Progress */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-colors">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Average Progress
          </div>
          <div className="text-3xl sm:text-4xl font-black text-blue-600 mt-2 tracking-tight">
            {metrics.avgProgress}%
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all"
              style={{ width: `${metrics.avgProgress}%` }}
            />
          </div>
        </div>

        {/* Action Needed / Delayed */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-colors">
          <div className="text-xs font-bold text-rose-600 uppercase tracking-wider">
            Delayed / Attention
          </div>
          <div className="text-3xl sm:text-4xl font-black text-rose-600 mt-2 tracking-tight">
            {metrics.delayed}
          </div>
          <div className="text-xs text-slate-500 mt-1">Timeline slips or bottlenecks</div>
        </div>
      </div>

      {/* Projects List Table - Clean, Large & Spacious */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Dealership Tracks ({projects.length})
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Click any project row to open its Gantt timeline
          </span>
        </div>

        {projects.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <IconFacility className="w-6 h-6" />
            </div>
            <p className="text-base font-bold text-slate-800">No Dealership Project Tracks</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Get started by creating a new project track with 21 milestone tasks.
            </p>
            {onOpenCreateModal && (
              <button
                type="button"
                onClick={onOpenCreateModal}
                className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                <span>+ Create First Track</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[1050px]">
              <thead className="bg-slate-100/90 border-b border-slate-200">
                <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6 w-14 text-center whitespace-nowrap">#</th>
                  <th className="py-3.5 px-6 whitespace-nowrap">Code</th>
                  <th className="py-3.5 px-6 whitespace-nowrap">Location</th>
                  <th className="py-3.5 px-6 whitespace-nowrap">Facility</th>
                  <th className="py-3.5 px-6 whitespace-nowrap">Current Status</th>
                  <th className="py-3.5 px-6 whitespace-nowrap">Health</th>
                  <th className="py-3.5 px-6 w-56 whitespace-nowrap">Progress</th>
                  <th className="py-3.5 px-6 whitespace-nowrap">Target Date</th>
                  <th className="py-3.5 px-6 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {projects.map((project, idx) => {
                  const facilityBadge =
                    facilityBadges[project.facilityType] || 'bg-slate-100 text-slate-700 border-slate-200';
                  const healthBadge =
                    healthBadges[project.scheduleHealth] || 'bg-slate-100 text-slate-700 border-slate-200';

                  const openBlockersCount =
                    project.blockers?.filter((b) => b.status === 'Open').length || 0;

                  return (
                    <tr
                      key={project.id}
                      onClick={() => onSelectProject(project)}
                      className="hover:bg-slate-50/90 transition-colors cursor-pointer group"
                    >
                      {/* Index */}
                      <td className="py-4 px-6 text-center font-mono text-slate-400 text-xs whitespace-nowrap">
                        {idx + 1}
                      </td>

                      {/* Code & Brand */}
                      <td className="py-4 px-6 font-mono font-bold text-black whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="inline-block whitespace-nowrap px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 group-hover:border-black transition-colors text-xs font-bold">
                            {project.code}
                          </span>
                          {project.brand?.name && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/70">
                              {project.brand.name}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="font-bold text-base text-slate-900 flex items-center space-x-2">
                          <span>{project.location?.name}</span>
                          {openBlockersCount > 0 && (
                            <span
                              className="w-2 h-2 rounded-full bg-amber-500"
                              title={`${openBlockersCount} open bottleneck(s)`}
                            />
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">Kerala District</div>
                      </td>

                      {/* Facility */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={`inline-block whitespace-nowrap px-2.5 py-1 rounded-md border text-xs font-semibold tracking-tight ${facilityBadge}`}
                        >
                          {project.facilityType}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 font-medium text-slate-800 text-sm whitespace-nowrap">
                        {project.currentStatus}
                      </td>

                      {/* Health */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={`inline-block whitespace-nowrap px-2.5 py-1 rounded-md border text-xs font-bold ${healthBadge}`}
                        >
                          {project.scheduleHealth}
                        </span>
                      </td>

                      {/* Progress */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden w-28">
                            <div
                              className={`h-full rounded-full transition-all ${
                                project.workPercentage === 100
                                  ? 'bg-emerald-500'
                                  : project.workPercentage > 50
                                  ? 'bg-blue-600'
                                  : 'bg-slate-700'
                              }`}
                              style={{ width: `${project.workPercentage}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-700 w-10 text-right">
                            {Math.round(project.workPercentage)}%
                          </span>
                        </div>
                      </td>

                      {/* Target Date */}
                      <td className="py-4 px-6 font-mono text-xs text-slate-600 font-semibold whitespace-nowrap">
                        {project.commissionedDate
                          ? new Date(project.commissionedDate).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : project.fixedTargetDate
                          ? new Date(project.fixedTargetDate).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '31 Mar 2027'}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => onSelectProject(project)}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 group-hover:bg-black group-hover:text-white rounded-md transition-all shadow-2xs cursor-pointer"
                          >
                            <span>Open Gantt</span>
                            <IconChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </button>

                          {isAdmin && (
                            <button
                              type="button"
                              disabled={deletingId === project.id}
                              onClick={() => handleDeleteProject(project)}
                              title={`Delete ${project.code}`}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer border border-transparent hover:border-rose-200 disabled:opacity-50"
                            >
                              <IconTrash className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
