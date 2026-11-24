'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, ScheduleHealth } from '@/types';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  ArrowRight,
  Info,
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

  // Determine month span indices
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

  const getHealthColor = (health: ScheduleHealth, status: string) => {
    if (status === 'Commissioned' || health === 'Completed') {
      return {
        text: 'text-emerald-400',
        badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        barGradient: 'from-emerald-500 to-teal-400',
        dot: 'bg-emerald-400',
      };
    }
    if (health === 'Delayed (>30d)') {
      return {
        text: 'text-rose-400',
        badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        barGradient: 'from-rose-500 to-red-500',
        dot: 'bg-rose-400',
      };
    }
    if (health === 'Action Needed') {
      return {
        text: 'text-purple-400',
        badge: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
        barGradient: 'from-purple-500 to-indigo-500',
        dot: 'bg-purple-400',
      };
    }
    if (health === 'Watchlist') {
      return {
        text: 'text-amber-400',
        badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        barGradient: 'from-amber-500 to-orange-400',
        dot: 'bg-amber-400',
      };
    }
    return {
      text: 'text-sky-400',
      badge: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
      barGradient: 'from-sky-500 to-blue-500',
      dot: 'bg-sky-400',
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-5"
    >
      {/* Control Header & Live Legend */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Project Gantt & Milestone Timeline
              </h2>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-medium border border-slate-700">
                19 Months • Sep 2025 – Mar 2027
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Live schedule span from site acquisition through architectural approvals to showroom launch.
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Filter by city / code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 w-48 transition-all"
              />
            </div>

            <select
              value={facilityFilter}
              onChange={(e) => setFacilityFilter(e.target.value)}
              className="py-1.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-sky-500 cursor-pointer"
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
              className="py-1.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-sky-500 cursor-pointer"
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

        {/* Legend Bar */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs gap-3">
          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">Health Status:</span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Commissioned</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span>On Track</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Watchlist</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Delayed (&gt;30d)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span>Action Needed</span>
            </span>
          </div>

          <div className="flex items-center space-x-4 text-slate-400 text-[11px]">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-cyan-300 font-medium">Nov-26 (Reporting Date)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span className="text-rose-300 font-medium">31-Mar-27 (Fixed Target)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Gantt Interactive Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden relative">
        <div className="overflow-x-auto max-h-[720px]">
          <table className="w-full text-left border-collapse min-w-[1450px]">
            <thead className="sticky top-0 z-30 bg-slate-950 border-b border-slate-800">
              {/* Year Group Header */}
              <tr className="text-xs font-semibold text-slate-400 border-b border-slate-800/80">
                <th
                  className="p-3 sticky left-0 z-40 bg-slate-950 w-72 border-r border-slate-800 text-slate-300"
                  colSpan={4}
                >
                  DEALERSHIP LOCATION & STATUS ({filteredProjects.length} Tracks)
                </th>
                <th className="text-center py-2 border-r border-slate-800 bg-slate-950 text-sky-400 font-bold" colSpan={4}>
                  2025
                </th>
                <th className="text-center py-2 border-r border-slate-800 bg-slate-950 text-indigo-400 font-bold" colSpan={12}>
                  2026 (CORE ROLLOUT YEAR)
                </th>
                <th className="text-center py-2 bg-slate-950 text-rose-400 font-bold" colSpan={3}>
                  2027 (TARGET)
                </th>
              </tr>

              {/* Month Columns Header */}
              <tr className="text-[11px] text-slate-300 font-medium uppercase tracking-wider">
                <th className="p-3 sticky left-0 z-40 bg-slate-950 w-12 border-r border-slate-800 text-slate-500 text-center font-mono">
                  #
                </th>
                <th className="p-3 sticky left-12 z-40 bg-slate-950 w-44 border-r border-slate-800">
                  Location
                </th>
                <th className="p-3 sticky left-56 z-40 bg-slate-950 w-28 border-r border-slate-800">
                  Facility
                </th>
                <th className="p-3 sticky left-84 z-40 bg-slate-950 w-36 border-r border-slate-800 shadow-md">
                  Status & Health
                </th>

                {MONTHS.map((m) => (
                  <th
                    key={m.id}
                    className={`py-2.5 px-1 text-center w-14 font-semibold border-r border-slate-800/60 ${
                      m.isCurrent
                        ? 'bg-cyan-500/15 text-cyan-300 font-bold border-cyan-500/40'
                        : m.isTarget
                        ? 'bg-rose-500/15 text-rose-300 font-bold border-rose-500/40'
                        : 'text-slate-400'
                    }`}
                  >
                    <div>{m.label}</div>
                    {m.isCurrent && <div className="text-[9px] text-cyan-400 font-mono">Current</div>}
                    {m.isTarget && <div className="text-[9px] text-rose-400 font-mono">Target</div>}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80 text-xs">
              {filteredProjects.map((p, pIdx) => {
                const { startIdx, endIdx } = getProjectSpan(p);
                const healthStyle = getHealthColor(p.scheduleHealth, p.currentStatus);
                const hasBlocker = p.blockers.some((b) => b.status !== 'Resolved');

                return (
                  <motion.tr
                    key={p.id}
                    onClick={() => onSelectProject(p)}
                    onMouseEnter={() => setHoveredProject(p)}
                    onMouseLeave={() => setHoveredProject(null)}
                    className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                  >
                    {/* Index */}
                    <td className="p-3 sticky left-0 z-20 bg-slate-900 group-hover:bg-slate-800/90 border-r border-slate-800 text-slate-500 font-mono text-center">
                      {pIdx + 1}
                    </td>

                    {/* Location & Code */}
                    <td className="p-3 sticky left-12 z-20 bg-slate-900 group-hover:bg-slate-800/90 border-r border-slate-800 font-semibold text-white">
                      <div className="flex items-center space-x-2">
                        <span className="tracking-tight">{p.location.name}</span>
                        {hasBlocker && (
                          <span
                            className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"
                            title="Active bottleneck logged"
                          />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {p.code}
                      </div>
                    </td>

                    {/* Facility */}
                    <td className="p-3 sticky left-56 z-20 bg-slate-900 group-hover:bg-slate-800/90 border-r border-slate-800">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700/80 whitespace-nowrap">
                        {p.facilityType}
                      </span>
                    </td>

                    {/* Status & Health */}
                    <td className="p-3 sticky left-84 z-20 bg-slate-900 group-hover:bg-slate-800/90 border-r border-slate-800 shadow-md">
                      <div className="space-y-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border whitespace-nowrap ${healthStyle.badge}`}
                        >
                          {p.currentStatus}
                        </span>
                        <div className="flex items-center space-x-1.5 text-[10px] text-slate-400">
                          <span className={`w-1.5 h-1.5 rounded-full ${healthStyle.dot}`} />
                          <span className={`font-semibold ${healthStyle.text}`}>
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
                          className={`p-1.5 text-center relative border-r border-slate-800/40 ${
                            m.isCurrent
                              ? 'bg-cyan-500/5'
                              : m.isTarget
                              ? 'bg-rose-500/5'
                              : ''
                          }`}
                        >
                          {isInSpan && (
                            <motion.div
                              initial={{ scaleY: 0.7, opacity: 0 }}
                              animate={{ scaleY: 1, opacity: 1 }}
                              transition={{ duration: 0.2 }}
                              className={`h-7 rounded-md bg-gradient-to-r ${healthStyle.barGradient} shadow-sm flex items-center justify-center text-slate-950 font-bold text-[10px] select-none group-hover:brightness-110 transition-all ${
                                isStart ? 'rounded-l-lg' : ''
                              } ${isEnd ? 'rounded-r-lg' : ''}`}
                            >
                              {isStart && (
                                <span className="text-[10px] text-slate-950 font-extrabold px-1">
                                  ■
                                </span>
                              )}
                              {!isStart && !isEnd && (
                                <span className="opacity-60 text-[9px]">■</span>
                              )}
                              {isEnd && (
                                <span className="text-[10px] text-slate-950 font-extrabold px-1">
                                  {p.currentStatus === 'Commissioned' ? '✓' : '●'}
                                </span>
                              )}
                            </motion.div>
                          )}
                        </td>
                      );
                    })}
                  </motion.tr>
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
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl shadow-lg flex items-center justify-between text-xs"
          >
            <div className="flex items-center space-x-3">
              <span className="font-bold text-white text-sm">
                {hoveredProject.location.name} ({hoveredProject.facilityType})
              </span>
              <span className="text-slate-400 font-mono">
                Code: {hoveredProject.code}
              </span>
              <span className="text-slate-400">
                Elapsed: <strong className="text-white font-mono">{hoveredProject.elapsedDays}d</strong>
              </span>
              <span className="text-slate-400">
                Work %: <strong className="text-white font-mono">{hoveredProject.workPercentage}%</strong>
              </span>
              {hoveredProject.keyRemarks && (
                <span className="text-slate-400 italic truncate max-w-md">
                  "{hoveredProject.keyRemarks}"
                </span>
              )}
            </div>

            <button
              onClick={() => onSelectProject(hoveredProject)}
              className="text-sky-400 hover:text-sky-300 font-semibold flex items-center space-x-1"
            >
              <span>Inspect Milestones</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
