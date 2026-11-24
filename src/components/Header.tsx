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
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 text-slate-900">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-13">
          {/* Brand */}
          <div className="flex items-center space-x-6">
            <span className="font-bold text-sm text-slate-950 tracking-tight">
              Incheon Mobility
            </span>

            {/* Seamless Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-5 h-13">
              {tabs.map((tab) => {
                const isActive = currentTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setCurrentTab(tab.id)}
                    className={`relative h-full flex items-center text-xs transition-colors cursor-pointer ${
                      isActive ? 'text-slate-950 font-semibold' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-950"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2">
            {/* Minimal Role Switcher */}
            <div className="flex items-center border border-slate-200 rounded-md overflow-hidden text-xs">
              {(['Admin', 'User'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setUserRole(role)}
                  className={`px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                    userRole === role
                      ? 'bg-slate-950 text-white'
                      : 'bg-white text-slate-500 hover:text-slate-900'
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
                className="flex items-center space-x-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-md text-xs transition-colors cursor-pointer shadow-2xs"
              >
                <IconPlus className="w-3.5 h-3.5" />
                <span>New Project</span>
              </button>
            )}

            {/* Export Excel Button */}
            <button
              onClick={onExportExcel}
              className="p-1 rounded-md text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 transition-colors border border-slate-200 cursor-pointer"
              title="Export Excel (.xlsx)"
            >
              <IconDownload className="w-3.5 h-3.5" />
            </button>

            {/* Reset Data Button */}
            <button
              onClick={onResetData}
              disabled={isResetting}
              className="p-1 rounded-md text-slate-400 hover:text-rose-600 bg-white hover:bg-slate-50 transition-colors border border-slate-200 disabled:opacity-50 cursor-pointer"
              title="Reset Dataset"
            >
              <IconSync className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center space-x-4 py-2 border-t border-slate-100 overflow-x-auto text-xs">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`py-1 whitespace-nowrap font-medium transition-colors cursor-pointer ${
                  isActive ? 'text-slate-950 font-bold border-b border-slate-950' : 'text-slate-500'
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
