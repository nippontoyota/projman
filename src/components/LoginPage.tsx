'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { IconAlertCircle } from '@/components/ui/Icons';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
      setError(res.error || 'Invalid credentials. Please verify your username and password.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Clean Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Incheon Mobility
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sign in to your account
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center space-x-2">
                <IconAlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin, user1, user2..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 font-mono transition-colors"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="test"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-slate-900 font-mono transition-colors"
                required
              />
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-black text-white font-medium text-sm rounded-lg transition-colors cursor-pointer disabled:opacity-50 mt-2"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>

      <div className="text-xs text-slate-400 mt-5 font-mono">
        Incheon Mobility • Dealership Project Management
      </div>
    </div>
  );
};
