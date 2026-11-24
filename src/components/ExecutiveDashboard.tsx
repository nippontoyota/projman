'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { DashboardStats, Project } from '@/types';
import {
  IconFacility,
  IconCheck,
  IconEscalation,
  IconRadar,
  IconDashboard,
} from '@/components/ui/Icons';

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
      staggerChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
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
      className="space-y-5"
    >
      {/* Top Banner */}
      <motion.div
        variants={itemVariants}
        className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="text-[11px] font-bold tracking-wider text-blue-700 uppercase">
              Executive Project Portfolio
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Incheon Mobility – River Dealership Expansion Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kerala Network Expansion Program • Fixed Target Date:{' '}
            <strong className="text-slate-800">31 March 2027</strong> ({metrics.daysToTarget} Days Remaining)
          </p>
        </div>

        <div className="flex items-center space-x-2.5 bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200 self-start md:self-auto">
          <IconDashboard className="w-3.5 h-3.5 text-slate-600" />
          <div className="text-xs">
            <div className="text-slate-400 text-[10px]">Reporting Baseline</div>
            <div className="font-bold text-slate-800 font-mono">19 November 2026</div>
          </div>
        </div>
      </motion.div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Tracks */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Tracks
            </span>
            <IconFacility className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono">{metrics.totalTracks}</span>
            <span className="text-xs text-slate-500">8 cities</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Sales, Service & Stock Yards
          </div>
        </motion.div>

        {/* Commissioned */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-emerald-200 rounded-xl p-4 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
              Commissioned
            </span>
            <IconCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-700 font-mono">
              {metrics.commissionedCount}
            </span>
            <span className="text-xs text-emerald-600 font-semibold font-mono">
              ({Math.round((metrics.commissionedCount / metrics.totalTracks) * 100)}%)
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Aluva, Muvattupuzha, Alappuzha
          </div>
        </motion.div>

        {/* Open Pipeline */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Active Pipeline
            </span>
            <IconDashboard className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono">{metrics.openProjectsCount}</span>
            <span className="text-xs text-slate-500">projects</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Pre-construction & negotiation
          </div>
        </motion.div>

        {/* Days to Target */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Days to Target
            </span>
            <IconRadar className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-bold text-amber-600 font-mono">{metrics.daysToTarget}</span>
            <span className="text-xs text-slate-500">Days</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Target: 31-March-2027
          </div>
        </motion.div>

        {/* Bottlenecks */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-rose-200 rounded-xl p-4 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">
              Active Issues
            </span>
            <IconEscalation className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-bold text-rose-700 font-mono">{openBlockers.length}</span>
            <span className="text-xs text-rose-600 font-semibold">Blockers</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Pala, Nedumangad, Cherthala, Pattom
          </div>
        </motion.div>
      </div>

      {/* Mid Section: Portfolio Status & Benchmarks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Status Breakdown */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Portfolio Status Breakdown</h3>
              <p className="text-xs text-slate-500">Project track distribution & average elapsed days</p>
            </div>
            <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200 font-mono">
              15 Tracks
            </span>
          </div>

          <div className="space-y-3">
            {portfolioBreakdown.map((item) => (
              <div
                key={item.status}
                className="bg-slate-50/70 p-3 rounded-lg border border-slate-200/80"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-900">{item.status}</span>
                  <div className="flex items-center space-x-3 text-slate-600">
                    <span className="font-mono">
                      <strong className="text-slate-900">{item.count}</strong> ({item.percentage}%)
                    </span>
                    <span className="text-[11px] bg-white px-2 py-0.5 rounded font-mono text-slate-700 border border-slate-200">
                      Avg: {item.avgElapsedDays}d
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.status === 'Commissioned'
                        ? 'bg-emerald-600'
                        : item.status === 'Ready for Handover'
                        ? 'bg-purple-600'
                        : item.status === 'BOQ Approved / PO Pending'
                        ? 'bg-amber-500'
                        : item.status === 'Pre-Construction'
                        ? 'bg-rose-600'
                        : 'bg-blue-600'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stage-Wise Timeline Benchmarks */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Stage-Wise Timeline Benchmarks</h3>
              <p className="text-xs text-slate-500">Empirical benchmark duration per expansion phase</p>
            </div>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase tracking-wider font-mono">
              SLA Standard
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold">
                  <th className="pb-2">Project Stage</th>
                  <th className="pb-2 text-center">Avg Days</th>
                  <th className="pb-2 text-center">Min Days</th>
                  <th className="pb-2 text-center">Max Days</th>
                  <th className="pb-2 text-right">Tracks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {benchmarks.map((b) => (
                  <tr key={b.stageNumber} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 font-medium text-slate-800">
                      {b.stageName}
                    </td>
                    <td className="py-2.5 text-center font-bold text-blue-700 font-mono">
                      {b.avgDays.toFixed(1)}d
                    </td>
                    <td className="py-2.5 text-center text-slate-600 font-mono">
                      {b.minDays}d
                    </td>
                    <td className="py-2.5 text-center text-slate-600 font-mono">
                      {b.maxDays}d
                    </td>
                    <td className="py-2.5 text-right font-semibold text-slate-800 font-mono">
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
        className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <IconEscalation className="w-4 h-4 text-rose-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Critical Bottlenecks & Escalations
              </h3>
              <p className="text-xs text-slate-500">
                Direct impediments requiring executive escalation to prevent target breach
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded font-mono">
            {openBlockers.length} Active Issues
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {openBlockers.map((blk) => (
            <div
              key={blk.id}
              className="bg-white border border-slate-200 border-l-4 border-l-rose-500 p-4 rounded-lg space-y-2 shadow-2xs hover:shadow-xs transition-shadow"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">
                  {blk.project?.location.name}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                  {blk.category}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-800">
                  {blk.title}
                </h4>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                  {blk.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span>Severity: <strong className="text-rose-700 font-mono">{blk.severity}</strong></span>
                {blk.project && (
                  <button
                    onClick={() => {
                      const p = projects.find((proj) => proj.id === blk.projectId);
                      if (p) onSelectProject(p);
                    }}
                    className="text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    <span>View Track</span>
                    <span className="text-xs">→</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
