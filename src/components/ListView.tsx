/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskStatus, TaskPriority } from '../types';
import { 
  ArrowUpDown, 
  ChevronUp, 
  ChevronDown, 
  Calendar, 
  MessageSquare, 
  Trash2, 
  Edit3,
  CalendarDays,
  User as UserIcon
} from 'lucide-react';

interface ListViewProps {
  tasks: Task[];
  onTaskClick: (taskId: number) => void;
}

type SortField = 'title' | 'dueDate' | 'priority' | 'status';

export const ListView: React.FC<ListViewProps> = ({ tasks, onTaskClick }) => {
  const { users } = useApp();
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Safe user lookup helpers
  const getAssigneeInfo = (assigneeId: number | null) => {
    if (assigneeId === null) return { name: 'Unassigned', avatar: 'U' };
    const user = users.find(u => u.id === assigneeId);
    return user ? { name: user.name, avatar: user.avatar } : { name: 'Unknown User', avatar: '?' };
  };

  // Task priority ranking for sorting comparison
  const getPriorityWeight = (p: TaskPriority) => {
    switch (p) {
      case 'High': return 3;
      case 'Medium': return 2;
      case 'Low': return 1;
      default: return 0;
    }
  };

  const getStatusWeight = (s: TaskStatus) => {
    switch (s) {
      case 'Backlog': return 1;
      case 'To Do': return 2;
      case 'In Progress': return 3;
      case 'Review': return 4;
      case 'Done': return 5;
      default: return 0;
    }
  };

  // Apply sorting
  const sortedTasks = [...tasks].sort((a, b) => {
    let result = 0;
    if (sortField === 'title') {
      result = a.title.localeCompare(b.title);
    } else if (sortField === 'dueDate') {
      result = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    } else if (sortField === 'priority') {
      result = getPriorityWeight(a.priority) - getPriorityWeight(b.priority);
    } else if (sortField === 'status') {
      result = getStatusWeight(a.status) - getStatusWeight(b.status);
    }
    return sortOrder === 'asc' ? result : -result;
  });

  const getPriorityBadgeStyle = (p: TaskPriority) => {
    switch (p) {
      case 'High':
        return 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200/40';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/40';
      case 'Low':
        return 'bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400 border border-slate-200/20';
      default:
        return 'bg-slate-50 text-slate-600 dark:bg-slate-100';
    }
  };

  const getStatusBadgeStyle = (s: TaskStatus) => {
    switch (s) {
      case 'Done':
        return 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400 font-bold';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 font-bold';
      case 'Review':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 font-bold';
      case 'To Do':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-450 font-bold';
      default:
        return 'bg-slate-150 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-bold';
    }
  };

  const renderSortArrow = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="opacity-45" />;
    return sortOrder === 'asc' 
      ? <ChevronUp size={12} className="text-blue-600" /> 
      : <ChevronDown size={12} className="text-blue-600" />;
  };

  if (sortedTasks.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 theme-card" id="list-empty-fallback">
        <p className="text-sm theme-text-muted">No tasks correspond to the active filter search criteria.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs theme-card" id="list-tasks-wrapper">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
              {/* Task Name */}
              <th 
                className="py-4.5 px-6 cursor-pointer select-none hover:text-slate-950 dark:hover:text-white transition"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Task Name</span>
                  {renderSortArrow('title')}
                </div>
              </th>

              {/* Assignee */}
              <th className="py-4.5 px-4 font-bold select-none text-slate-500">
                <div className="flex items-center gap-1">
                  <UserIcon size={13} />
                  <span>Assignee</span>
                </div>
              </th>

              {/* Priority */}
              <th 
                className="py-4.5 px-4 cursor-pointer select-none hover:text-slate-950 dark:hover:text-white transition"
                onClick={() => handleSort('priority')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Priority</span>
                  {renderSortArrow('priority')}
                </div>
              </th>

              {/* Due Date */}
              <th 
                className="py-4.5 px-4 cursor-pointer select-none hover:text-slate-950 dark:hover:text-white transition"
                onClick={() => handleSort('dueDate')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Due Date</span>
                  {renderSortArrow('dueDate')}
                </div>
              </th>

              {/* Status */}
              <th 
                className="py-4.5 px-4 cursor-pointer select-none hover:text-slate-950 dark:hover:text-white transition"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Status</span>
                  {renderSortArrow('status')}
                </div>
              </th>

              {/* Action */}
              <th className="py-4.5 px-6 text-right font-bold text-slate-500 select-none">
                Details
              </th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
            {sortedTasks.map(task => {
              const assignee = getAssigneeInfo(task.assigneeId);
              return (
                <tr 
                  key={task.id}
                  onClick={() => onTaskClick(task.id)}
                  className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 cursor-pointer transition"
                >
                  {/* Title / Description */}
                  <td className="py-4 px-6 max-w-sm">
                    <div className="font-semibold theme-text text-sm hover:text-blue-600 transition truncate leading-snug">
                      {task.title}
                    </div>
                    <div className="text-xs theme-text-secondary mt-0.5 max-w-xs truncate font-normal">
                      {task.description}
                    </div>
                  </td>

                  {/* Assignee */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2.5">
                      <div 
                        title={assignee.name}
                        className="w-6 h-6 rounded-full bg-blue-500 text-white font-extrabold flex items-center justify-center text-[10px]"
                      >
                        {assignee.avatar}
                      </div>
                      <span className="text-xs font-semibold theme-text">
                        {assignee.name}
                      </span>
                    </div>
                  </td>

                  {/* Priority Badge */}
                  <td className="py-4 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getPriorityBadgeStyle(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>

                  {/* Due Date */}
                  <td className="py-4 px-4 text-xs theme-text-secondary ontialiased font-semibold">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays size={13} className="text-slate-400" />
                      <span>{task.dueDate}</span>
                    </div>
                  </td>

                  {/* Status badge */}
                  <td className="py-4 px-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${getStatusBadgeStyle(task.status)}`}>
                      {task.status}
                    </span>
                  </td>

                  {/* Action button */}
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); onTaskClick(task.id); }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                    >
                      View Detail
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
