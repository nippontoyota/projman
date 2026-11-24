'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { DashboardStats, Project } from '@/types';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  Calendar,
  Building2,
  ArrowRight,
  ShieldAlert,
  Target,
} from 'lucide-react';

interface ExecutiveDashboardProps {
  stats: DashboardStats | null;
  projects: Project[];
  onSelectProject: (p: Project) => void;
  onOpenBlockerModal?: () => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  stats,
  projects,
  onSelectProject,
}) => {
  if (!stats) {
    return (
      <div className="p-16 text-center text-slate-500 text-sm">
        Loading executive dashboard data...
      </div>
    );
  }

  const { metrics, portfolioBreakdown, benchmarks, openBlockers } = stats;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Top Banner */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-bold tracking-wider text-sky-400 uppercase">
                Executive Status & Milestone Health
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1">
              Incheon Mobility – River Projects Executive Overview
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Dealer Network Expansion Master Tracker • Target Completion:{' '}
              <strong className="text-slate-200">31 March 2027</strong> ({metrics.daysToTarget} Days Remaining)
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800 shadow-sm">
            <Calendar className="w-4 h-4 text-sky-400" />
            <div className="text-xs">
              <div className="text-slate-400 text-[10px]">Reporting Date</div>
              <div className="font-bold text-white font-mono">19 November 2026</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Tracks */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg group hover:border-slate-700 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Tracks
            </span>
            <Building2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white font-mono">{metrics.totalTracks}</span>
            <span className="text-xs text-slate-400">across 8 cities</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Sales, Service & Stock Yards
          </div>
        </motion.div>

        {/* Commissioned */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 shadow-lg group hover:border-emerald-500/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
              Commissioned
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-emerald-400 font-mono">
              {metrics.commissionedCount}
            </span>
            <span className="text-xs text-emerald-500 font-bold font-mono">
              ({Math.round((metrics.commissionedCount / metrics.totalTracks) * 100)}%)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Aluva (1 & 2), Muvattupuzha, Alappuzha
          </div>
        </motion.div>

        {/* Open Projects */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg group hover:border-slate-700 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Active Pipeline
            </span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white font-mono">{metrics.openProjectsCount}</span>
            <span className="text-xs text-slate-400">projects</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Pre-construction & negotiation
          </div>
        </motion.div>

        {/* Days to Target */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg group hover:border-slate-700 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Days to Target
            </span>
            <Target className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-amber-400 font-mono">{metrics.daysToTarget}</span>
            <span className="text-xs text-slate-400">Days</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Target: 31-March-2027
          </div>
        </motion.div>

        {/* Critical Blockers */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-900 border border-rose-500/30 rounded-2xl p-5 shadow-lg group hover:border-rose-500/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
              Active Bottlenecks
            </span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-rose-400 font-mono">{openBlockers.length}</span>
            <span className="text-xs text-rose-300 font-bold">Issues</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Pala, Nedumangad, Cherthala, Pattom
          </div>
        </motion.div>
      </div>

      {/* Mid Section: Portfolio Status & Stage Benchmarks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Status Breakdown */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-sm">Portfolio Status Breakdown</h3>
              <p className="text-xs text-slate-400">Stage distribution & average duration elapsed</p>
            </div>
            <span className="text-[11px] font-medium text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 font-mono">
              15 Tracks
            </span>
          </div>

          <div className="space-y-3">
            {portfolioBreakdown.map((item) => (
              <div
                key={item.status}
                className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-white">{item.status}</span>
                  <div className="flex items-center space-x-3 text-slate-400">
                    <span className="font-mono">
                      <strong className="text-white">{item.count}</strong> ({item.percentage}%)
                    </span>
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-300">
                      Avg: {item.avgElapsedDays}d
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      item.status === 'Commissioned'
                        ? 'bg-emerald-500'
                        : item.status === 'Ready for Handover'
                        ? 'bg-purple-500'
                        : item.status === 'BOQ Approved / PO Pending'
                        ? 'bg-amber-500'
                        : item.status === 'Pre-Construction'
                        ? 'bg-rose-500'
                        : 'bg-sky-500'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stage-Wise Timeline Benchmarks */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-sm">Stage-Wise Timeline Benchmarks</h3>
              <p className="text-xs text-slate-400">Empirical benchmark duration per expansion phase</p>
            </div>
            <span className="text-[11px] font-medium text-sky-400 bg-sky-950/50 px-2.5 py-1 rounded-lg border border-sky-800/60 uppercase tracking-wider font-mono">
              SLA Benchmarks
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-semibold">
                  <th className="pb-2.5">Project Stage</th>
                  <th className="pb-2.5 text-center">Avg Days</th>
                  <th className="pb-2.5 text-center">Min Days</th>
                  <th className="pb-2.5 text-center">Max Days</th>
                  <th className="pb-2.5 text-right">Tracks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {benchmarks.map((b) => (
                  <tr key={b.stageNumber} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 font-medium text-slate-200">
                      {b.stageName}
                    </td>
                    <td className="py-2.5 text-center font-bold text-sky-400 font-mono">
                      {b.avgDays.toFixed(1)}d
                    </td>
                    <td className="py-2.5 text-center text-slate-400 font-mono">
                      {b.minDays}d
                    </td>
                    <td className="py-2.5 text-center text-slate-400 font-mono">
                      {b.maxDays}d
                    </td>
                    <td className="py-2.5 text-right font-semibold text-slate-300 font-mono">
                      {b.tracksCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Critical Bottlenecks Radar */}
      <motion.div
        variants={itemVariants}
        className="bg-slate-900 border border-rose-500/20 rounded-2xl p-5 shadow-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <div>
              <h3 className="font-bold text-white text-sm">
                Critical Bottlenecks & Escalations
              </h3>
              <p className="text-xs text-slate-400">
                Direct impediments requiring executive intervention to prevent target breach
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-rose-400 bg-rose-950/60 border border-rose-800/80 px-2.5 py-1 rounded-lg font-mono">
            {openBlockers.length} Active Issues
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {openBlockers.map((blk) => (
            <motion.div
              key={blk.id}
              whileHover={{ y: -2 }}
              className="bg-slate-950/90 border border-slate-800 hover:border-rose-500/50 p-4 rounded-xl space-y-2.5 transition-all shadow-sm"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>{blk.project?.location.name}</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  {blk.category}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-200">
                  {blk.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                  {blk.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <span>Severity: <strong className="text-rose-400 font-mono">{blk.severity}</strong></span>
                {blk.project && (
                  <button
                    onClick={() => {
                      const p = projects.find((proj) => proj.id === blk.projectId);
                      if (p) onSelectProject(p);
                    }}
                    className="text-sky-400 hover:text-sky-300 font-semibold flex items-center space-x-1"
                  >
                    <span>View Project</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
