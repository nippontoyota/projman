'use client';

import React, { useState, useMemo } from 'react';
import { Project, UserRole } from '@/types';
import { IconSearch, IconMatrix, IconExternal } from '@/components/ui/Icons';
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect';

interface ProjectTrackerProps {
  projects: Project[];
  userRole: UserRole;
  onSelectProject: (p: Project) => void;
  onRefresh: () => void;
}

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'Commissioned', label: 'Commissioned' },
  { value: 'Ready for Handover', label: 'Ready for Handover' },
  { value: 'BOQ Approved / PO Pending', label: 'BOQ Approved / PO Pending' },
  { value: 'Pre-Construction', label: 'Pre-Construction' },
  { value: 'Commercial Negotiation', label: 'Commercial Negotiation' },
];

const FACILITY_OPTIONS: SelectOption[] = [
  { value: 'ALL', label: 'All Facilities' },
  { value: 'Sales', label: 'Sales' },
  { value: 'Service', label: 'Service' },
  { value: 'Stock Yard', label: 'Stock Yard' },
  { value: 'Sales & Service', label: 'Sales & Service' },
];

export const ProjectTracker: React.FC<ProjectTrackerProps> = ({
  projects,
  userRole,
  onSelectProject,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [facilityFilter, setFacilityFilter] = useState('ALL');
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
  });

  const togglePhase = (phaseNum: number) => {
    setExpandedPhases((prev) => ({ ...prev, [phaseNum]: !prev[phaseNum] }));
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (search) {
        const query = search.toLowerCase();
        const matchesLoc = p.location.name.toLowerCase().includes(query);
        const matchesCode = p.code.toLowerCase().includes(query);
        const matchesRemarks = p.keyRemarks?.toLowerCase().includes(query) || false;
        if (!matchesLoc && !matchesCode && !matchesRemarks) return false;
      }
      if (statusFilter !== 'ALL' && p.currentStatus !== statusFilter) return false;
      if (facilityFilter !== 'ALL' && p.facilityType !== facilityFilter) return false;
      return true;
    });
  }, [projects, search, statusFilter, facilityFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Commissioned':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Ready for Handover':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'BOQ Approved / PO Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Pre-Construction':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="space-y-3">
      {/* Controls Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
            Milestones
          </h2>
          <span className="text-xs font-mono text-slate-400">
            ({filteredProjects.length} tracks)
          </span>
        </div>

        {/* Custom Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <IconSearch className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 w-44 shadow-2xs"
            />
          </div>

          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS}
            size="sm"
            className="w-44"
          />

          <CustomSelect
            value={facilityFilter}
            onChange={setFacilityFilter}
            options={FACILITY_OPTIONS}
            size="sm"
            className="w-36"
          />
        </div>
      </div>

      {/* Phase Toggle Controls */}
      <div className="flex flex-wrap items-center gap-1.5 pb-1">
        {[
          { num: 1, name: 'Phase 1: Property (6)' },
          { num: 2, name: 'Phase 2: Design (5)' },
          { num: 3, name: 'Phase 3: BOQ & PO (5)' },
          { num: 4, name: 'Phase 4: Site Execution (5)' },
        ].map((phase) => (
          <button
            key={phase.num}
            onClick={() => togglePhase(phase.num)}
            className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors cursor-pointer ${
              expandedPhases[phase.num]
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-500 border-slate-200 hover:text-slate-900'
            }`}
          >
            {phase.name}
          </button>
        ))}
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-h-[750px]">
          <table className="w-full text-left border-collapse min-w-[1600px] text-xs">
            <thead className="sticky top-0 z-30 bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-3 sticky left-0 z-40 bg-slate-50 w-12 border-r border-slate-200 text-center text-slate-500 font-mono">
                  #
                </th>
                <th className="p-3 sticky left-12 z-40 bg-slate-50 w-44 border-r border-slate-200 text-slate-900 font-bold">
                  Location & Code
                </th>
                <th className="p-3 sticky left-56 z-40 bg-slate-50 w-28 border-r border-slate-200 text-slate-600 font-semibold">
                  Facility
                </th>
                <th className="p-3 sticky left-84 z-40 bg-slate-50 w-36 border-r border-slate-200 text-slate-600 font-semibold shadow-xs">
                  Status
                </th>
                <th className="p-3 w-28 border-r border-slate-200 text-center text-slate-600 font-semibold">
                  Progress %
                </th>
                <th className="p-3 w-64 border-r border-slate-200 text-slate-600 font-semibold">
                  Remarks / Notes
                </th>

                {/* Milestone Headers */}
                {expandedPhases[1] && (
                  <th className="p-3 bg-blue-50/60 text-blue-800 border-r border-slate-200 text-center font-bold" colSpan={6}>
                    Phase 1: Property & Agreement
                  </th>
                )}
                {expandedPhases[2] && (
                  <th className="p-3 bg-indigo-50/60 text-indigo-800 border-r border-slate-200 text-center font-bold" colSpan={5}>
                    Phase 2: Design & GFC Approval
                  </th>
                )}
                {expandedPhases[3] && (
                  <th className="p-3 bg-amber-50/60 text-amber-800 border-r border-slate-200 text-center font-bold" colSpan={5}>
                    Phase 3: BOQ & PO Release
                  </th>
                )}
                {expandedPhases[4] && (
                  <th className="p-3 bg-emerald-50/60 text-emerald-800 text-center font-bold" colSpan={5}>
                    Phase 4: Site Execution & Handover
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredProjects.map((p, idx) => (
                <tr
                  key={p.id}
                  onClick={() => onSelectProject(p)}
                  className="hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <td className="p-3 sticky left-0 z-20 bg-white group-hover:bg-slate-50 border-r border-slate-200 text-slate-400 font-mono text-center">
                    {idx + 1}
                  </td>

                  <td className="p-3 sticky left-12 z-20 bg-white group-hover:bg-slate-50 border-r border-slate-200 font-semibold text-slate-900">
                    <div className="flex items-center space-x-1.5">
                      <span>{p.location.name}</span>
                      <IconExternal className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{p.code}</div>
                  </td>

                  <td className="p-3 sticky left-56 z-20 bg-white group-hover:bg-slate-50 border-r border-slate-200 text-slate-600">
                    <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 font-medium border border-slate-200">
                      {p.facilityType}
                    </span>
                  </td>

                  <td className="p-3 sticky left-84 z-20 bg-white group-hover:bg-slate-50 border-r border-slate-200 shadow-xs">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(
                        p.currentStatus
                      )}`}
                    >
                      {p.currentStatus}
                    </span>
                  </td>

                  <td className="p-3 border-r border-slate-200 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="font-bold text-slate-900 text-xs font-mono">{p.workPercentage}%</span>
                      <div className="w-12 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            p.workPercentage === 100 ? 'bg-emerald-600' : 'bg-blue-600'
                          }`}
                          style={{ width: `${p.workPercentage}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="p-3 border-r border-slate-200 max-w-xs text-[11px] text-slate-600">
                    <p className="line-clamp-2 leading-relaxed">
                      {p.keyRemarks || <span className="text-slate-400 italic">No notes</span>}
                    </p>
                  </td>

                  {/* Milestones */}
                  {p.milestones.map((m) => {
                    if (!expandedPhases[m.phaseNumber]) return null;

                    const isDone = m.status === 'Completed' || !!m.actualDate;

                    return (
                      <td
                        key={m.id}
                        className={`p-2 border-r border-slate-100 text-center ${
                          isDone ? 'bg-emerald-50/40' : ''
                        }`}
                        title={`${m.title}\nStatus: ${m.status}\nDate: ${
                          m.actualDate ? m.actualDate.split('T')[0] : 'Pending'
                        }`}
                      >
                        {isDone ? (
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-mono text-emerald-700 font-semibold">
                              {m.actualDate ? m.actualDate.split('T')[0].slice(5) : 'Done'}
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-0.5" />
                          </div>
                        ) : (
                          <div className="text-slate-300 text-[10px]">-</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
