'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, ScheduleHealth } from '@/types';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Calendar,
} from 'lucide-react';

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

export const GanttChart: React.FC<GanttChartProps> = ({ projects, onSelectProject }) => {
  const [search, setSearch] = useState('');
  const [facilityFilter, setFacilityFilter] = useState<string>('ALL');
  const [healthFilter, setHealthFilter] = useState<string>('ALL');
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);

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
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      barBg: 'bg-blue-600',
      textColor: 'text-blue-700',
      dot: 'bg-blue-500',
    };
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & Legend Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Visual Project Gantt Timeline
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-medium border border-slate-200">
                Sep 2025 – Mar 2027
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Monthly duration from property identification to facility commissioning or fixed target date.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search city or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-48 shadow-2xs"
              />
            </div>

            <select
              value={facilityFilter}
              onChange={(e) => setFacilityFilter(e.target.value)}
              className="py-1.5 px-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer font-medium"
            >
              <option value="ALL">All Facilities</option>
              <option value="Sales">Sales Only</option>
              <option value="Service">Service Only</option>
              <option value="Stock Yard">Stock Yard Only</option>
              <option value="Sales & Service">Sales & Service</option>
            </select>

            <select
              value={healthFilter}
              onChange={(e) => setHealthFilter(e.target.value)}
              className="py-1.5 px-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer font-medium"
            >
              <option value="ALL">All Schedule Health</option>
              <option value="Completed">Completed</option>
              <option value="On Track">On Track</option>
              <option value="Watchlist">Watchlist</option>
              <option value="Delayed (>30d)">Delayed (&gt;30d)</option>
              <option value="Action Needed">Action Needed</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs gap-3">
          <div className="flex flex-wrap items-center gap-3 text-slate-600">
            <span className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">Health:</span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>Commissioned</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span>On Track</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Watchlist</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
              <span>Delayed (&gt;30d)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
              <span>Action Needed</span>
            </span>
          </div>

          <div className="flex items-center space-x-4 text-slate-500 text-[11px]">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span className="text-blue-700 font-semibold">Nov-26 (Reporting Date)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-600" />
              <span className="text-amber-800 font-semibold">31-Mar-27 (Fixed Target)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Gantt Grid Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[720px]">
          <table className="w-full text-left border-collapse min-w-[1450px]">
            <thead className="sticky top-0 z-30 bg-slate-50 border-b border-slate-200">
              {/* Year Super Header */}
              <tr className="text-xs font-semibold text-slate-600 border-b border-slate-200/80">
                <th
                  className="p-3 sticky left-0 z-40 bg-slate-50 w-72 border-r border-slate-200 text-slate-800"
                  colSpan={4}
                >
                  DEALERSHIP LOCATION & STATUS ({filteredProjects.length} Tracks)
                </th>
                <th className="text-center py-2 border-r border-slate-200 bg-slate-100/70 text-slate-700 font-bold" colSpan={4}>
                  2025
                </th>
                <th className="text-center py-2 border-r border-slate-200 bg-slate-50 text-blue-800 font-bold" colSpan={12}>
                  2026 (ACTIVE EXECUTION YEAR)
                </th>
                <th className="text-center py-2 bg-slate-100/70 text-slate-700 font-bold" colSpan={3}>
                  2027 (TARGET)
                </th>
              </tr>

              {/* Month Header */}
              <tr className="text-[11px] text-slate-600 font-medium uppercase tracking-wider">
                <th className="p-3 sticky left-0 z-40 bg-slate-50 w-12 border-r border-slate-200 text-slate-500 text-center font-mono">
                  #
                </th>
                <th className="p-3 sticky left-12 z-40 bg-slate-50 w-44 border-r border-slate-200 font-bold text-slate-800">
                  Location
                </th>
                <th className="p-3 sticky left-56 z-40 bg-slate-50 w-28 border-r border-slate-200">
                  Facility
                </th>
                <th className="p-3 sticky left-84 z-40 bg-slate-50 w-36 border-r border-slate-200 shadow-xs">
                  Status & Health
                </th>

                {MONTHS.map((m) => (
                  <th
                    key={m.id}
                    className={`py-2 px-1 text-center w-14 font-semibold border-r border-slate-200/60 ${
                      m.isCurrent
                        ? 'bg-blue-50 text-blue-800 font-bold border-blue-200'
                        : m.isTarget
                        ? 'bg-amber-50 text-amber-800 font-bold border-amber-200'
                        : 'text-slate-600'
                    }`}
                  >
                    <div>{m.label}</div>
                    {m.isCurrent && <div className="text-[9px] text-blue-600 font-mono font-bold">Now</div>}
                    {m.isTarget && <div className="text-[9px] text-amber-700 font-mono font-bold">Target</div>}
                  </th>
                ))}
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
                    onMouseEnter={() => setHoveredProject(p)}
                    onMouseLeave={() => setHoveredProject(null)}
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                  >
                    {/* Index */}
                    <td className="p-3 sticky left-0 z-20 bg-white group-hover:bg-slate-50 border-r border-slate-200 text-slate-400 font-mono text-center">
                      {pIdx + 1}
                    </td>

                    {/* Location & Code */}
                    <td className="p-3 sticky left-12 z-20 bg-white group-hover:bg-slate-50 border-r border-slate-200 font-semibold text-slate-900">
                      <div className="flex items-center space-x-1.5">
                        <span>{p.location.name}</span>
                        {hasBlocker && (
                          <span
                            className="w-2 h-2 rounded-full bg-rose-500"
                            title="Active blocker logged"
                          />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {p.code}
                      </div>
                    </td>

                    {/* Facility */}
                    <td className="p-3 sticky left-56 z-20 bg-white group-hover:bg-slate-50 border-r border-slate-200">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
                        {p.facilityType}
                      </span>
                    </td>

                    {/* Status & Health */}
                    <td className="p-3 sticky left-84 z-20 bg-white group-hover:bg-slate-50 border-r border-slate-200 shadow-xs">
                      <div className="space-y-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border whitespace-nowrap ${healthStyle.badge}`}
                        >
                          {p.currentStatus}
                        </span>
                        <div className="flex items-center space-x-1.5 text-[10px] text-slate-500">
                          <span className={`w-1.5 h-1.5 rounded-full ${healthStyle.dot}`} />
                          <span className={`font-semibold ${healthStyle.textColor}`}>
                            {p.scheduleHealth}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 19 Monthly Gantt Cells */}
                    {MONTHS.map((m, mIdx) => {
                      const isInSpan = mIdx >= startIdx && mIdx <= endIdx;
                      const isStart = mIdx === startIdx;
                      const isEnd = mIdx === endIdx;

                      return (
                        <td
                          key={m.id}
                          className={`p-1.5 text-center relative border-r border-slate-100 ${
                            m.isCurrent
                              ? 'bg-blue-50/40'
                              : m.isTarget
                              ? 'bg-amber-50/40'
                              : ''
                          }`}
                        >
                          {isInSpan && (
                            <div
                              className={`h-6 rounded ${healthStyle.barBg} shadow-2xs flex items-center justify-center text-white font-bold text-[10px] select-none transition-all ${
                                isStart ? 'rounded-l-md' : ''
                              } ${isEnd ? 'rounded-r-md' : ''}`}
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

      {/* Floating Hover Context Bar */}
      <AnimatePresence>
        {hoveredProject && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm flex items-center justify-between text-xs"
          >
            <div className="flex items-center space-x-3 text-slate-700">
              <span className="font-bold text-slate-900">
                {hoveredProject.location.name} ({hoveredProject.facilityType})
              </span>
              <span className="text-slate-400 font-mono">
                Code: {hoveredProject.code}
              </span>
              <span>
                Elapsed: <strong className="text-slate-900 font-mono">{hoveredProject.elapsedDays}d</strong>
              </span>
              <span>
                Work %: <strong className="text-slate-900 font-mono">{hoveredProject.workPercentage}%</strong>
              </span>
              {hoveredProject.keyRemarks && (
                <span className="text-slate-500 italic truncate max-w-md">
                  "{hoveredProject.keyRemarks}"
                </span>
              )}
            </div>

            <button
              onClick={() => onSelectProject(hoveredProject)}
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <span>Inspect Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
