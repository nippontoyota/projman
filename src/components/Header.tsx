'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UserRole } from '@/types';
import {
  IconPlus,
  IconDownload,
  IconSync,
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
}) => {
  const tabs = [
    { id: 'gantt', label: 'Gantt' },
    { id: 'dashboard', label: 'Overview' },
    { id: 'matrix', label: 'Milestones' },
    { id: 'blockers', label: 'Bottlenecks' },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-white text-slate-900">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <div className="flex items-center space-x-8">
            <span className="font-black text-base sm:text-lg text-black tracking-tight">
              Incheon Mobility
            </span>

            {/* Seamless Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-6 h-14">
              {tabs.map((tab) => {
                const isActive = currentTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setCurrentTab(tab.id)}
                    className={`relative h-full flex items-center text-sm transition-colors cursor-pointer ${
                      isActive ? 'text-black font-bold' : 'text-slate-500 hover:text-black font-semibold'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-black"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2.5">
            {/* Minimal Role Switcher */}
            <div className="flex items-center border border-slate-200 rounded-xs overflow-hidden text-xs">
              {(['Admin', 'User'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setUserRole(role)}
                  className={`px-3 py-1.5 text-xs font-bold tracking-wide transition-colors cursor-pointer ${
                    userRole === role
                      ? 'bg-black text-white'
                      : 'bg-white text-slate-500 hover:text-black'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {/* Admin New Project CTA */}
            {userRole === 'Admin' && (
              <button
                onClick={onOpenCreateModal}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-black hover:bg-neutral-800 text-white font-bold rounded-xs text-xs sm:text-sm transition-colors cursor-pointer shadow-xs"
              >
                <IconPlus className="w-3.5 h-3.5" />
                <span>New Project</span>
              </button>
            )}

            {/* Export Excel Button */}
            <button
              onClick={onExportExcel}
              className="p-1.5 rounded-xs text-slate-600 hover:text-black bg-white hover:bg-slate-50 transition-colors border border-slate-200 cursor-pointer"
              title="Export Excel (.xlsx)"
            >
              <IconDownload className="w-3.5 h-3.5" />
            </button>

            {/* Reset Data Button */}
            <button
              onClick={onResetData}
              disabled={isResetting}
              className="p-1.5 rounded-xs text-slate-400 hover:text-rose-600 bg-white hover:bg-slate-50 transition-colors border border-slate-200 disabled:opacity-50 cursor-pointer"
              title="Reset Dataset"
            >
              <IconSync className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center space-x-5 py-2.5 overflow-x-auto text-sm">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`py-1 whitespace-nowrap font-bold transition-colors cursor-pointer ${
                  isActive ? 'text-black border-b-2 border-black' : 'text-slate-500'
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
