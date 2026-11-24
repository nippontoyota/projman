'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UserRole } from '@/types';
import {
  CalendarRange,
  LayoutDashboard,
  TableProperties,
  AlertOctagon,
  Plus,
  Download,
  RotateCcw,
  Shield,
  User,
  Zap,
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'gantt' | 'dashboard' | 'matrix' | 'blockers';
  setCurrentTab: (tab: 'gantt' | 'dashboard' | 'matrix' | 'blockers') => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  onOpenCreateModal: () => void;
  onExportExcel: () => void;
  onResetData: () => void;
  isResetting: boolean;
  totalProjects: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  userRole,
  setUserRole,
  onOpenCreateModal,
  onExportExcel,
  onResetData,
  isResetting,
  totalProjects,
}) => {
  const tabs = [
    { id: 'gantt', label: 'Gantt Timeline', icon: CalendarRange },
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'matrix', label: 'Milestone Matrix', icon: TableProperties },
    { id: 'blockers', label: 'Bottleneck Radar', icon: AlertOctagon },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 text-white shadow-lg">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand & Project Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 via-sky-600 to-indigo-600 flex items-center justify-center font-black text-white text-base tracking-wider shadow-lg shadow-sky-500/20 ring-1 ring-sky-400/30">
              IM
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base text-slate-100 tracking-tight">
                  INCHEON MOBILITY
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30 uppercase tracking-wider flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  <span>River EV Projects</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal">
                Kerala Dealership Expansion Program • {totalProjects} Active Tracks
              </p>
            </div>
          </div>

          {/* Animated Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800/80">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="headerActiveTab"
                      className="absolute inset-0 bg-gradient-to-r from-sky-600 to-sky-500 rounded-lg shadow-sm"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <Icon className={`w-3.5 h-3.5 relative z-10 ${isActive ? 'text-slate-950 font-bold' : ''}`} />
                  <span className={`relative z-10 ${isActive ? 'text-slate-950 font-bold' : ''}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center space-x-2.5">
            {/* Animated Role Switcher */}
            <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              {(['Admin', 'User'] as const).map((role) => {
                const isSelected = userRole === role;
                const Icon = role === 'Admin' ? Shield : User;

                return (
                  <button
                    key={role}
                    onClick={() => setUserRole(role)}
                    className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isSelected
                        ? role === 'Admin'
                          ? 'text-white'
                          : 'text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title={role === 'Admin' ? 'Admin: Full CRUD & creation' : 'User: Progress updates'}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="rolePill"
                        className={`absolute inset-0 rounded-lg shadow-sm ${
                          role === 'Admin' ? 'bg-purple-600' : 'bg-sky-600'
                        }`}
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <Icon className="w-3.5 h-3.5 relative z-10" />
                    <span className="relative z-10">{role}</span>
                  </button>
                );
              })}
            </div>

            {/* Admin New Project CTA */}
            {userRole === 'Admin' ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenCreateModal}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-sky-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>New Project</span>
              </motion.button>
            ) : (
              <div
                className="text-[11px] text-slate-500 px-2.5 py-1.5 bg-slate-900 rounded-xl border border-slate-800/80 cursor-default select-none hidden lg:block"
                title="Switch to Admin role to create projects"
              >
                Admin Mode for +Project
              </div>
            )}

            {/* Export Excel Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onExportExcel}
              className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 transition-colors border border-slate-800"
              title="Export Tracker to Excel (.xlsx)"
            >
              <Download className="w-4 h-4" />
            </motion.button>

            {/* Reset Data Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onResetData}
              disabled={isResetting}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 bg-slate-900 hover:bg-slate-800 transition-colors border border-slate-800 disabled:opacity-50"
              title="Reset to Original Master Dataset"
            >
              <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-800/80 overflow-x-auto text-xs space-x-1">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                  isActive ? 'bg-sky-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
