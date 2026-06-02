/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskStatus } from '../types';
import { 
  Calendar, 
  MessageSquare, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  MoreVertical,
  CheckCircle2,
  Clock,
  ArrowRightLeft
} from 'lucide-react';
import { motion } from 'motion/react';

interface KanbanBoardProps {
  projectId: number;
  tasks: Task[];
  onTaskClick: (taskId: number) => void;
  onAddTaskToColumn: (status: TaskStatus) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  projectId, 
  tasks, 
  onTaskClick, 
  onAddTaskToColumn 
}) => {
  const { users, updateTask, deleteTask, comments } = useApp();
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);

  const columns: TaskStatus[] = ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'];

  // Native Drag and Drop
  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    e.dataTransfer.setData('text/plain', taskId.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    setDraggedOverColumn(status);
  };

  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setDraggedOverColumn(null);
    const taskIdStr = e.dataTransfer.getData('text/plain');
    const taskId = parseInt(taskIdStr, 10);
    if (!isNaN(taskId)) {
      updateTask(taskId, { status: targetStatus });
    }
  };

  // Move task via button click (for accessibility, touch, and simplicity)
  const shiftStatus = (task: Task, direction: 'prev' | 'next') => {
    const currentIndex = columns.indexOf(task.status);
    let netIndex = currentIndex;
    if (direction === 'next' && currentIndex < columns.length - 1) {
      netIndex++;
    } else if (direction === 'prev' && currentIndex > 0) {
      netIndex--;
    }
    if (netIndex !== currentIndex) {
      updateTask(task.id, { status: columns[netIndex] });
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-100 dark:border-red-500/20';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-100 dark:border-amber-500/20';
      case 'Low':
        return 'bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400 border-slate-100 dark:border-slate-500/20';
      default:
        return 'bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400 border-slate-100';
    }
  };

  const getAssigneeInitials = (assigneeId: number | null) => {
    if (assigneeId === null) return 'U'; // Unassigned
    const user = users.find(u => u.id === assigneeId);
    return user ? user.avatar : '??';
  };

  const getAssigneeName = (assigneeId: number | null) => {
    if (assigneeId === null) return 'Unassigned';
    return users.find(u => u.id === assigneeId)?.name || 'Unknown User';
  };

  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4 select-none" 
      id="kanban-swimlanes"
    >
      {columns.map(col => {
        const columnTasks = tasks.filter(t => t.status === col);
        const isDraggingOver = draggedOverColumn === col;

        return (
          <div
            key={col}
            onDragOver={(e) => handleDragOver(e, col)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col)}
            className={`flex flex-col min-w-[220px] rounded-2xl p-3 border transition-all ${
              isDraggingOver 
                ? 'bg-blue-50/40 dark:bg-blue-950/10 border-blue-400 border-dashed border-2 p-[11px]' 
                : 'bg-slate-50/50 dark:bg-slate-950/5 border-slate-200 dark:border-slate-800'
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs theme-text-secondary uppercase tracking-wider">
                  {col}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  {columnTasks.length}
                </span>
              </div>
              <button
                onClick={() => onAddTaskToColumn(col)}
                className="w-5 h-5 rounded-md flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                title={`Add task to ${col}`}
              >
                +
              </button>
            </div>

            {/* Tasks Container */}
            <div className="space-y-3 flex-1 min-h-[350px] overflow-y-auto max-h-[600px] pr-1">
              {columnTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-slate-200 dark:border-slate-850 rounded-xl h-full">
                  <span className="text-[10px] text-slate-400 font-medium">No tasks yet</span>
                </div>
              ) : (
                columnTasks.map(task => {
                  const taskCommentsCount = comments.filter(c => c.taskId === task.id).length;
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => onTaskClick(task.id)}
                      className={`group p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 rounded-xl shadow-xs hover:shadow-md transition duration-150 cursor-grab active:cursor-grabbing theme-card task-card-theme task-card-${task.priority.toLowerCase()}`}
                    >
                      {/* Priority tag row */}
                      <div className="flex items-center justify-between gap-1 mb-2.5">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getPriorityStyle(task.priority)}`}>
                          {task.priority}
                        </span>
                        
                        {/* Task specific comment icon overlay */}
                        {taskCommentsCount > 0 && (
                          <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                            <MessageSquare size={11} />
                            {taskCommentsCount}
                          </span>
                        )}
                      </div>

                      {/* Name of task */}
                      <h4 className="font-bold text-xs theme-text tracking-tight group-hover:text-blue-600 transition leading-snug line-clamp-2">
                        {task.title}
                      </h4>

                      {/* Description sample */}
                      <p className="text-[11px] theme-text-secondary mt-1.5 line-clamp-2 leading-relaxed opacity-85">
                        {task.description}
                      </p>

                      {/* Bottom row: due date and assignee stack */}
                      <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-slate-400">
                        {/* Date */}
                        <div className="flex items-center gap-1 text-[10px] theme-text-muted font-semibold tracking-tight">
                          <Calendar size={11} />
                          <span>{task.dueDate}</span>
                        </div>

                        {/* Assignee initials badge */}
                        <div className="flex items-center gap-1.5">
                          {task.assigneeId ? (
                            <div
                              title={`Assigned to ${getAssigneeName(task.assigneeId)}`}
                              className="w-5 h-5 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-[9px] border border-white dark:border-slate-900"
                            >
                              {getAssigneeInitials(task.assigneeId)}
                            </div>
                          ) : (
                            <span className="text-[9px] font-medium text-slate-450 italic">Unassigned</span>
                          )}
                        </div>
                      </div>

                      {/* Slide mutation helpers (for accessibility / mobile / quick click) */}
                      <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/30 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); shiftStatus(task, 'prev'); }}
                          disabled={col === 'Backlog'}
                          title="Move Left"
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                        >
                          <ChevronLeft size={12} />
                        </button>
                        <span className="text-[9px] text-slate-400 font-bold flex items-center gap-0.5">
                          <ArrowRightLeft size={10} /> Move Column
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); shiftStatus(task, 'next'); }}
                          disabled={col === 'Done'}
                          title="Move Right"
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                        >
                          <ChevronRight size={12} />
                        </button>
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
