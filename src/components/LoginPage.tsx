'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import {
  IconCheck,
  IconAlertCircle,
  IconChevronRight,
  IconLock,
  IconUser,
} from '@/components/ui/Icons';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('test');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const res = await login(username.trim(), password.trim());
    if (!res.success) {
      setError(res.error || 'Authentication failed. Please verify credentials.');
      setIsSubmitting(false);
    }
  };

  const selectUser = async (u: string) => {
    setUsername(u);
    setPassword('test');
    setError(null);
    setIsSubmitting(true);
    const res = await login(u, 'test');
    if (!res.success) {
      setError(res.error || 'Authentication failed.');
      setIsSubmitting(false);
    }
  };

  const testAccounts = [
    {
      username: 'admin',
      name: 'Administrator',
      role: 'Admin',
      badge: 'bg-black text-white',
      desc: 'Full management: create/delete projects, setup specs, data reset',
    },
    {
      username: 'user1',
      name: 'User 1',
      role: 'User',
      badge: 'bg-sky-100 text-sky-800 border border-sky-300',
      desc: 'Project Coordinator: track milestones, update dates, log bottlenecks',
    },
    {
      username: 'user2',
      name: 'User 2',
      role: 'User',
      badge: 'bg-sky-100 text-sky-800 border border-sky-300',
      desc: 'Site Engineer: execution updates, field blockers & remarks',
    },
    {
      username: 'user3',
      name: 'User 3',
      role: 'User',
      badge: 'bg-sky-100 text-sky-800 border border-sky-300',
      desc: 'Facility Manager: site handover, documentation & commissioning',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden"
      >
        {/* Brand Header */}
        <div className="bg-black text-white px-6 py-6 text-center border-b border-neutral-800">
          <div className="inline-flex items-center space-x-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs uppercase tracking-widest font-mono text-neutral-400 font-bold">
              Incheon Mobility • Nippon Toyota
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            River EV Project Rollout
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Kerala Dealership Operations & Milestone Management
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 text-xs flex items-center space-x-2"
                >
                  <IconAlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <IconUser className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin or user1"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black font-mono transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <IconLock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="test"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black font-mono transition-colors"
                  required
                />
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-black hover:bg-neutral-800 text-white font-bold text-sm rounded shadow-sm transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <IconChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Role Switcher */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                1-Click Quick Access (Password: test)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">RBAC</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {testAccounts.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => selectUser(acc.username)}
                  disabled={isSubmitting}
                  className="flex items-center justify-between p-2.5 rounded border border-slate-200 hover:border-black hover:bg-slate-50 transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${acc.badge}`}>
                      {acc.role}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-black">
                        {acc.username} <span className="text-slate-400 font-normal">({acc.name})</span>
                      </div>
                      <div className="text-[10px] text-slate-500 leading-tight">
                        {acc.desc}
                      </div>
                    </div>
                  </div>
                  <IconChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-black shrink-0 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer info */}
      <div className="text-center text-[11px] text-slate-400 mt-6">
        Protected System • Multi-tier RBAC for Incheon Mobility & Nippon Toyota Dealership Rollouts
      </div>
    </div>
  );
};
