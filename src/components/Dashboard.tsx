/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Task, Project, ActivityLog } from '../types';
import { 
  FolderGit, 
  CheckSquare, 
  AlertCircle, 
  Clock, 
  TrendingUp, 
  ArrowUpRight, 
  Plus, 
  Users,
  Search,
  MessageSquare
} from 'lucide-react';
import { motion } from 'motion/react';

export const Dashboard: React.FC = () => {
  const { 
    currentUser, 
    projects, 
    tasks, 
    activityLogs, 
    navigateTo, 
    users 
  } = useApp();

  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading states for high fidelity
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(idx => (
            <div key={idx} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const doneTasksCount = tasks.filter(t => t.status === 'Done').length;
  
  // Calculate general progress percentage average
  const totalProgress = totalProjects > 0 
    ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / totalProjects)
    : 0;

  // Filter tasks due soon or today (June 2026 current frame as per local metadata)
  const myAssignedTasks = tasks.filter(t => t.assigneeId === currentUser?.id);
  
  // Hardcoded due today and deadlines
  const sortedDeadlines = [...tasks]
    .filter(t => t.status !== 'Done')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  // Helper to map assignee usernames/avatars safely
  const getUserAvatar = (id: number | null) => {
    if (id === null) return null;
    const found = users.find(u => u.id === id);
    return found ? found.avatar : '??';
  };

  const getUserName = (id: number) => {
    const found = users.find(u => u.id === id);
    return found ? found.name : 'Unknown User';
  };

  // Helper for activity log actions styling
  const getActivityBadge = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400';
      case 'changed_status':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400';
      case 'assigned':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400';
      case 'commented':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
      case 'deleted':
        return 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-linear-to-r from-blue-600 to-indigo-700 rounded-2xl text-white shadow-lg overflow-hidden relative">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <h2 className="bold-title text-3xl tracking-tighter">
            Welcome back, {currentUser?.name}! 👋
          </h2>
          <p className="text-sm text-blue-100/90 mt-1 max-w-xl font-medium">
            You have <strong className="text-white underline">{myAssignedTasks.filter(t => t.status !== 'Done').length} unresolved tasks</strong> assigned to you. Here is the latest team workspace snapshot.
          </p>
        </div>
        <button
          onClick={() => navigateTo('PROJECTS')}
          className="shrink-0 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 transition-all rounded-lg font-semibold text-xs shadow-sm cursor-pointer"
          id="dash-explore-projects-btn"
        >
          <span>Explore Projects</span>
          <ArrowUpRight size={14} />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-grid">
        {/* Metric 1 */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs theme-card">
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Active Projects
            </span>
            <span className="text-3xl font-extrabold tracking-tight theme-text mt-1 block">
              {totalProjects}
            </span>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
            <FolderGit size={20} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs theme-card">
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Total Board Tasks
            </span>
            <span className="text-3xl font-extrabold tracking-tight theme-text mt-1 block">
              {totalTasks}
            </span>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <CheckSquare size={20} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs theme-card">
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Tasks Completed
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold tracking-tight theme-text">
                {doneTasksCount}
              </span>
              <span className="text-xs font-semibold text-green-500 flex items-center gap-0.5">
                <TrendingUp size={12} />
                {totalTasks > 0 ? Math.round((doneTasksCount / totalTasks) * 100) : 0}%
              </span>
            </div>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg">
            <CheckSquare size={20} />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs theme-card">
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              In Progress Work
            </span>
            <span className="text-3xl font-extrabold tracking-tight theme-text mt-1 block">
              {inProgressTasks}
            </span>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
            <AlertCircle size={20} />
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column (col-span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Projects Summary Grid */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs theme-card" id="dash-projects-board">
            <div className="flex items-center justify-between mb-4">
              <h3 className="bold-title text-sm uppercase tracking-wider theme-text flex items-center gap-2">
                <FolderGit size={18} className="text-blue-500" />
                <span>Active Workspaces</span>
              </h3>
              <button 
                onClick={() => navigateTo('PROJECTS')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map(project => {
                const projectTasksCount = tasks.filter(t => t.projectId === project.id).length;
                const completedTasks = tasks.filter(t => t.projectId === project.id && t.status === 'Done').length;
                return (
                  <div
                    key={project.id}
                    onClick={() => navigateTo('PROJECT_DETAIL', project.id)}
                    className="p-4 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl transition-all cursor-pointer group hover:shadow-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200/20">
                          {project.category || 'Workspace'}
                        </span>
                        <h4 className="font-bold text-sm tracking-tight theme-text mt-2 group-hover:text-blue-600 transition-colors">
                          {project.name}
                        </h4>
                      </div>
                      <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 shrink-0" />
                    </div>

                    <p className="text-xs theme-text-secondary mt-1 line-clamp-2">
                      {project.description}
                    </p>

                    <div className="mt-4 pt-2">
                      <div className="flex justify-between items-center text-[10px] font-bold theme-text-secondary mb-1">
                        <span>Progress ({project.progress}%)</span>
                        <span>{completedTasks}/{projectTasksCount} Done</span>
                      </div>
                      <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full transition-all duration-300" 
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Critical Task Deadlines */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs theme-card" id="dash-deadlines-board">
            <h3 className="bold-title text-sm uppercase tracking-wider theme-text flex items-center gap-2 mb-4">
              <Clock size={18} className="text-amber-500" />
              <span>Upcoming Project Deadlines</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-2.5">Task Name</th>
                    <th className="py-2.5">Project</th>
                    <th className="py-2.5">Priority</th>
                    <th className="py-2.5">Due Date</th>
                    <th className="py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sortedDeadlines.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-xs theme-text-muted">
                        No pending deadlines. Excellent job!
                      </td>
                    </tr>
                  ) : (
                    sortedDeadlines.map(task => {
                      const associatedProject = projects.find(p => p.id === task.projectId);
                      const priorityColor = task.priority === 'High' 
                        ? 'text-red-600 bg-red-100 dark:bg-red-500/10 dark:text-red-400' 
                        : task.priority === 'Medium' 
                        ? 'text-amber-600 bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400' 
                        : 'text-gray-600 bg-gray-100 dark:bg-gray-500/10 dark:text-gray-400';
                      
                      return (
                        <tr key={task.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition">
                          <td className="py-3 font-medium theme-text max-w-[180px] truncate">
                            {task.title}
                          </td>
                          <td className="py-3 text-xs theme-text-secondary">
                            {associatedProject?.name || 'Unknown'}
                          </td>
                          <td className="py-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${priorityColor}`}>
                              {task.priority}
                            </span>
                          </td>
                          <td className="py-3 text-xs theme-text-secondary antialiased font-medium">
                            {task.dueDate}
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => navigateTo('PROJECT_DETAIL', task.projectId, task.id)}
                              className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right column: activity timeline & metrics */}
        <div className="space-y-6">
          {/* Quick Tasks Assigned to Me */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs theme-card" id="dash-my-tasks">
            <h3 className="bold-title text-sm uppercase tracking-wider theme-text flex items-center justify-between mb-4">
              <span>My Tasks ({myAssignedTasks.filter(t => t.status !== 'Done').length})</span>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-sans">
                Assigned to you
              </span>
            </h3>

            {myAssignedTasks.filter(t => t.status !== 'Done').length === 0 ? (
              <div className="py-6 text-center text-xs theme-text-muted border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4">
                No active tasks assigned.
              </div>
            ) : (
              <div className="space-y-3 max-h-[190px] overflow-y-auto pr-1">
                {myAssignedTasks
                  .filter(t => t.status !== 'Done')
                  .map(task => (
                    <div 
                      key={task.id}
                      onClick={() => navigateTo('PROJECT_DETAIL', task.projectId, task.id)}
                      className="p-3 border border-slate-100 dark:border-slate-800/80 rounded-xl hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/10 cursor-pointer transition flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold theme-text truncate leading-tight">{task.title}</p>
                        <p className="text-[10px] theme-text-secondary font-medium tracking-tight mt-1">
                          Status: <span className="text-blue-600 dark:text-blue-400">{task.status}</span> • Due: {task.dueDate}
                        </p>
                      </div>
                      <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-sm ${
                        task.priority === 'High' ? 'bg-red-50 text-red-600 dark:bg-red-900/10' : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Recent Team Activity */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs theme-card" id="dash-activity-timeline">
            <h3 className="bold-title text-sm uppercase tracking-wider theme-text flex items-center justify-between mb-4 font-sans">
              <span className="flex items-center gap-2">
                <Users size={18} className="text-indigo-500" />
                <span>Recent Team Activity</span>
              </span>
            </h3>

            <div className="relative border-l border-slate-200 dark:border-slate-800 ml-3.5 space-y-4 max-h-[290px] overflow-y-auto pr-1">
              {activityLogs.length === 0 ? (
                <p className="text-xs theme-text-muted pl-4 py-3">No activity logged.</p>
              ) : (
                activityLogs.map((log) => {
                  const logUser = users.find(u => u.id === log.userId);
                  const isComment = log.action === 'commented';
                  return (
                    <div key={log.id} className="relative pl-5">
                      {/* Timeline pointer */}
                      <span className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 bg-blue-600" />
                      
                      <div className="text-xs">
                        {/* Header snippet */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold theme-text">{logUser ? logUser.name : 'Unknown User'}</span>
                          <span className={`text-[9px] px-1.5 rounded-full font-semibold ${getActivityBadge(log.action)}`}>
                            {log.action}
                          </span>
                        </div>
                        
                        {/* Details */}
                        <p className="theme-text-secondary text-xs mt-1 leading-relaxed font-normal">
                          {log.details}
                        </p>
                        
                        {/* Timestamp */}
                        <span className="text-[10px] theme-text-muted mt-1 block font-medium">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
