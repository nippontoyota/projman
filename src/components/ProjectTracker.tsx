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
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold';
      case 'Ready for Handover':
        return 'bg-purple-50 text-purple-700 border-purple-200 font-bold';
      case 'BOQ Approved / PO Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200 font-bold';
      case 'Pre-Construction':
        return 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 font-bold';
    }
  };

  return (
    <div className="space-y-3">
      {/* Controls Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 shrink-0">
          <h2 className="text-sm font-bold text-black tracking-tight">
            Milestones
          </h2>
          <span className="text-xs font-mono text-slate-500 font-semibold">
            ({filteredProjects.length} tracks)
          </span>
        </div>

        {/* Centered Bigger Search Bar */}
        <div className="relative flex-1 max-w-sm mx-auto w-full">
          <IconSearch className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search location, code or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xs text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-black shadow-2xs"
          />
        </div>

        {/* Custom Filters */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
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
            className={`px-2.5 py-1 rounded-xs text-xs font-bold border transition-colors cursor-pointer ${
              expandedPhases[phase.num]
                ? 'bg-black text-white border-black'
                : 'bg-white text-slate-600 border-slate-200 hover:text-black'
            }`}
          >
            {phase.name}
          </button>
        ))}
      </div>

      {/* Main Table */}
      <div className="bg-white border border-black rounded-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[750px]">
          <table className="w-full text-left border-collapse min-w-[2040px] text-xs">
            <thead className="sticky top-0 z-30 bg-slate-100 border-b-2 border-slate-400">
              <tr>
                <th className="p-3 sticky left-0 z-40 bg-slate-100 w-14 min-w-[56px] max-w-[56px] border-r border-slate-300 text-center text-black font-extrabold text-[11px] font-mono uppercase tracking-wider">
                  Sl. No.
                </th>
                <th className="p-3 sticky left-14 z-40 bg-slate-100 w-64 min-w-[256px] max-w-[256px] border-r border-slate-300 text-black font-extrabold text-[11px] uppercase tracking-wider">
                  Location & Code
                </th>
                <th className="p-3 sticky left-[312px] z-40 bg-slate-100 w-36 min-w-[144px] max-w-[144px] border-r border-slate-300 text-black font-extrabold text-[11px] uppercase tracking-wider">
                  Facility
                </th>
                <th className="p-3 sticky left-[456px] z-40 bg-slate-100 w-56 min-w-[224px] max-w-[224px] border-r-2 border-slate-400 text-black font-extrabold text-[11px] uppercase tracking-wider shadow-xs">
                  Status
                </th>
                <th className="p-3 w-28 min-w-[112px] border-r border-slate-300 text-center text-black font-extrabold text-[11px] uppercase tracking-wider">
                  Progress %
                </th>
                <th className="p-3 w-72 min-w-[220px] border-r-2 border-slate-400 text-black font-extrabold text-[11px] uppercase tracking-wider">
                  Remarks / Notes
                </th>

                {/* Milestone Headers */}
                {expandedPhases[1] && (
                  <th className="p-3 bg-slate-200/80 text-black border-r-2 border-slate-400 text-center font-extrabold text-xs min-w-[288px] max-w-[288px]" colSpan={6}>
                    Phase 1: Property & Agreement
                  </th>
                )}
                {expandedPhases[2] && (
                  <th className="p-3 bg-slate-200/80 text-black border-r-2 border-slate-400 text-center font-extrabold text-xs min-w-[240px] max-w-[240px]" colSpan={5}>
                    Phase 2: Design & GFC Approval
                  </th>
                )}
                {expandedPhases[3] && (
                  <th className="p-3 bg-slate-200/80 text-black border-r-2 border-slate-400 text-center font-extrabold text-xs min-w-[240px] max-w-[240px]" colSpan={5}>
                    Phase 3: BOQ & PO Release
                  </th>
                )}
                {expandedPhases[4] && (
                  <th className="p-3 bg-slate-200/80 text-black text-center font-extrabold text-xs min-w-[240px] max-w-[240px]" colSpan={5}>
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
                  <td className="p-3 sticky left-0 z-20 bg-white group-hover:bg-slate-50 border-r border-slate-200 text-black font-extrabold font-mono text-center text-xs w-14 min-w-[56px] max-w-[56px]">
                    {idx + 1}
                  </td>

                  <td className="p-3 sticky left-14 z-20 bg-white group-hover:bg-slate-50 border-r border-slate-200 font-bold text-black w-64 min-w-[256px] max-w-[256px]">
                    <div className="flex items-center space-x-1.5 whitespace-nowrap">
                      <span className="truncate">{p.location.name}</span>
                      <IconExternal className="w-3 h-3 text-slate-400 group-hover:text-black transition-colors shrink-0" />
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono font-semibold mt-0.5">{p.code}</div>
                  </td>

                  <td className="p-3 sticky left-[312px] z-20 bg-white group-hover:bg-slate-50 border-r border-slate-200 text-slate-800 w-36 min-w-[144px] max-w-[144px]">
                    <span className="px-2 py-0.5 rounded-xs text-[11px] bg-slate-100 font-bold border border-slate-200 whitespace-nowrap inline-block">
                      {p.facilityType}
                    </span>
                  </td>

                  <td className="p-3 sticky left-[456px] z-20 bg-white group-hover:bg-slate-50 border-r-2 border-slate-400 shadow-xs w-56 min-w-[224px] max-w-[224px]">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-xs text-[10px] font-bold border whitespace-nowrap ${getStatusBadge(
                        p.currentStatus
                      )}`}
                    >
                      {p.currentStatus}
                    </span>
                  </td>

                  <td className="p-3 border-r border-slate-200 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="font-extrabold text-black text-xs font-mono">{p.workPercentage}%</span>
                      <div className="w-12 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            p.workPercentage === 100 ? 'bg-emerald-600' : 'bg-black'
                          }`}
                          style={{ width: `${p.workPercentage}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="p-3 border-r-2 border-slate-400 min-w-[220px] max-w-sm text-[11px] text-slate-800">
                    <p className="line-clamp-2 leading-relaxed">
                      {p.keyRemarks || <span className="text-slate-400 italic">No notes</span>}
                    </p>
                  </td>

                  {/* Milestones */}
                  {p.milestones.map((m) => {
                    if (!expandedPhases[m.phaseNumber]) return null;

                    const isDone = m.status === 'Completed' || !!m.actualDate;
                    const isPhaseEnd = m.orderIndex === 6 || m.orderIndex === 11 || m.orderIndex === 16 || m.orderIndex === 21;

                    return (
                      <td
                        key={m.id}
                        className={`py-2 px-1 w-12 min-w-[48px] max-w-[48px] whitespace-nowrap ${isPhaseEnd ? 'border-r-2 border-slate-400' : 'border-r border-slate-100'} text-center ${
                          isDone ? 'bg-emerald-50/40' : ''
                        }`}
                        title={`${m.title}\nStatus: ${m.status}\nDate: ${
                          m.actualDate ? m.actualDate.split('T')[0] : 'Pending'
                        }`}
                      >
                        {isDone ? (
                          <div className="flex flex-col items-center justify-center">
                            <span className="text-[10px] font-mono text-emerald-700 font-extrabold whitespace-nowrap">
                              {m.actualDate ? m.actualDate.split('T')[0].slice(5) : 'Done'}
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-0.5" />
                          </div>
                        ) : (
                          <div className="text-slate-300 text-[10px] font-bold">-</div>
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
