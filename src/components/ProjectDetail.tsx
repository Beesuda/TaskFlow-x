/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { KanbanBoard } from './KanbanBoard';
import { ListView } from './ListView';
import { TaskStatus, TaskPriority } from '../types';
import { 
  ChevronLeft, 
  LayoutGrid, 
  List, 
  Search, 
  Plus, 
  SlidersHorizontal, 
  RotateCcw,
  CheckCircle2,
  CalendarDays,
  FolderGit
} from 'lucide-react';
import { motion } from 'motion/react';

interface ProjectDetailProps {
  onNewTaskClick: (projectId: number, defaultStatus?: TaskStatus) => void;
  onTaskClick: (taskId: number) => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ onNewTaskClick, onTaskClick }) => {
  const { 
    navState, 
    navigateBack, 
    projects, 
    tasks, 
    users,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    resetFilters
  } = useApp();

  const [activeTab, setActiveTab] = useState<'kanban' | 'list'>('kanban');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Retrieve current active project
  const projectId = navState.projectId;
  const project = projects.find(p => p.id === projectId);

  // Tasks belonging exclusively to this project (memoized).
  const projectAllTasks = useMemo(
    () => tasks.filter(t => t.projectId === project?.id),
    [tasks, project?.id]
  );

  // Status counters for secondary header analytics (single pass).
  const tabCounts = useMemo(() => {
    const counts = { all: projectAllTasks.length, backlog: 0, todo: 0, progress: 0, review: 0, done: 0 };
    for (const t of projectAllTasks) {
      if (t.status === 'Backlog') counts.backlog++;
      else if (t.status === 'To Do') counts.todo++;
      else if (t.status === 'In Progress') counts.progress++;
      else if (t.status === 'Review') counts.review++;
      else if (t.status === 'Done') counts.done++;
    }
    return counts;
  }, [projectAllTasks]);

  // Filter pipeline (search + status/priority/assignee), memoized.
  const filteredTasks = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return projectAllTasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(q) || task.description.toLowerCase().includes(q);
      const matchesStatus = filters.status === 'All' || task.status === filters.status;
      const matchesPriority = filters.priority === 'All' || task.priority === filters.priority;
      const matchesAssignee = filters.assigneeId === 'All' || task.assigneeId === parseInt(filters.assigneeId, 10);
      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    });
  }, [projectAllTasks, searchQuery, filters]);

  if (!project) {
    return (
      <div className="text-center py-12 p-4 font-sans theme-card border rounded-2xl">
        <FolderGit size={44} className="mx-auto text-red-400 mb-2" />
        <p className="text-sm font-semibold theme-text">Workspace not found.</p>
        <button 
          onClick={navigateBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Safe user listing who belong in this project to show inside filters
  const projectAssignees = users;

  const handleStatusFilterClick = (statusValue: string) => {
    setFilters(prev => ({ ...prev, status: statusValue }));
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header section with Workspace details and navigation triggers */}
      <div className="flex flex-col gap-4">
        {/* Back Link Row */}
        <div>
          <button
            onClick={navigateBack}
            className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition cursor-pointer"
            id="workspace-back-btn"
          >
            <ChevronLeft size={16} />
            <span>Back to Workspaces</span>
          </button>
        </div>

        {/* Workspace Title Line, Creator Trigger */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200/20">
                {project.category || 'Workspace'}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1">
                <CalendarDays size={13} />
                Due {project.dueDate}
              </span>
            </div>
            
            <h2 className="bold-title text-3xl tracking-tighter uppercase theme-text mt-2" id="detail-workspace-title">
              {project.name}
            </h2>
            <p className="text-sm theme-text-secondary mt-1 max-w-xl leading-relaxed">
              {project.description}
            </p>
          </div>

          <button
            onClick={() => onNewTaskClick(project.id)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 transition shadow-md shadow-blue-500/10 text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0"
            id="detail-workspace-new-task-btn"
          >
            <Plus size={16} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Progress Line */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl theme-card shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs font-bold theme-text-secondary mb-2">
          <span>Overall Workspace Completion Metrics</span>
          <span>{project.progress}% Complete ({tabCounts.done}/{tabCounts.all} tasks)</span>
        </div>
        <div className="h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Interactive views, search and filters toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl theme-card shadow-xs">
          
          {/* 1. Layout Toggles */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 border dark:border-slate-800/60 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'kanban' 
                  ? 'bg-white dark:bg-slate-900 theme-text shadow-xs' 
                  : 'text-slate-500 hover:text-slate-850'
              }`}
              id="toggle-kanban-view"
            >
              <LayoutGrid size={14} />
              <span>Kanban Board</span>
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'list' 
                  ? 'bg-white dark:bg-slate-900 theme-text shadow-xs' 
                  : 'text-slate-500 hover:text-slate-850'
              }`}
              id="toggle-list-view"
            >
              <List size={14} />
              <span>List Table</span>
            </button>
          </div>

          {/* 2. Text Search with Filters Expand Toggle */}
          <div className="flex items-center gap-2 flex-1 max-w-md w-full">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="task-search-input"
                type="text"
                placeholder="Search tasks in project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 theme-text outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <button
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className={`p-2 rounded-lg border text-xs font-medium cursor-pointer transition ${
                showFiltersPanel || filters.status !== 'All' || filters.priority !== 'All' || filters.assigneeId !== 'All'
                  ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/10 dark:border-blue-900/30 dark:text-blue-400'
                  : 'border-slate-200 dark:border-slate-800 theme-text hover:bg-slate-50'
              }`}
              title="Toggle filter controls"
              id="btn-toggle-filters"
            >
              <SlidersHorizontal size={14} />
            </button>
          </div>
        </div>

        {/* 3. Dropdown filter criteria drawers */}
        <div className={`overflow-hidden transition-all duration-300 ${showFiltersPanel ? 'max-h-56' : 'max-h-0'}`}>
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl theme-card shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Status Selector */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 theme-text outline-none focus:border-blue-600"
              >
                <option value="All">All Statuses</option>
                <option value="Backlog">Backlog</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Done">Done</option>
              </select>
            </div>

            {/* Priority Selector */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Priority
              </label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 theme-text outline-none focus:border-blue-600"
              >
                <option value="All">All Priorities</option>
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
            </div>

            {/* Assignee Selector */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Assignee
              </label>
              <select
                value={filters.assigneeId}
                onChange={(e) => setFilters(prev => ({ ...prev, assigneeId: e.target.value }))}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 theme-text outline-none focus:border-blue-600"
              >
                <option value="All">All Assignees</option>
                {projectAssignees.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>

            <div className="col-span-1 sm:col-span-3 flex justify-end">
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-black hover:underline cursor-pointer"
                id="btn-reset-filters"
              >
                <RotateCcw size={12} />
                <span>Reset Filters</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Render active filter chips */}
      {(filters.status !== 'All' || filters.priority !== 'All' || filters.assigneeId !== 'All' || searchQuery) && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Filters:</span>
          {filters.status !== 'All' && (
            <span className="text-[10px] font-bold px-2.5 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100">
              Status: {filters.status}
            </span>
          )}
          {filters.priority !== 'All' && (
            <span className="text-[10px] font-bold px-2.5 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100">
              Priority: {filters.priority}
            </span>
          )}
          {filters.assigneeId !== 'All' && (
            <span className="text-[10px] font-bold px-2.5 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100">
              Assignee: {users.find(u => u.id === parseInt(filters.assigneeId, 10))?.name}
            </span>
          )}
          {searchQuery && (
            <span className="text-[10px] font-bold px-2.5 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100">
              Query: "{searchQuery}"
            </span>
          )}
          <button
            onClick={resetFilters}
            className="text-[10px] font-bold text-red-500 hover:underline hover:text-red-600 cursor-pointer ml-1"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Board View vs List View */}
      <div className="mt-4">
        {activeTab === 'kanban' ? (
          <KanbanBoard
            projectId={project.id}
            tasks={filteredTasks}
            onTaskClick={onTaskClick}
            onAddTaskToColumn={(defaultColStatus) => onNewTaskClick(project.id, defaultColStatus)}
          />
        ) : (
          <ListView
            tasks={filteredTasks}
            onTaskClick={onTaskClick}
          />
        )}
      </div>
    </div>
  );
};
