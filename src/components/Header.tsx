'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Project } from '@/types';
import { IconPlus, IconChevronRight } from '@/components/ui/Icons';
import { UserAccountModal } from '@/components/UserAccountModal';
import { getUserAvatarInfo } from '@/lib/userAvatar';

interface HeaderProps {
  selectedProject: Project | null;
  onBackToProjects: () => void;
  onOpenCreateModal: () => void;
  totalProjects: number;
}

export const Header: React.FC<HeaderProps> = ({
  selectedProject,
  onBackToProjects,
  onOpenCreateModal,
  totalProjects,
}) => {
  const { user, userRole, isAdmin } = useAuth();
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const avatar = getUserAvatarInfo(user?.username || '', userRole);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white text-slate-900 border-b border-slate-200 shadow-xs">
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">
            {/* Brand & Breadcrumb */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={onBackToProjects}
                className="flex items-center text-left hover:opacity-85 transition-opacity cursor-pointer"
              >
                <span className="font-black text-lg sm:text-xl text-black tracking-tight whitespace-nowrap">
                  Incheon Mobility
                </span>
              </button>

              {selectedProject && (
                <div className="flex items-center space-x-2 text-sm sm:text-base">
                  <IconChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-bold text-black flex items-center space-x-2">
                    <span className="font-mono text-xs px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md font-bold whitespace-nowrap inline-block">
                      {selectedProject.code}
                    </span>
                    <span className="hidden md:inline font-bold text-slate-900">{selectedProject.location?.name}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Right Action Controls: Create Project (Admin) + Profile Pill ONLY */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Admin Create New Project CTA */}
              <AnimatePresence mode="popLayout">
                {isAdmin && (
                  <motion.button
                    key="create-new-project-btn"
                    initial={{ opacity: 0, scale: 0.95, x: -6 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95, x: -6 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    onClick={onOpenCreateModal}
                    className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm transition-all cursor-pointer shadow-sm hover:shadow shrink-0"
                  >
                    <IconPlus className="w-4 h-4 stroke-[2.5]" />
                    <span>Create New Project</span>
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Profile Pill with anchored popover */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(!isAccountModalOpen)}
                  className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 transition-all cursor-pointer hover:border-slate-300 shadow-2xs"
                  title="Account menu"
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shadow-2xs ${avatar.bg}`}
                  >
                    {avatar.text}
                  </div>
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {user?.role === 'Admin' || user?.username === 'admin' || user?.name === 'Administrator' ? 'Admin' : (user?.name || 'User')}
                  </div>
                </button>

                {/* Popover right underneath the profile pill */}
                <UserAccountModal
                  isOpen={isAccountModalOpen}
                  onClose={() => setIsAccountModalOpen(false)}
                />
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
