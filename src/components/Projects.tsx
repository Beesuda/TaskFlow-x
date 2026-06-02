/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Project, User } from '../types';
import { 
  FolderGit, 
  Search, 
  Plus, 
  Calendar, 
  CheckSquare, 
  Briefcase, 
  Users, 
  ChevronRight,
  ShieldAlert,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Projects: React.FC = () => {
  const { 
    projects, 
    tasks, 
    users, 
    addProject, 
    navigateTo 
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projCat, setProjCat] = useState('Engineering');
  const [projDueDate, setProjDueDate] = useState('');
  const [error, setError] = useState('');

  // Extract unique categories for filter (memoized).
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(projects.map(p => p.category).filter(Boolean)))],
    [projects]
  );

  // Filtered project list (memoized).
  const filteredProjects = useMemo(() => {
    const q = search.toLowerCase();
    return projects.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [projects, search, selectedCategory]);

  // Precompute the assigned team per project once, instead of per card.
  const teamByProject = useMemo(() => {
    const idsByProject = new Map<number, Set<number>>();
    for (const t of tasks) {
      if (t.assigneeId === null) continue;
      const set = idsByProject.get(t.projectId) ?? new Set<number>();
      set.add(t.assigneeId);
      idsByProject.set(t.projectId, set);
    }
    const result = new Map<number, User[]>();
    for (const [projId, ids] of idsByProject) {
      result.set(projId, users.filter(u => ids.has(u.id)));
    }
    return result;
  }, [tasks, users]);

  // Handle Project Creation Sumission
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!projName.trim() || !projDueDate) {
      setError('Project name and due date are required.');
      return;
    }

    addProject(projName.trim(), projDesc.trim(), projCat, projDueDate);
    
    // Reset Form
    setProjName('');
    setProjDesc('');
    setProjCat('Engineering');
    setProjDueDate('');
    setIsModalOpen(false);
  };

  // Extract team members who are assigned tasks on a specific project (from precomputed map).
  const getProjectTeam = (projId: number): User[] => teamByProject.get(projId) ?? [];

  return (
    <div className="space-y-6 font-sans">
      {/* Header section with Creator Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="bold-title text-2xl tracking-tighter uppercase theme-text">Workspaces</h2>
          <p className="text-sm theme-text-secondary mt-1">
            Group related tasks, manage board swimlanes, and track overall progress metrics.
          </p>
        </div>
        <button
          onClick={() => { setError(''); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 transition shadow-md shadow-blue-500/10 text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0"
          id="btn-create-project-launcher"
        >
          <Plus size={16} />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter Options & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl theme-card shadow-xs">
        {/* Instant Search Bar */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="project-search-input"
            type="text"
            placeholder="Search workspaces..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 theme-text text-sm transition outline-none focus:border-blue-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat || 'All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                (selectedCategory === cat || (cat === 'All' && !selectedCategory))
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-950 theme-text hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State vs. Project Grid Cards */}
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/50 dark:bg-slate-900/10" id="projects-empty-state">
          <FolderGit size={44} className="text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="font-bold text-base theme-text">No projects available</h3>
          <p className="text-xs theme-text-secondary mt-1 max-w-xs">
            Create a project workspace to get started managing associated tasks and milestones with your teammates.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white rounded-lg transition"
          >
            Create your first workspace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="projects-grid">
          {filteredProjects.map(project => {
            const projectTasks = tasks.filter(t => t.projectId === project.id);
            const doneTasks = projectTasks.filter(t => t.status === 'Done').length;
            const openTasks = projectTasks.filter(t => t.status !== 'Done').length;
            const team = getProjectTeam(project.id);

            return (
              <motion.div
                layout
                whileHover={{ y: -3 }}
                transition={{ duration: 0.15 }}
                key={project.id}
                onClick={() => navigateTo('PROJECT_DETAIL', project.id)}
                className="flex flex-col justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:shadow-md cursor-pointer transition-all group theme-card relative"
              >
                <div>
                  {/* Category, Due status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                      {project.category || 'General'}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">
                      <Calendar size={12} />
                      {project.dueDate}
                    </span>
                  </div>

                  {/* Name and Description */}
                  <h3 className="font-bold text-lg tracking-tight theme-text mt-3 group-hover:text-blue-600 transition truncate">
                    {project.name}
                  </h3>
                  <p className="text-xs theme-text-secondary mt-1.5 line-clamp-2 leading-relaxed antialiased">
                    {project.description}
                  </p>
                </div>

                {/* Metrics Stack */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  {/* Progress Line */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-[10px] font-bold theme-text-secondary mb-1">
                      <span>Completion Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Task Count, Assigned Stack */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[11px] font-bold theme-text-secondary">
                      <CheckSquare size={13} className="text-slate-400" />
                      <span>{projectTasks.length} {projectTasks.length === 1 ? 'task' : 'tasks'}</span>
                      <span className="opacity-45">•</span>
                      <span className="text-blue-600 dark:text-blue-400">{openTasks} pending</span>
                    </div>

                    {/* Team avatars horizontal overlay */}
                    <div className="flex items-center -space-x-1.5">
                      {team.slice(0, 3).map(member => (
                        <div
                          key={member.id}
                          title={`${member.name} - ${member.role}`}
                          className="flex items-center justify-center w-6 h-6 rounded-full border border-white dark:border-slate-900 bg-slate-300 text-[9px] font-bold text-slate-800"
                        >
                          {member.avatar}
                        </div>
                      ))}
                      {team.length > 3 && (
                        <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white dark:border-slate-900 bg-slate-100 text-[8px] font-black text-slate-500">
                          +{team.length - 3}
                        </div>
                      )}
                      {team.length === 0 && (
                        <span className="text-[10px] text-slate-400 font-medium">Unassigned</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* CREATE WORKSPACE MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black"
            />

            {/* Content card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-xl overflow-hidden p-6 border border-slate-200 dark:border-slate-800"
              id="create-project-modal"
            >
              {/* Close pin */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-full theme-hover theme-text cursor-pointer"
              >
                <X size={18} />
              </button>

              <h3 className="font-bold text-lg theme-text pr-6">Create Project Workspace</h3>
              <p className="text-xs theme-text-secondary mt-1">
                Fill core details to initiate a workspace container.
              </p>

              {error && (
                <div className="flex items-start gap-2 p-3 mt-4 text-xs font-semibold text-red-700 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 rounded-lg">
                  <ShieldAlert size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreateProject} className="space-y-4 mt-4">
                {/* Project Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Project Name *
                  </label>
                  <input
                    id="proj-name-input"
                    type="text"
                    required
                    placeholder="e.g. Website Redesign"
                    value={projName}
                    onChange={(e) => setProjName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 theme-text outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Description
                  </label>
                  <textarea
                    id="proj-desc-input"
                    placeholder="Briefly explain project scope..."
                    value={projDesc}
                    onChange={(e) => setProjDesc(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 theme-text outline-none focus:border-blue-600 focus:bg-white resize-none"
                  />
                </div>

                {/* Meta row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Category
                    </label>
                    <select
                      id="proj-cat-select"
                      value={projCat}
                      onChange={(e) => setProjCat(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 theme-text outline-none focus:border-blue-600"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Design & Brand">Design & Brand</option>
                      <option value="Growth & Marketing">Growth & Marketing</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>

                  {/* Due date */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Due Date *
                    </label>
                    <input
                      id="proj-duedate-input"
                      type="date"
                      required
                      value={projDueDate}
                      onChange={(e) => setProjDueDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 theme-text outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold theme-text hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white rounded-lg transition"
                    id="submit-create-project-btn"
                  >
                    Create Workspace
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
