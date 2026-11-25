'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser, UserRole } from '@/types';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  userRole: UserRole;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchUserQuick: (username: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check existing session on mount
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success && data.data) {
        setUser(data.data);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Session check failed:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setUser(data.data);
        return { success: true };
      }
      return { success: false, error: data.error || 'Invalid credentials' };
    } catch (err) {
      console.error('Login request failed:', err);
      return { success: false, error: 'Network error during login' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  const switchUserQuick = async (username: string) => {
    const res = await login(username, 'test');
    return res.success;
  };

  const userRole: UserRole = user?.role || 'User';
  const isAdmin = userRole === 'Admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        userRole,
        isAdmin,
        login,
        logout,
        switchUserQuick,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
