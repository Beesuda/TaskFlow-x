/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { Projects } from './components/Projects';
import { ProjectDetail } from './components/ProjectDetail';
import { TeamMembers } from './components/TeamMembers';
import { Settings } from './components/Settings';
import { TaskFormModal } from './components/TaskFormModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { Preloader } from './components/Preloader';
import { Task, TaskStatus } from './types';
import { AnimatePresence, motion } from 'motion/react';

const AppContent: React.FC = () => {
  const { navState, currentUser, isPreloading } = useApp();

  // Modal triggering states
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(1);
  const [selectedTaskStatus, setSelectedTaskStatus] = useState<TaskStatus | undefined>(undefined);
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  // Trigger: Open task builder
  const handleOpenTaskForm = (projId: number, defaultStatus?: TaskStatus) => {
    setSelectedProjectId(projId);
    setSelectedTaskStatus(defaultStatus);
    setTaskToEdit(undefined);
    setIsTaskFormOpen(true);
  };

  // Trigger: Open task detail card
  const handleOpenTaskDetail = (taskId: number) => {
    setSelectedTaskId(taskId);
    setIsTaskDetailOpen(true);
  };

  // Trigger: transition task detail directly to edit mode
  const handleTransitionToEditTask = (task: Task) => {
    setIsTaskDetailOpen(false);
    setSelectedProjectId(task.projectId);
    setTaskToEdit(task);
    setIsTaskFormOpen(true);
  };

  // Global Quick Creator shortcuts
  const handleGlobalNewTaskTrigger = () => {
    // If we're inside a project detail screen, use that project ID. Otherwise, use project 1.
    const activeProjId = navState.screen === 'PROJECT_DETAIL' && navState.projectId
      ? navState.projectId
      : 1;
    handleOpenTaskForm(activeProjId, 'To Do');
  };

  // Renders correct main body screen
  const renderScreen = () => {
    switch (navState.screen) {
      case 'DASHBOARD':
        return <Dashboard />;
      case 'PROJECTS':
        return <Projects />;
      case 'PROJECT_DETAIL':
        return (
          <ProjectDetail 
            onNewTaskClick={handleOpenTaskForm} 
            onTaskClick={handleOpenTaskDetail} 
          />
        );
      case 'TEAM':
        return <TeamMembers />;
      case 'SETTINGS':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  // Login safety fallback
  if (navState.screen === 'LOGIN' || !currentUser) {
    return <Login />;
  }

  // Intercept the routing stack parameters to auto-launch detail modal on direct navigation
  if (navState.screen === 'PROJECT_DETAIL' && navState.taskId && !isTaskDetailOpen && selectedTaskId !== navState.taskId) {
    // Timeout to bypass double state renders
    setTimeout(() => {
      setSelectedTaskId(navState.taskId!);
      setIsTaskDetailOpen(true);
    }, 50);
  }

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-100 theme-bg font-sans select-none antialiased">
      {/* Preloading Status indicator overlay and top progress bar */}
      <Preloader isLoading={isPreloading} />

      {/* 1. LAYOUT NAVIGATION PANEL */}
      <Navigation onNewTaskClick={handleGlobalNewTaskTrigger} />

      {/* 2. MAIN WORKING FRAME CONTAINER */}
      <main className="md:pl-64 min-h-screen pb-20 sm:pb-6 pt-18 md:pt-6 px-4 sm:px-6 w-full max-w-7xl mx-auto flex flex-col justify-between">
        
        {/* Animated slide transitions for views */}
        <AnimatePresence mode="wait">
          <motion.div
            key={navState.screen + (navState.projectId ? `-${navState.projectId}` : '')}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            className="flex-1"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>

        {/* Humbler footer panel */}
        <footer className="mt-12 pt-6 border-t border-slate-150 dark:border-slate-800 text-[11px] theme-text-muted flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <span>TaskFlow Workspace Administration Engine • MVP Release v1.0</span>
          <span>© 2026 Google AI Studio Build</span>
        </footer>
      </main>

      {/* 3. FLOATING MODALS OVERLAYS */}
      {/* Task Creation Modal */}
      <AnimatePresence>
        {isTaskFormOpen && (
          <TaskFormModal
            isOpen={isTaskFormOpen}
            onClose={() => setIsTaskFormOpen(false)}
            projectId={selectedProjectId}
            taskToEdit={taskToEdit}
            defaultStatus={selectedTaskStatus}
          />
        )}
      </AnimatePresence>

      {/* Task detail card modal */}
      <AnimatePresence>
        {isTaskDetailOpen && selectedTaskId !== null && (
          <TaskDetailModal
            taskId={selectedTaskId}
            isOpen={isTaskDetailOpen}
            onClose={() => { setIsTaskDetailOpen(false); setSelectedTaskId(null); }}
            onEditClick={handleTransitionToEditTask}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
