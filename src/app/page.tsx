'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, DashboardStats } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { LoginPage } from '@/components/LoginPage';
import { Header } from '@/components/Header';
import { ProjectListView } from '@/components/ProjectListView';
import { UserDashboardView } from '@/components/UserDashboardView';
import { ProjectDetailGanttView } from '@/components/ProjectDetailGanttView';
import { CreateProjectModal } from '@/components/CreateProjectModal';
import { ProjectDetailDrawer } from '@/components/ProjectDetailDrawer';
import { TopLoader } from '@/components/ui/TopLoader';
import { useToast } from '@/context/ToastContext';
import { exportProjectsToExcel } from '@/lib/excelExport';

export default function Home() {
  const { user, userRole, isLoading: isAuthLoading } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const selectedProjectIdRef = useRef<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const toast = useToast();

  const handleSelectProject = useCallback((project: Project) => {
    selectedProjectIdRef.current = project.id;
    setSelectedProject(project);
  }, []);

  const handleBackToProjects = useCallback(() => {
    selectedProjectIdRef.current = null;
    setSelectedProject(null);
  }, []);

  // Fetch projects from database
  const loadData = useCallback(async () => {
    try {
      const [projRes, statsRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/stats'),
      ]);

      const projJson = await projRes.json();
      const statsJson = await statsRes.json();

      if (projJson.success) setProjects(projJson.data);
      if (statsJson.success) setStats(statsJson.data);

      // Only refresh selectedProject if a project is STILL actively open (prevent race conditions when backing out)
      if (selectedProjectIdRef.current) {
        const activeId = selectedProjectIdRef.current;
        const updated = projJson.data?.find((p: Project) => p.id === activeId);
        if (updated && selectedProjectIdRef.current === activeId) {
          setSelectedProject(updated);
        }
      }
    } catch (err) {
      console.error('Failed to load project data:', err);
      toast.error('Connection Error', 'Could not sync project tracks with server');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!user) return;
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [user, loadData]);

  // Export to Excel
  const handleExportExcel = () => {
    try {
      exportProjectsToExcel(projects, stats);
      toast.success(
        'Spreadsheet Exported',
        'Master Incheon Mobility rollout schedule saved as Excel (.xlsx)'
      );
    } catch (err) {
      console.error(err);
      toast.error('Export Failed', 'Unable to generate Excel file');
    }
  };

  // Reset database to master dataset
  const handleResetData = async () => {
    if (
      !confirm(
        'Reset database to the original Incheon Mobility master dataset? Any custom changes will be restored.'
      )
    ) {
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch('/api/seed/reset', { method: 'POST' });
      const json = await res.json();
      if (res.ok && json.success) {
        await loadData();
        toast.success(
          'Database Restored',
          '15 River EV showroom tracks & 315 milestone tasks reset to master'
        );
      } else {
        toast.error('Reset Failed', json.error || 'Server rejected reset request');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network Error', 'Failed to reach reset endpoint');
    } finally {
      setIsResetting(false);
    }
  };

  // If session is checking, show clean minimal loader
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">
          Authenticating Incheon Mobility Session...
        </p>
      </div>
    );
  }

  // If not logged in, render dedicated Login screen
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-black selection:text-white">
      {/* Sleek Global Modern TopLoader */}
      <TopLoader isLoading={isLoading || isResetting} />

      {/* Header with Breadcrumb and Actions */}
      <Header
        selectedProject={selectedProject}
        onBackToProjects={handleBackToProjects}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        totalProjects={projects.length}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-7">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-medium">
              Loading Incheon Mobility tracks...
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {selectedProject && userRole === 'Admin' ? (
              <motion.div
                key={`project-detail-${selectedProject.id}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <ProjectDetailGanttView
                  project={selectedProject}
                  onBack={handleBackToProjects}
                  onRefresh={loadData}
                  onOpenEditDrawer={() => setIsEditDrawerOpen(true)}
                />
              </motion.div>
            ) : userRole === 'Admin' ? (
              <motion.div
                key="admin-project-list"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <ProjectListView
                  projects={projects}
                  onSelectProject={handleSelectProject}
                  onOpenCreateModal={() => setIsCreateModalOpen(true)}
                  onRefresh={loadData}
                />
              </motion.div>
            ) : (
              <motion.div
                key={`user-dashboard-${user?.username}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <UserDashboardView
                  projects={projects}
                  onRefresh={loadData}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Admin Project Creation Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={loadData}
      />

      {/* Project Detail & Settings Drawer */}
      <ProjectDetailDrawer
        project={selectedProject}
        isOpen={isEditDrawerOpen && !!selectedProject}
        onClose={() => setIsEditDrawerOpen(false)}
        userRole={userRole}
        onUpdateSuccess={loadData}
      />
    </div>
  );
}
