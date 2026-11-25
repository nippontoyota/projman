'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import {
  IconPlus,
  IconDownload,
  IconSync,
  IconUser,
  IconLogout,
  IconChevronRight,
} from '@/components/ui/Icons';

interface HeaderProps {
  currentTab: 'gantt' | 'dashboard' | 'matrix' | 'blockers';
  setCurrentTab: (tab: 'gantt' | 'dashboard' | 'matrix' | 'blockers') => void;
  onOpenCreateModal: () => void;
  onExportExcel: () => void;
  onResetData: () => void;
  isResetting: boolean;
  totalProjects: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenCreateModal,
  onExportExcel,
  onResetData,
  isResetting,
}) => {
  const { user, userRole, isAdmin, logout, switchUserQuick } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isUserMenuOpen]);

  const tabs = [
    { id: 'gantt', label: 'Gantt' },
    { id: 'dashboard', label: 'Overview' },
    { id: 'matrix', label: 'Milestones' },
    { id: 'blockers', label: 'Bottlenecks' },
  ] as const;

  const accounts = [
    { username: 'admin', name: 'Administrator', role: 'Admin' },
    { username: 'user1', name: 'User 1', role: 'User' },
    { username: 'user2', name: 'User 2', role: 'User' },
    { username: 'user3', name: 'User 3', role: 'User' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white text-slate-900 border-b border-slate-200">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-black text-base sm:text-lg text-black tracking-tight">
                Incheon Mobility
              </span>
            </div>

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
            {/* Admin New Project CTA (Only visible to Admin) */}
            <AnimatePresence mode="popLayout">
              {isAdmin && (
                <motion.button
                  key="new-project-btn"
                  initial={{ opacity: 0, scale: 0.95, x: -6 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: -6 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  onClick={onOpenCreateModal}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-black hover:bg-neutral-800 text-white font-bold rounded text-xs sm:text-sm transition-colors cursor-pointer shadow-xs shrink-0"
                >
                  <IconPlus className="w-3.5 h-3.5" />
                  <span>New Project</span>
                </motion.button>
              )}
            </AnimatePresence>

            {/* User Profile & RBAC Switcher Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                title="Account & Role Switcher"
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isAdmin ? 'bg-black text-white' : 'bg-sky-600 text-white'
                }`}>
                  {user?.name ? user.name.charAt(0) : 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {user?.name || 'User'}
                  </div>
                </div>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold tracking-tight ${
                  isAdmin
                    ? 'bg-black text-white'
                    : 'bg-sky-100 text-sky-800 border border-sky-200'
                }`}>
                  {userRole}
                </span>
              </button>

              {/* Account Dropdown Menu */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-lg py-2 z-50 text-slate-800"
                  >
                    {/* Signed In Header */}
                    <div className="px-3 py-2 border-b border-slate-100">
                      <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                        Signed In Profile
                      </div>
                      <div className="text-sm font-bold text-slate-900 flex items-center justify-between mt-0.5">
                        <span>{user?.name}</span>
                        <span className={`px-1.5 py-0.2 text-[10px] font-mono font-bold rounded ${
                          isAdmin ? 'bg-black text-white' : 'bg-sky-100 text-sky-800'
                        }`}>
                          {userRole}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono">@{user?.username}</div>
                    </div>

                    {/* Quick Switch Profiles */}
                    <div className="px-3 py-1.5">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">
                        Switch Account (Password: test)
                      </div>
                      <div className="space-y-1">
                        {accounts.map((acc) => {
                          const isCurrent = user?.username === acc.username;
                          return (
                            <button
                              key={acc.username}
                              type="button"
                              onClick={async () => {
                                if (!isCurrent) {
                                  await switchUserQuick(acc.username);
                                }
                                setIsUserMenuOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors cursor-pointer text-left ${
                                isCurrent
                                  ? 'bg-slate-100 font-bold text-black cursor-default'
                                  : 'hover:bg-slate-50 text-slate-600 hover:text-black'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  acc.role === 'Admin' ? 'bg-black' : 'bg-sky-500'
                                }`} />
                                <span>{acc.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono font-normal">
                                  ({acc.username})
                                </span>
                              </div>
                              <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                                acc.role === 'Admin'
                                  ? 'bg-black text-white font-bold'
                                  : 'bg-slate-200 text-slate-700'
                              }`}>
                                {acc.role}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Divider & Sign Out */}
                    <div className="border-t border-slate-100 pt-1 mt-1 px-1">
                      <button
                        type="button"
                        onClick={async () => {
                          setIsUserMenuOpen(false);
                          await logout();
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer text-left"
                      >
                        <IconLogout className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Export Excel Button */}
            <button
              onClick={onExportExcel}
              className="p-1.5 rounded text-slate-600 hover:text-black bg-white hover:bg-slate-50 transition-colors border border-slate-200 cursor-pointer"
              title="Export Excel (.xlsx)"
            >
              <IconDownload className="w-3.5 h-3.5" />
            </button>

            {/* Reset Data Button (Only visible to Admin) */}
            {isAdmin && (
              <button
                onClick={onResetData}
                disabled={isResetting}
                className="p-1.5 rounded text-slate-400 hover:text-rose-600 bg-white hover:bg-slate-50 transition-colors border border-slate-200 disabled:opacity-50 cursor-pointer"
                title="Reset Dataset (Admin Only)"
              >
                <IconSync className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              </button>
            )}

            {/* Direct Sign Out Icon CTA */}
            <button
              onClick={logout}
              className="p-1.5 rounded text-slate-400 hover:text-rose-600 bg-white hover:bg-slate-50 transition-colors border border-slate-200 cursor-pointer"
              title="Sign Out"
            >
              <IconLogout className="w-3.5 h-3.5" />
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
