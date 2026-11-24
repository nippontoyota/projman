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
    } finally {
      setIsLoading(false);
    }
  }, [selectedProject]);

  useEffect(() => {
    loadData();
  }, []);

  // Export to Excel
  const handleExportExcel = () => {
    exportProjectsToExcel(projects, stats);
  };

  // Reset database to master dataset
  const handleResetData = async () => {
    if (!confirm('Reset database to the original Incheon Mobility master dataset? Any custom changes will be restored.')) {
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch('/api/seed/reset', { method: 'POST' });
      if (res.ok) {
        await loadData();
        alert('Master dataset restored successfully!');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to reset dataset');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-sky-500 selection:text-slate-950">
      {/* Header with Role Switcher & Nav Tabs */}
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
            <div className="w-9 h-9 border-3 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-medium">
              Loading Incheon Mobility master tracker...
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
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
