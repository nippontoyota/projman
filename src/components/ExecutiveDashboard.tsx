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
        className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-3 border-b border-slate-200"
      >
        <div className="flex items-baseline space-x-2">
          <h1 className="text-base font-semibold text-slate-900 tracking-tight">
            Portfolio Overview
          </h1>
          <span className="text-xs text-slate-400 font-mono">
            (Target: 31 Mar 2027 · {metrics.daysToTarget}d remaining)
          </span>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Baseline: 19 Nov 2026
        </div>
      </motion.div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Total Projects */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200 rounded-lg p-3.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Total Projects
            </span>
            <IconFacility className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">{metrics.totalTracks}</span>
            <span className="text-xs text-slate-400">8 cities</span>
          </div>
        </motion.div>

        {/* Completed Showrooms */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200 rounded-lg p-3.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Completed Showrooms
            </span>
            <IconCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-emerald-600 font-mono">
              {metrics.commissionedCount}
            </span>
            <span className="text-xs text-emerald-600 font-mono">
              ({Math.round((metrics.commissionedCount / metrics.totalTracks) * 100)}%)
            </span>
          </div>
        </motion.div>

        {/* In Progress */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200 rounded-lg p-3.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              In Progress
            </span>
            <IconDashboard className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">{metrics.openProjectsCount}</span>
            <span className="text-xs text-slate-400">projects</span>
          </div>
        </motion.div>

        {/* Days Remaining */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200 rounded-lg p-3.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Days Remaining
            </span>
            <IconRadar className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-amber-600 font-mono">{metrics.daysToTarget}</span>
            <span className="text-xs text-slate-400">days</span>
          </div>
        </motion.div>

        {/* Open Issues */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200 rounded-lg p-3.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Open Issues
            </span>
            <IconEscalation className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-rose-600 font-mono">{openBlockers.length}</span>
            <span className="text-xs text-rose-600">blockers</span>
          </div>
        </motion.div>
      </div>

      {/* Mid Section: Portfolio Status & Benchmarks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status Breakdown */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900 text-xs">Status Breakdown</h3>
            <span className="text-[11px] text-slate-400 font-mono">
              15 Projects
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
          className="bg-white border border-slate-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900 text-xs">Stage Durations (Average Days)</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold">
                  <th className="pb-2">Stage</th>
                  <th className="pb-2 text-center">Avg Days</th>
                  <th className="pb-2 text-center">Min Days</th>
                  <th className="pb-2 text-center">Max Days</th>
                  <th className="pb-2 text-right">Projects</th>
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
        className="bg-white border border-slate-200 rounded-lg p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900 text-sm">
            Open Issues
          </h3>
          <span className="text-xs text-rose-600 font-mono">
            ({openBlockers.length} issues)
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {openBlockers.map((blk) => (
            <div
              key={blk.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/50 -mx-2 px-2 rounded-lg transition-colors"
            >
              <div className="space-y-0.5 max-w-xl">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-950 text-xs">
                    {blk.project?.location.name}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                    {blk.category}
                  </span>
                  <span className="text-[10px] font-semibold font-mono text-rose-700">
                    [{blk.severity}]
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  {blk.title}
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1">
                  {blk.description}
                </p>
              </div>

              {blk.project && (
                <button
                  onClick={() => {
                    const p = projects.find((proj) => proj.id === blk.projectId);
                    if (p) onSelectProject(p);
                  }}
                  className="text-blue-600 hover:text-blue-700 font-semibold text-xs shrink-0 self-start sm:self-center cursor-pointer"
                >
                  <span>View Details →</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
