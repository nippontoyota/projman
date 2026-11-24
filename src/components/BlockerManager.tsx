'use client';

import React, { useState, useMemo } from 'react';
import { Project, Blocker, UserRole } from '@/types';
import {
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface BlockerManagerProps {
  projects: Project[];
  userRole: UserRole;
  onSelectProject: (p: Project) => void;
  onRefresh: () => void;
}

export const BlockerManager: React.FC<BlockerManagerProps> = ({
  projects,
  userRole,
  onSelectProject,
  onRefresh,
}) => {
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const toast = useToast();

  const allBlockers = useMemo(() => {
    const list: (Blocker & { projectDetails: Project })[] = [];
    projects.forEach((p) => {
      p.blockers.forEach((b) => {
        list.push({ ...b, projectDetails: p });
      });
    });
    return list;
  }, [projects]);

  const filteredBlockers = useMemo(() => {
    return allBlockers.filter((b) => {
      if (categoryFilter !== 'ALL' && b.category !== categoryFilter) return false;
      if (severityFilter !== 'ALL' && b.severity !== severityFilter) return false;
      if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
      return true;
    });
  }, [allBlockers, categoryFilter, severityFilter, statusFilter]);

  const handleResolve = async (blockerId: string) => {
    try {
      const res = await fetch(`/api/blockers/${blockerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Resolved', userRole }),
      });
      if (res.ok) {
        toast.success('Blocker Resolved', 'Bottleneck marked resolved and unblocked');
        onRefresh();
      } else {
        toast.error('Resolve Failed', 'Could not update blocker status');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network Error', 'Failed to reach blocker endpoint');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Dealership Bottlenecks & Escalations Radar
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Active delays categorized by Landlord, River OEM approvals, Legal, and Contractor execution.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-1.5 px-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer font-medium"
            >
              <option value="ALL">All Categories</option>
              <option value="Landlord">Landlord Negotiation</option>
              <option value="River OEM">River OEM Approvals</option>
              <option value="Municipal / Legal">Municipal / Legal</option>
              <option value="Civil Contractor">Civil Contractor</option>
              <option value="Internal Management">Internal Management</option>
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="py-1.5 px-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer font-medium"
            >
              <option value="ALL">All Severities</option>
              <option value="Critical">Critical Only</option>
              <option value="Major">Major</option>
              <option value="Moderate">Moderate</option>
              <option value="Minor">Minor</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer font-medium"
            >
              <option value="ALL">All Status</option>
              <option value="Open">Open Issues</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Blockers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBlockers.map((blk) => (
          <div
            key={blk.id}
            className={`p-4 rounded-xl border shadow-xs space-y-2.5 transition-all ${
              blk.status === 'Resolved'
                ? 'bg-slate-50 border-slate-200 opacity-60'
                : 'bg-white border-slate-200 border-l-4 border-l-rose-500 hover:shadow-sm'
            }`}
          >
            {/* Top Row: Location & Category */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-sm">
                  {blk.projectDetails.location.name}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  ({blk.projectDetails.facilityType})
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                {blk.category}
              </span>
            </div>

            {/* Title & Description */}
            <div>
              <h3 className="font-semibold text-slate-900 text-xs sm:text-sm">{blk.title}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {blk.description}
              </p>
            </div>

            {/* Metadata Footer */}
            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-500 text-[11px]">Severity:</span>
                <span className="font-bold text-rose-700 text-[11px] font-mono">
                  {blk.severity}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {blk.status !== 'Resolved' ? (
                  <button
                    onClick={() => handleResolve(blk.id)}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    Mark Resolved
                  </button>
                ) : (
                  <span className="text-xs text-emerald-700 font-semibold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resolved</span>
                  </span>
                )}

                <button
                  onClick={() => onSelectProject(blk.projectDetails)}
                  className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                  title="View Project Details"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBlockers.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-sm">
          No bottlenecks found matching the selected filters.
        </div>
      )}
    </div>
  );
};
