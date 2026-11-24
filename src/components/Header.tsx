'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UserRole } from '@/types';
import {
  IconGantt,
  IconDashboard,
  IconMatrix,
  IconRadar,
  IconPlus,
  IconDownload,
  IconSync,
  IconRoleShield,
  IconRoleUser,
} from '@/components/ui/Icons';

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
    { id: 'gantt', label: 'Gantt Timeline', icon: IconGantt },
    { id: 'dashboard', label: 'Executive Dashboard', icon: IconDashboard },
    { id: 'matrix', label: 'Milestone Matrix', icon: IconMatrix },
    { id: 'blockers', label: 'Bottleneck Radar', icon: IconRadar },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 text-slate-900 shadow-xs">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Corporate Brand Identity */}
          <div className="flex items-center space-x-3">
            <div className="flex items-baseline space-x-2">
              <span className="font-bold text-base text-slate-950 tracking-tight">
                INCHEON MOBILITY
              </span>
              <span className="text-xs font-medium text-slate-300 font-mono">/</span>
              <span className="text-xs font-semibold text-slate-600 tracking-tight">
                River EV Rollout
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 px-2 py-0.5 bg-slate-100 rounded-md border border-slate-200">
              {totalProjects} tracks
            </span>
          </div>

          {/* Clean Segmented Pill Navigation */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`relative flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="headerActiveTab"
                      className="absolute inset-0 bg-white rounded-lg shadow-xs border border-slate-200"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon className={`w-3.5 h-3.5 relative z-10 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2.5">
            {/* Role Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              {(['Admin', 'User'] as const).map((role) => {
                const isSelected = userRole === role;
                const Icon = role === 'Admin' ? IconRoleShield : IconRoleUser;

                return (
                  <button
                    key={role}
                    onClick={() => setUserRole(role)}
                    className={`relative flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isSelected ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="rolePill"
                        className="absolute inset-0 bg-white rounded-lg shadow-xs border border-slate-200"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <Icon className={`w-3.5 h-3.5 relative z-10 ${isSelected ? (role === 'Admin' ? 'text-slate-900' : 'text-blue-600') : 'text-slate-400'}`} />
                    <span className="relative z-10">{role}</span>
                  </button>
                );
              })}
            </div>

            {/* Admin New Project CTA */}
            {userRole === 'Admin' ? (
              <button
                onClick={onOpenCreateModal}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
              >
                <IconPlus className="w-3.5 h-3.5 stroke-[2]" />
                <span>New Project</span>
              </button>
            ) : (
              <div className="text-[11px] text-slate-400 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-200 select-none hidden lg:block">
                Admin mode for +Project
              </div>
            )}

            {/* Export Excel Button */}
            <button
              onClick={onExportExcel}
              className="p-1.5 rounded-lg text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 transition-colors border border-slate-300 shadow-xs cursor-pointer"
              title="Export Tracker to Excel (.xlsx)"
            >
              <IconDownload className="w-3.5 h-3.5" />
            </button>

            {/* Reset Data Button */}
            <button
              onClick={onResetData}
              disabled={isResetting}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 bg-white hover:bg-slate-50 transition-colors border border-slate-300 shadow-xs disabled:opacity-50 cursor-pointer"
              title="Reset to Original Master Dataset"
            >
              <IconSync className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-200 overflow-x-auto text-xs space-x-1">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                  isActive ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
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
