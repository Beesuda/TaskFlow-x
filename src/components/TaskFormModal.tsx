/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskStatus, TaskPriority } from '../types';
import { X, ShieldAlert, BadgeCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  taskToEdit?: Task; // If provided, we are in EDIT mode
  defaultStatus?: TaskStatus; // Preselected status column if available
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  projectId,
  taskToEdit,
  defaultStatus
}) => {
  const { users, addTask, updateTask } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('To Do');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [assigneeId, setAssigneeId] = useState<string>('Unassigned');
  const [dueDate, setDueDate] = useState('');
  
  // Field errors
  const [titleError, setTitleError] = useState('');
  const [dateError, setDateError] = useState('');
  const [formError, setFormError] = useState('');

  // Initial populate or reset
  useEffect(() => {
    if (isOpen) {
      // Refresh errors
      setTitleError('');
      setDateError('');
      setFormError('');

      if (taskToEdit) {
        setTitle(taskToEdit.title);
        setDescription(taskToEdit.description);
        setStatus(taskToEdit.status);
        setPriority(taskToEdit.priority);
        setAssigneeId(taskToEdit.assigneeId ? taskToEdit.assigneeId.toString() : 'Unassigned');
        setDueDate(taskToEdit.dueDate);
      } else {
        setTitle('');
        setDescription('');
        setStatus(defaultStatus || 'To Do');
        setPriority('Medium');
        setAssigneeId('Unassigned');
        setDueDate('');
      }
    }
  }, [isOpen, taskToEdit, defaultStatus]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTitleError('');
    setDateError('');
    setFormError('');

    let isValid = true;

    // PRD Field validation: Required fields
    if (!title.trim()) {
      setTitleError('Task title is required');
      isValid = false;
    }
    
    if (!dueDate) {
      setDateError('Due date is required');
      isValid = false;
    }

    if (!priority) {
      setFormError('Priority is required');
      isValid = false;
    }

    if (!isValid) {
      setFormError('Please complete all required fields.');
      return;
    }

    const assignedIdInt = assigneeId === 'Unassigned' ? null : parseInt(assigneeId, 10);

    if (taskToEdit) {
      updateTask(taskToEdit.id, {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        assigneeId: assignedIdInt,
        dueDate
      });
    } else {
      addTask({
        projectId,
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        assigneeId: assignedIdInt,
        dueDate
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.55 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black cursor-pointer"
      />

      {/* Modal element */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden p-6 text-slate-900 dark:text-white"
        id="task-form-modal-card"
      >
        {/* Close trigger */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full theme-hover theme-text cursor-pointer"
        >
          <X size={18} />
        </button>

        <h3 className="font-bold text-lg leading-tight theme-text">
          {taskToEdit ? `Edit Task: ${taskToEdit.title}` : 'Create New Task'}
        </h3>
        <p className="text-xs theme-text-secondary mt-1">
          Specify core attributes to assign ownership and align deadlines.
        </p>

        {formError && (
          <div className="flex items-start gap-2 p-3 mt-4 text-xs font-semibold text-red-700 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/25 rounded-xl">
            <ShieldAlert size={15} className="shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          {/* Task Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1" htmlFor="task-title-input">
              Title *
            </label>
            <input
              id="task-title-input"
              type="text"
              placeholder="e.g. Design homepage highfidelities"
              value={title}
              onChange={(e) => { setTitle(e.target.value); if (e.target.value) setTitleError(''); }}
              className={`w-full px-3 py-2 text-sm rounded-lg border theme-input ${
                titleError ? 'border-red-500 ring-2 ring-red-500/10' : ''
              }`}
            />
            {titleError && (
              <span className="text-[10px] text-red-600 font-bold mt-1 block" id="error-task-title">
                {titleError}
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1" htmlFor="task-desc-input">
              Description
            </label>
            <textarea
              id="task-desc-input"
              placeholder="Give detailed criteria on how to execute this task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 text-sm rounded-lg border theme-input resize-none"
            />
          </div>

          {/* Config row 1 (Status, Assignee) */}
          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Column Status
              </label>
              <select
                id="task-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 text-sm rounded-lg border theme-input"
              >
                <option value="Backlog">Backlog</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Done">Done</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Assignee
              </label>
              <select
                id="task-assignee-select"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border theme-input"
              >
                <option value="Unassigned">Unassigned</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Config row 2 (Priority, Due Date) */}
          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Priority *
              </label>
              <select
                id="task-priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 text-sm rounded-lg border theme-input"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Due Date *
              </label>
              <input
                id="task-duedate-input"
                type="date"
                value={dueDate}
                onChange={(e) => { setDueDate(e.target.value); if (e.target.value) setDateError(''); }}
                className={`w-full px-3 py-2 text-sm rounded-lg border theme-input ${
                  dateError ? 'border-red-500 ring-2 ring-red-500/10' : ''
                }`}
              />
              {dateError && (
                <span className="text-[10px] text-red-600 font-bold mt-1 block" id="error-task-duedate">
                  {dateError}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-50 hover:bg-slate-150 border rounded-lg text-xs font-semibold theme-text cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-md cursor-pointer"
              id="submit-task-form-btn"
            >
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
