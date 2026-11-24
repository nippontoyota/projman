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
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 text-slate-900 shadow-xs">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Corporate Brand Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center font-bold text-white text-sm tracking-wider shadow-xs">
              IM
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm sm:text-base text-slate-900 tracking-tight">
                  INCHEON MOBILITY
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
                  River EV Projects
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Kerala Dealership Expansion Program • {totalProjects} Active Tracks
              </p>
            </div>
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
                const Icon = role === 'Admin' ? Shield : User;

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
                    <Icon className={`w-3 h-3 relative z-10 ${isSelected ? (role === 'Admin' ? 'text-purple-600' : 'text-blue-600') : ''}`} />
                    <span className="relative z-10">{role}</span>
                  </button>
                );
              })}
            </div>

            {/* Admin New Project CTA */}
            {userRole === 'Admin' ? (
              <button
                onClick={onOpenCreateModal}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
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
              <Download className="w-4 h-4" />
            </button>

            {/* Reset Data Button */}
            <button
              onClick={onResetData}
              disabled={isResetting}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 bg-white hover:bg-slate-50 transition-colors border border-slate-300 shadow-xs disabled:opacity-50 cursor-pointer"
              title="Reset to Original Master Dataset"
            >
              <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
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
