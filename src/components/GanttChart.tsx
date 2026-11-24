'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, ScheduleHealth } from '@/types';
import { IconSearch } from '@/components/ui/Icons';
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect';

interface GanttChartProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
}

// 19 Months: Sep 2025 to Mar 2027
const MONTHS = [
  { id: '2025-09', label: 'Sep-25', year: 2025 },
  { id: '2025-10', label: 'Oct-25', year: 2025 },
  { id: '2025-11', label: 'Nov-25', year: 2025 },
  { id: '2025-12', label: 'Dec-25', year: 2025 },
  { id: '2026-01', label: 'Jan-26', year: 2026 },
  { id: '2026-02', label: 'Feb-26', year: 2026 },
  { id: '2026-03', label: 'Mar-26', year: 2026 },
  { id: '2026-04', label: 'Apr-26', year: 2026 },
  { id: '2026-05', label: 'May-26', year: 2026 },
  { id: '2026-06', label: 'Jun-26', year: 2026 },
  { id: '2026-07', label: 'Jul-26', year: 2026 },
  { id: '2026-08', label: 'Aug-26', year: 2026 },
  { id: '2026-09', label: 'Sep-26', year: 2026 },
  { id: '2026-10', label: 'Oct-26', year: 2026 },
  { id: '2026-11', label: 'Nov-26', year: 2026, isCurrent: true },
  { id: '2026-12', label: 'Dec-26', year: 2026 },
  { id: '2027-01', label: 'Jan-27', year: 2027 },
  { id: '2027-02', label: 'Feb-27', year: 2027 },
  { id: '2027-03', label: 'Mar-27', year: 2027, isTarget: true },
];

const FACILITY_OPTIONS: SelectOption[] = [
  { value: 'ALL', label: 'All Facilities' },
  { value: 'Sales', label: 'Sales Only' },
  { value: 'Service', label: 'Service Only' },
  { value: 'Stock Yard', label: 'Stock Yard' },
  { value: 'Sales & Service', label: 'Sales & Service' },
];

const HEALTH_OPTIONS: SelectOption[] = [
  { value: 'ALL', label: 'All Schedule Health' },
  { value: 'Completed', label: 'Completed' },
  { value: 'On Track', label: 'On Track' },
  { value: 'Watchlist', label: 'Watchlist' },
  { value: 'Delayed (>30d)', label: 'Delayed (>30d)' },
  { value: 'Action Needed', label: 'Action Needed' },
];

export const GanttChart: React.FC<GanttChartProps> = ({ projects, onSelectProject }) => {
  const [search, setSearch] = useState('');
  const [facilityFilter, setFacilityFilter] = useState<string>('ALL');
  const [healthFilter, setHealthFilter] = useState<string>('ALL');

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (
        search &&
        !p.location.name.toLowerCase().includes(search.toLowerCase()) &&
        !p.code.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      if (facilityFilter !== 'ALL' && p.facilityType !== facilityFilter) {
        return false;
      }
      if (healthFilter !== 'ALL' && p.scheduleHealth !== healthFilter) {
        return false;
      }
      return true;
    });
  }, [projects, search, facilityFilter, healthFilter]);

  const getProjectSpan = (project: Project) => {
    let startIdx = 0;
    let endIdx = MONTHS.length - 1;

    if (project.startDate) {
      const s = project.startDate.split('T')[0].slice(0, 7);
      const foundIdx = MONTHS.findIndex((m) => m.id === s);
      if (foundIdx !== -1) startIdx = foundIdx;
    }

    if (project.currentStatus === 'Commissioned' && project.commissionedDate) {
      const c = project.commissionedDate.split('T')[0].slice(0, 7);
      const foundIdx = MONTHS.findIndex((m) => m.id === c);
      if (foundIdx !== -1) endIdx = Math.max(startIdx, foundIdx);
    } else {
      endIdx = MONTHS.length - 1;
    }

    return { startIdx, endIdx };
  };

  const getHealthStyle = (health: ScheduleHealth, status: string) => {
    if (status === 'Commissioned' || health === 'Completed') {
      return {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        barBg: 'bg-emerald-600',
        textColor: 'text-emerald-700',
        dot: 'bg-emerald-500',
      };
    }
    if (health === 'Delayed (>30d)') {
      return {
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        barBg: 'bg-rose-600',
        textColor: 'text-rose-700',
        dot: 'bg-rose-500',
      };
    }
    if (health === 'Action Needed') {
      return {
        badge: 'bg-purple-50 text-purple-700 border-purple-200',
        barBg: 'bg-purple-600',
        textColor: 'text-purple-700',
        dot: 'bg-purple-500',
      };
    }
    if (health === 'Watchlist') {
      return {
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        barBg: 'bg-amber-500',
        textColor: 'text-amber-700',
        dot: 'bg-amber-500',
      };
    }
    return {
      badge: 'bg-slate-100 text-black border-slate-300',
      barBg: 'bg-black',
      textColor: 'text-black',
      dot: 'bg-black',
    };
  };

  return (
    <div className="space-y-3">
      {/* Integrated Controls Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-sm font-bold text-black">Timeline</span>
          <span className="text-xs text-slate-400 font-mono">(Sep 2025 – Mar 2027)</span>
        </div>

        {/* Centered Bigger Search Bar */}
        <div className="relative flex-1 max-w-sm mx-auto w-full">
          <IconSearch className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search location or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xs text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-black shadow-2xs"
          />
        </div>

        {/* Custom In-House Filters */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <CustomSelect
            value={facilityFilter}
            onChange={setFacilityFilter}
            options={FACILITY_OPTIONS}
            size="sm"
            className="w-36"
          />

          <CustomSelect
            value={healthFilter}
            onChange={setHealthFilter}
            options={HEALTH_OPTIONS}
            size="sm"
            className="w-36"
          />
        </div>
      </div>

      {/* Main Gantt Grid Table */}
      <div className="bg-white border border-black rounded-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[760px]">
          <table className="w-full text-left border-collapse min-w-[1900px]">
            <thead className="sticky top-0 z-30 bg-slate-100 border-b-2 border-slate-400">
              {/* Year Super Header */}
              <tr className="text-xs font-semibold text-slate-600 border-b border-slate-200/80">
                <th
                  className="p-3 sticky left-0 z-40 bg-slate-100 w-[680px] min-w-[680px] border-r-2 border-slate-400 text-black font-black"
                  colSpan={4}
                >
                  DEALERSHIP LOCATION ({filteredProjects.length} Tracks)
                </th>
                <th className="text-center py-2 border-r-2 border-slate-400 bg-slate-200/80 text-black font-black" colSpan={4}>
                  2025
                </th>
                <th className="text-center py-2 border-r-2 border-slate-400 bg-slate-100 text-black font-black" colSpan={12}>
                  2026 (ACTIVE EXECUTION YEAR)
                </th>
                <th className="text-center py-2 bg-slate-200/80 text-black font-black" colSpan={3}>
                  2027 (TARGET)
                </th>
              </tr>

              {/* Month Header */}
              <tr className="text-[11px] text-black font-bold uppercase tracking-wider">
                <th className="p-3 sticky left-0 z-40 bg-slate-100 w-14 min-w-[56px] max-w-[56px] border-r border-slate-300 text-black font-extrabold text-center font-mono">
                  Sl. No.
                </th>
                <th className="p-3 sticky left-14 z-40 bg-slate-100 w-64 min-w-[256px] max-w-[256px] border-r border-slate-300 font-extrabold text-black">
                  Location & Code
                </th>
                <th className="p-3 sticky left-[312px] z-40 bg-slate-100 w-36 min-w-[144px] max-w-[144px] border-r border-slate-300 font-extrabold text-black">
                  Facility
                </th>
                <th className="p-3 sticky left-[456px] z-40 bg-slate-100 w-56 min-w-[224px] max-w-[224px] border-r-2 border-slate-400 font-extrabold text-black shadow-xs">
                  Status
                </th>

                {MONTHS.map((m) => {
                  const isYearEnd = m.id === '2025-12' || m.id === '2026-12';

                  return (
                    <th
                      key={m.id}
                      className={`py-2 px-1 text-center w-14 font-bold ${
                        isYearEnd ? 'border-r-2 border-slate-400' : 'border-r border-slate-200/60'
                      } ${
                        m.isCurrent
                          ? 'bg-neutral-200 text-black font-black'
                          : m.isTarget
                          ? 'bg-amber-100 text-amber-900 font-black'
                          : 'text-black'
                      }`}
                    >
                      <div>{m.label}</div>
                      {m.isCurrent && <div className="text-[9px] text-black font-mono font-black">Now</div>}
                      {m.isTarget && <div className="text-[9px] text-amber-800 font-mono font-black">Target</div>}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProjects.map((p, pIdx) => {
                const { startIdx, endIdx } = getProjectSpan(p);
                const healthStyle = getHealthStyle(p.scheduleHealth, p.currentStatus);
                const hasBlocker = p.blockers.some((b) => b.status !== 'Resolved');

                return (
                  <tr
                    key={p.id}
                    onClick={() => onSelectProject(p)}
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                  >
                    {/* Index */}
                    <td className="p-3 sticky left-0 z-20 bg-white group-hover:bg-slate-50 border-r border-slate-200 text-black font-extrabold font-mono text-center w-14 min-w-[56px] max-w-[56px]">
                      {pIdx + 1}
                    </td>

                    {/* Location & Code */}
                    <td className="p-3 sticky left-14 z-20 bg-white group-hover:bg-slate-50 border-r border-slate-200 font-bold text-black w-64 min-w-[256px] max-w-[256px]">
                      <div className="flex items-center space-x-1.5 whitespace-nowrap">
                        <span className="truncate">{p.location.name}</span>
                        {hasBlocker && (
                          <span
                            className="w-2 h-2 rounded-full bg-rose-500 shrink-0"
                            title="Active blocker logged"
                          />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono font-semibold mt-0.5">
                        {p.code}
                      </div>
                    </td>

                    {/* Facility */}
                    <td className="p-3 sticky left-[312px] z-20 bg-white group-hover:bg-slate-50 border-r border-slate-200 w-36 min-w-[144px] max-w-[144px]">
                      <span className="px-2 py-0.5 rounded-xs text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200 whitespace-nowrap inline-block">
                        {p.facilityType}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-3 sticky left-[456px] z-20 bg-white group-hover:bg-slate-50 border-r-2 border-slate-400 shadow-xs w-56 min-w-[224px] max-w-[224px]">
                      <span className={`inline-block px-2 py-0.5 rounded-xs text-[10px] font-bold border whitespace-nowrap ${
                        p.currentStatus === 'Commissioned'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : p.currentStatus === 'Ready for Handover'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : p.currentStatus === 'BOQ Approved / PO Pending'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : p.currentStatus === 'Pre-Construction'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-100 text-slate-800 border-slate-200'
                      }`}>
                        {p.currentStatus}
                      </span>
                    </td>

                    {/* 19 Monthly Gantt Cells */}
                    {MONTHS.map((m, mIdx) => {
                      const isInSpan = mIdx >= startIdx && mIdx <= endIdx;
                      const isStart = mIdx === startIdx;
                      const isEnd = mIdx === endIdx;
                      const isYearEnd = m.id === '2025-12' || m.id === '2026-12';

                      return (
                        <td
                          key={m.id}
                          className={`p-1.5 min-w-[58px] text-center relative ${
                            isYearEnd ? 'border-r-2 border-slate-400' : 'border-r border-slate-100'
                          } ${
                            m.isCurrent
                              ? 'bg-neutral-100/60'
                              : m.isTarget
                              ? 'bg-amber-50/40'
                              : ''
                          }`}
                        >
                          {isInSpan && (
                            <div
                              className={`h-6 rounded-xs ${healthStyle.barBg} shadow-2xs flex items-center justify-center text-white font-bold text-[10px] select-none transition-all`}
                            >
                              {isStart && (
                                <span className="text-[10px] text-white px-1 font-bold">
                                  ■
                                </span>
                              )}
                              {!isStart && !isEnd && (
                                <span className="opacity-50 text-[8px]">■</span>
                              )}
                              {isEnd && (
                                <span className="text-[10px] text-white px-1 font-bold">
                                  {p.currentStatus === 'Commissioned' ? '✓' : '●'}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProjects.length === 0 && (
          <div className="p-16 text-center text-slate-500 text-sm">
            No dealership projects found matching the criteria.
          </div>
        )}
      </div>
    </div>
  );
};
