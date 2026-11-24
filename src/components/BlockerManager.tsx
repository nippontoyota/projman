'use client';

import React, { useState, useMemo } from 'react';
import { Project, Blocker, UserRole } from '@/types';
import { IconEscalation, IconCheck } from '@/components/ui/Icons';
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect';
import { useToast } from '@/context/ToastContext';

interface BlockerManagerProps {
  projects: Project[];
  userRole: UserRole;
  onSelectProject: (p: Project) => void;
  onRefresh: () => void;
}

const CATEGORY_OPTIONS: SelectOption[] = [
  { value: 'ALL', label: 'All Categories' },
  { value: 'Landlord', label: 'Landlord Negotiation' },
  { value: 'River OEM', label: 'River OEM Approvals' },
  { value: 'Municipal / Legal', label: 'Municipal / Legal' },
  { value: 'Civil Contractor', label: 'Civil Contractor' },
  { value: 'Internal Management', label: 'Internal Management' },
];

const SEVERITY_OPTIONS: SelectOption[] = [
  { value: 'ALL', label: 'All Severities' },
  { value: 'Critical', label: 'Critical Only' },
  { value: 'Major', label: 'Major' },
  { value: 'Moderate', label: 'Moderate' },
  { value: 'Minor', label: 'Minor' },
];

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'ALL', label: 'All Status' },
  { value: 'Open', label: 'Open Issues' },
  { value: 'Resolved', label: 'Resolved' },
];

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
    <div className="space-y-3">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <h2 className="text-sm font-bold text-black tracking-tight">
            Bottlenecks
          </h2>
          <span className="text-xs font-mono text-slate-400">
            ({filteredBlockers.filter((b) => b.status !== 'Resolved').length} open)
          </span>
        </div>

        {/* In-House Custom Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <CustomSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={CATEGORY_OPTIONS}
            size="sm"
            className="w-44"
          />

          <CustomSelect
            value={severityFilter}
            onChange={setSeverityFilter}
            options={SEVERITY_OPTIONS}
            size="sm"
            className="w-36"
          />

          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS}
            size="sm"
            className="w-32"
          />
        </div>
      </div>

      {/* High-Density Escalations Table */}
      <div className="bg-white border border-slate-200 rounded-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
                <th className="py-2.5 px-4 w-48">Location / Track</th>
                <th className="py-2.5 px-4">Bottleneck / Impediment</th>
                <th className="py-2.5 px-4 w-40">Category</th>
                <th className="py-2.5 px-4 w-28 text-center">Severity</th>
                <th className="py-2.5 px-4 w-28 text-center">Status</th>
                <th className="py-2.5 px-4 w-40 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBlockers.map((blk) => (
                <tr
                  key={blk.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    blk.status === 'Resolved' ? 'opacity-60 bg-slate-50/30' : ''
                  }`}
                >
                  <td className="py-3 px-4 align-top">
                    <div className="font-bold text-slate-900">
                      {blk.projectDetails.location.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {blk.projectDetails.facilityType}
                    </div>
                  </td>
                  <td className="py-3 px-4 align-top max-w-md">
                    <div className="font-semibold text-slate-900 text-xs">
                      {blk.title}
                    </div>
                    <div className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                      {blk.description}
                    </div>
                  </td>
                  <td className="py-3 px-4 align-top">
                    <span className="inline-block px-2 py-0.5 rounded-xs text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {blk.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 align-top text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-xs text-[10px] font-semibold font-mono ${
                        blk.severity === 'Critical'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : blk.severity === 'Major'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {blk.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 align-top text-center">
                    {blk.status === 'Resolved' ? (
                      <span className="text-emerald-700 font-semibold text-[11px] flex items-center justify-center space-x-1">
                        <IconCheck className="w-3 h-3 text-emerald-600" />
                        <span>Resolved</span>
                      </span>
                    ) : (
                      <span className="text-rose-700 font-semibold text-[11px] font-mono">
                        Open
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 align-top text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {blk.status !== 'Resolved' && (
                        <button
                          onClick={() => handleResolve(blk.id)}
                          className="px-2.5 py-1 rounded-xs text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                        >
                          Resolve
                        </button>
                      )}
                      <button
                        onClick={() => onSelectProject(blk.projectDetails)}
                        className="px-2 py-1 text-slate-600 hover:text-black rounded-xs hover:bg-slate-100 transition-colors cursor-pointer text-[11px] font-bold"
                      >
                        Details →
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBlockers.length === 0 && (
          <div className="p-12 text-center text-slate-400 text-xs">
            No bottlenecks matching filter criteria.
          </div>
        )}
      </div>
    </div>
  );
};
