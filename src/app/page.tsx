'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, DashboardStats, UserRole } from '@/types';
import { Header } from '@/components/Header';
import { GanttChart } from '@/components/GanttChart';
import { ExecutiveDashboard } from '@/components/ExecutiveDashboard';
import { ProjectTracker } from '@/components/ProjectTracker';
import { BlockerManager } from '@/components/BlockerManager';
import { CreateProjectModal } from '@/components/CreateProjectModal';
import { ProjectDetailDrawer } from '@/components/ProjectDetailDrawer';
import { TopLoader } from '@/components/ui/TopLoader';
import { useToast } from '@/context/ToastContext';
import { exportProjectsToExcel } from '@/lib/excelExport';

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [currentTab, setCurrentTab] = useState<'gantt' | 'dashboard' | 'matrix' | 'blockers'>('gantt');
  const [userRole, setUserRole] = useState<UserRole>('Admin');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const toast = useToast();

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

      if (selectedProject) {
        const updated = projJson.data?.find((p: Project) => p.id === selectedProject.id);
        if (updated) setSelectedProject(updated);
      }
    } catch (err) {
      console.error('Failed to load project data:', err);
      toast.error('Connection Error', 'Could not sync project tracks with server');
    } finally {
      setIsLoading(false);
    }
  }, [selectedProject, toast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans antialiased selection:bg-black selection:text-white">
      {/* Sleek Global Modern TopLoader */}
      <TopLoader isLoading={isLoading || isResetting} />

      {/* Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userRole={userRole}
        setUserRole={setUserRole}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onExportExcel={handleExportExcel}
        onResetData={handleResetData}
        isResetting={isResetting}
        totalProjects={projects.length}
      />

      {/* Main Content */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-medium">
              Loading Incheon Mobility master tracker...
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              {currentTab === 'gantt' && (
                <GanttChart
                  projects={projects}
                  onSelectProject={(p) => setSelectedProject(p)}
                />
              )}

              {currentTab === 'dashboard' && (
                <ExecutiveDashboard
                  stats={stats}
                  projects={projects}
                  onSelectProject={(p) => setSelectedProject(p)}
                />
              )}

              {currentTab === 'matrix' && (
                <ProjectTracker
                  projects={projects}
                  userRole={userRole}
                  onSelectProject={(p) => setSelectedProject(p)}
                  onRefresh={loadData}
                />
              )}

              {currentTab === 'blockers' && (
                <BlockerManager
                  projects={projects}
                  userRole={userRole}
                  onSelectProject={(p) => setSelectedProject(p)}
                  onRefresh={loadData}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Admin Project Creation Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={loadData}
      />

      {/* Project Detail & Milestones Drawer */}
      <ProjectDetailDrawer
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        userRole={userRole}
        onUpdateSuccess={loadData}
      />
    </div>
  );
}
