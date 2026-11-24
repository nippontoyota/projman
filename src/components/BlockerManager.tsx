'use client';

import React, { useState, useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import { Project, Blocker, UserRole } from '@/types';
import {
  AlertOctagon,
  CheckCircle2,
  Clock,
  Filter,
  Flame,
  Building2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface BlockerManagerProps {
  projects: Project[];
  userRole: UserRole;
  onSelectProject: (p: Project) => void;
  onRefresh: () => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export const BlockerManager: React.FC<BlockerManagerProps> = ({
  projects,
  userRole,
  onSelectProject,
  onRefresh,
}) => {
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

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
      if (res.ok) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">
                Dealership Bottlenecks & Escalations Radar
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Active delays categorized by Landlord, River OEM approvals, Legal, and Contractor execution.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-1.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-sky-500 cursor-pointer"
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
              className="py-1.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-sky-500 cursor-pointer"
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
              className="py-1.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="Open">Open Issues</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Blockers */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {filteredBlockers.map((blk) => (
          <motion.div
            key={blk.id}
            variants={cardVariants}
            whileHover={{ y: -3 }}
            className={`p-5 rounded-2xl border shadow-lg space-y-3 transition-all ${
              blk.status === 'Resolved'
                ? 'bg-slate-900/40 border-slate-800/80 opacity-60'
                : 'bg-slate-900 border-rose-500/30 hover:border-rose-500/60'
            }`}
          >
            {/* Top Row: Location & Category */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="font-bold text-white text-sm">
                  {blk.projectDetails.location.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  ({blk.projectDetails.facilityType})
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">
                {blk.category}
              </span>
            </div>

            {/* Title & Description */}
            <div>
              <h3 className="font-bold text-slate-100 text-sm">{blk.title}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {blk.description}
              </p>
            </div>

            {/* Metadata Footer */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400 text-[11px]">Severity:</span>
                <span className="font-bold text-rose-400 text-[11px] font-mono">
                  {blk.severity}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {blk.status !== 'Resolved' ? (
                  <button
                    onClick={() => handleResolve(blk.id)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors cursor-pointer"
                  >
                    Mark Resolved
                  </button>
                ) : (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resolved</span>
                  </span>
                )}

                <button
                  onClick={() => onSelectProject(blk.projectDetails)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title="View Project Details"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredBlockers.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-sm">
          No bottlenecks found matching the selected filters.
        </div>
      )}
    </div>
  );
};
