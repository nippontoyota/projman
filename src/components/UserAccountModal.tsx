'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { IconClose, IconLogout } from '@/components/ui/Icons';
import { useToast } from '@/context/ToastContext';
import { getUserAvatarInfo } from '@/lib/userAvatar';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({ isOpen, onClose }) => {
  const { user, userRole, isAdmin, logout } = useAuth();
  const toast = useToast();

  const [newUserId, setNewUserId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const avatar = getUserAvatarInfo(user?.username || '', userRole);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = newUserId.trim().toLowerCase();
    if (!cleanId) {
      setError('Please enter a user ID');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanId,
          name: cleanId.toUpperCase(),
          role: 'User',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create user');
      }

      toast.success('User Created', `User "${cleanId}" created (password: test)`);
      setNewUserId('');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating user';
      setError(msg);
      toast.error('Creation Failed', msg);
    } finally {
      setIsCreating(false);
    }
  };

  const handleLogout = async () => {
    onClose();
    await logout();
    toast.success('Signed Out', 'You have been logged out successfully');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Subtle click-outside backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-2xs cursor-default"
          />

          {/* Compact Popover right near the profile icon */}
          <div className="absolute right-0 top-full mt-2 z-50 w-72">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -6 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: 'top right' }}
              className="bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden text-slate-900 ring-1 ring-black/5"
            >
              {/* Clean Header: Icon + Name Only */}
              <div className="px-4 py-3.5 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shadow-xs shrink-0 ${avatar.bg}`}
                  >
                    {avatar.text}
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 truncate">
                    {user?.role === 'Admin' || user?.username === 'admin' || user?.name === 'Administrator' ? 'Admin' : (user?.name || 'User')}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 text-slate-400 hover:text-black rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                >
                  <IconClose className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-3.5 space-y-3">
                {/* Admin user creation */}
                {isAdmin && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Create User
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">pw: test</span>
                    </div>

                    {error && (
                      <div className="p-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-[11px] rounded-lg">
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleCreateUser} className="flex items-center space-x-1.5">
                      <input
                        type="text"
                        value={newUserId}
                        onChange={(e) => setNewUserId(e.target.value)}
                        placeholder="e.g. user4..."
                        className="flex-1 min-w-0 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-black focus:outline-none font-mono"
                      />

                      <button
                        type="submit"
                        disabled={isCreating}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50 shrink-0"
                      >
                        {isCreating ? '...' : '+ Add'}
                      </button>
                    </form>
                  </div>
                )}

                {/* Clean, Modern Light-Red Logout Button */}
                <div className={isAdmin ? 'pt-2 border-t border-slate-100' : ''}>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200/70 font-bold text-xs rounded-xl shadow-2xs hover:shadow-xs transition-colors cursor-pointer"
                  >
                    <IconLogout className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Log Out of Session</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
