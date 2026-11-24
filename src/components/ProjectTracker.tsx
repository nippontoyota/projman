'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, UserRole } from '@/types';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Layers,
  ChevronDown,
} from 'lucide-react';

interface ProjectTrackerProps {
  projects: Project[];
  userRole: UserRole;
  onSelectProject: (p: Project) => void;
  onRefresh: () => void;
}

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
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Ready for Handover':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'BOQ Approved / PO Pending':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Pre-Construction':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-5"
    >
      {/* Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <Layers className="w-5 h-5 text-sky-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">
                Dealership 21-Milestone Matrix
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Phase-by-phase operational tracker from site identification to commercial launch.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search city, code, remarks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 w-52 transition-all"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Commissioned">Commissioned</option>
              <option value="Ready for Handover">Ready for Handover</option>
              <option value="BOQ Approved / PO Pending">BOQ Approved / PO Pending</option>
              <option value="Pre-Construction">Pre-Construction</option>
              <option value="Commercial Negotiation">Commercial Negotiation</option>
            </select>

            <select
              value={facilityFilter}
              onChange={(e) => setFacilityFilter(e.target.value)}
              className="py-1.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="ALL">All Facilities</option>
              <option value="Sales">Sales</option>
              <option value="Service">Service</option>
              <option value="Stock Yard">Stock Yard</option>
              <option value="Sales & Service">Sales & Service</option>
            </select>
          </div>
        </div>

        {/* Phase Toggle Controls */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-2">
            Phases:
          </span>
          {[
            { num: 1, name: 'Phase 1: Property & Agreement (6)' },
            { num: 2, name: 'Phase 2: Design & GFC (5)' },
            { num: 3, name: 'Phase 3: BOQ & PO Release (5)' },
            { num: 4, name: 'Phase 4: Site Execution & Handover (5)' },
          ].map((phase) => (
            <button
              key={phase.num}
              onClick={() => togglePhase(phase.num)}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                expandedPhases[phase.num]
                  ? 'bg-sky-500/15 text-sky-300 border-sky-500/40 shadow-sm'
                  : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
              }`}
            >
              {phase.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[750px]">
          <table className="w-full text-left border-collapse min-w-[1600px] text-xs">
            <thead className="sticky top-0 z-30 bg-slate-950 border-b border-slate-800">
              <tr>
                <th className="p-3 sticky left-0 z-40 bg-slate-950 w-12 border-r border-slate-800 text-center text-slate-500 font-mono">
                  #
                </th>
                <th className="p-3 sticky left-12 z-40 bg-slate-950 w-44 border-r border-slate-800 text-white font-bold">
                  Location & Code
                </th>
                <th className="p-3 sticky left-56 z-40 bg-slate-950 w-28 border-r border-slate-800 text-slate-300">
                  Facility
                </th>
                <th className="p-3 sticky left-84 z-40 bg-slate-950 w-36 border-r border-slate-800 text-slate-300 shadow-md">
                  Status & Health
                </th>
                <th className="p-3 w-28 border-r border-slate-800 text-center text-slate-300 font-semibold">
                  Progress %
                </th>
                <th className="p-3 w-64 border-r border-slate-800 text-slate-300">
                  Key Remarks / Current Blocker
                </th>

                {/* Milestone Column Headers */}
                {expandedPhases[1] && (
                  <th className="p-3 bg-sky-950/30 text-sky-300 border-r border-slate-800 text-center font-bold" colSpan={6}>
                    Phase 1: Property & Agreement
                  </th>
                )}
                {expandedPhases[2] && (
                  <th className="p-3 bg-indigo-950/30 text-indigo-300 border-r border-slate-800 text-center font-bold" colSpan={5}>
                    Phase 2: Design & GFC Approval
                  </th>
                )}
                {expandedPhases[3] && (
                  <th className="p-3 bg-amber-950/30 text-amber-300 border-r border-slate-800 text-center font-bold" colSpan={5}>
                    Phase 3: BOQ & PO Release
                  </th>
                )}
                {expandedPhases[4] && (
                  <th className="p-3 bg-emerald-950/30 text-emerald-300 text-center font-bold" colSpan={5}>
                    Phase 4: Site Execution & Handover
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80">
              {filteredProjects.map((p, idx) => (
                <tr
                  key={p.id}
                  onClick={() => onSelectProject(p)}
                  className="hover:bg-slate-800/60 transition-colors group cursor-pointer"
                >
                  <td className="p-3 sticky left-0 z-20 bg-slate-900 group-hover:bg-slate-800 border-r border-slate-800 text-slate-500 font-mono text-center">
                    {idx + 1}
                  </td>

                  <td className="p-3 sticky left-12 z-20 bg-slate-900 group-hover:bg-slate-800 border-r border-slate-800 font-semibold text-white">
                    <div className="flex items-center space-x-1.5">
                      <span>{p.location.name}</span>
                      <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-sky-400 transition-colors" />
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{p.code}</div>
                  </td>

                  <td className="p-3 sticky left-56 z-20 bg-slate-900 group-hover:bg-slate-800 border-r border-slate-800 text-slate-300">
                    <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 font-medium border border-slate-700/60">
                      {p.facilityType}
                    </span>
                  </td>

                  <td className="p-3 sticky left-84 z-20 bg-slate-900 group-hover:bg-slate-800 border-r border-slate-800 shadow-md">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(
                        p.currentStatus
                      )}`}
                    >
                      {p.currentStatus}
                    </span>
                  </td>

                  <td className="p-3 border-r border-slate-800 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="font-bold text-white text-xs font-mono">{p.workPercentage}%</span>
                      <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            p.workPercentage === 100 ? 'bg-emerald-500' : 'bg-sky-500'
                          }`}
                          style={{ width: `${p.workPercentage}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="p-3 border-r border-slate-800 max-w-xs text-[11px] text-slate-300">
                    <p className="line-clamp-2 leading-relaxed">
                      {p.keyRemarks || <span className="text-slate-600 italic">No notes</span>}
                    </p>
                  </td>

                  {/* Milestones */}
                  {p.milestones.map((m) => {
                    if (!expandedPhases[m.phaseNumber]) return null;

                    const isDone = m.status === 'Completed' || !!m.actualDate;

                    return (
                      <td
                        key={m.id}
                        className={`p-2 border-r border-slate-800/60 text-center ${
                          isDone ? 'bg-emerald-950/10' : ''
                        }`}
                        title={`${m.title}\nStatus: ${m.status}\nDate: ${
                          m.actualDate ? m.actualDate.split('T')[0] : 'Pending'
                        }`}
                      >
                        {isDone ? (
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-mono text-emerald-400 font-medium">
                              {m.actualDate ? m.actualDate.split('T')[0].slice(5) : 'Done'}
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-0.5" />
                          </div>
                        ) : (
                          <div className="text-slate-600 text-[10px]">-</div>
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
    </motion.div>
  );
};
