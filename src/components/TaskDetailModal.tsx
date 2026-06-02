/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task } from '../types';
import { 
  X, 
  User, 
  Calendar, 
  CheckCircle2, 
  MessageSquare, 
  Trash2, 
  Edit3, 
  TrendingUp,
  Clock,
  ShieldAlert,
  Send,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TaskDetailModalProps {
  taskId: number;
  isOpen: boolean;
  onClose: () => void;
  onEditClick: (task: Task) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  taskId,
  isOpen,
  onClose,
  onEditClick
}) => {
  const { 
    tasks, 
    users, 
    comments, 
    activityLogs, 
    addComment, 
    deleteTask, 
    currentUser 
  } = useApp();

  const [message, setMessage] = useState('');
  const [commentError, setCommentError] = useState('');

  const task = tasks.find(t => t.id === taskId);

  if (!isOpen || !task) return null;

  // Find task comments
  const taskComments = comments.filter(c => c.taskId === task.id);
  
  // Find task activity logs
  const taskActivities = activityLogs.filter(log => log.taskId === task.id);

  // Find assignee
  const assignee = users.find(u => u.id === task.assigneeId);

  // Format Comment Creation Action
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError('');

    if (!message.trim()) {
      setCommentError('Comment cannot be empty');
      return;
    }

    addComment(task.id, message.trim());
    setMessage('');
  };

  const handleDelete = () => {
    if (confirm('Are you absolutely sure you want to delete this task? This action cannot be undone.')) {
      deleteTask(task.id);
      onClose();
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'High': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'Medium': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/20';
      default: return 'text-slate-600 bg-slate-100 dark:bg-slate-850';
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Done': return 'text-green-600 bg-green-50 dark:bg-green-900/10 border-green-200';
      case 'In Progress': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/10 border-blue-200';
      default: return 'text-slate-500 bg-slate-50 dark:bg-slate-800 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-40 p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.55 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black cursor-pointer"
      />

      {/* Detail card container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col md:grid md:grid-cols-3 max-h-[90vh] md:max-h-[85vh]"
        id="task-detail-modal-card"
      >
        {/* Close launcher */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full theme-hover theme-text cursor-pointer z-10"
        >
          <X size={18} />
        </button>

        {/* Column 1 & 2: Content (Title, Description, comments) */}
        <div className="p-6 md:col-span-2 overflow-y-auto border-r border-slate-150 dark:border-slate-800/80 flex flex-col justify-between max-h-[50vh] md:max-h-full">
          <div>
            {/* Top row */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                {task.priority} Priority
              </span>
            </div>

            {/* Task Name */}
            <h3 className="text-xl font-bold tracking-tight theme-text leading-tight" id="detail-task-title">
              {task.title}
            </h3>

            {/* Description */}
            <div className="mt-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Task Description
              </h4>
              <p className="text-sm theme-text-secondary mt-1.5 leading-relaxed antialiased font-normal whitespace-pre-wrap">
                {task.description || 'No supplementary description compiled for this item.'}
              </p>
            </div>
          </div>

          {/* Collaborative comments block */}
          <div className="mt-8 pt-6 border-t border-slate-150 dark:border-slate-800" id="comments-section-container">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-4">
              <MessageSquare size={13} />
              <span>Team Discussions ({taskComments.length})</span>
            </h4>

            {/* List comments */}
            <div className="space-y-4 max-h-[220px] overflow-y-auto mb-4 pr-1">
              {taskComments.length === 0 ? (
                <p className="text-xs theme-text-muted italic py-3 pl-1">
                  No commentary posted yet. Start the team debate below!
                </p>
              ) : (
                taskComments.map(comment => {
                  const author = users.find(u => u.id === comment.userId);
                  const isMe = author?.id === currentUser?.id;
                  
                  return (
                    <div 
                      key={comment.id}
                      className={`flex gap-3 text-xs leading-relaxed ${
                        isMe ? 'items-start flex-row-reverse bg-blue-50/20 dark:bg-blue-900/5 p-2 rounded-xl border border-blue-50/10' : ''
                      }`}
                    >
                      {/* Avatar */}
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-bold shrink-0">
                        {author?.avatar || '??'}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2 flex-wrap">
                          <span className="font-bold theme-text">{author?.name}</span>
                          <span className="text-[9px] theme-text-muted">
                            {new Date(comment.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                            {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="theme-text-secondary mt-1 font-normal select-text">
                          {comment.message}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="mt-3">
              <div className="relative">
                <input
                  id="comment-input"
                  type="text"
                  placeholder="Post an update or note an impediment..."
                  value={message}
                  onChange={(e) => { setMessage(e.target.value); if (commentError) setCommentError(''); }}
                  className={`w-full pl-3 pr-10 py-2.5 text-xs rounded-xl border theme-input ${
                    commentError ? 'border-red-500' : ''
                  }`}
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition overflow-hidden cursor-pointer"
                  id="submit-comment-btn"
                >
                  <Send size={12} />
                </button>
              </div>
              {commentError && (
                <span className="text-[10px] text-red-600 font-bold mt-1.5 block" id="error-comment-message">
                  {commentError}
                </span>
              )}
            </form>
          </div>
        </div>

        {/* Column 3: Stats Details & Activities */}
        <div className="p-6 bg-slate-50 dark:bg-slate-950/20 md:col-span-1 flex flex-col justify-between overflow-y-auto max-h-[40vh] md:max-h-full">
          <div className="space-y-6">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Task Configurations
            </h4>

            {/* Metadata Fields list */}
            <div className="space-y-4 text-xs font-sans">
              {/* Assignee item */}
              <div className="flex items-center justify-between">
                <span className="theme-text-muted font-medium">Assignee</span>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-500 text-white font-black flex items-center justify-center text-[8px]">
                    {assignee?.avatar || 'U'}
                  </div>
                  <span className="font-bold theme-text truncate">
                    {assignee ? assignee.name : 'Unassigned'}
                  </span>
                </div>
              </div>

              {/* Due Date item */}
              <div className="flex items-center justify-between">
                <span className="theme-text-muted font-medium">Due Date</span>
                <span className="font-bold theme-text inline-flex items-center gap-1">
                  <Calendar size={12} className="text-slate-400" />
                  {task.dueDate}
                </span>
              </div>

              {/* Task ID indicator */}
              <div className="flex items-center justify-between">
                <span className="theme-text-muted font-medium">Record Ticket</span>
                <span className="font-mono text-[10px] theme-text font-bold">
                  #{task.id}
                </span>
              </div>
            </div>

            {/* Audit log trail specific to this ticket */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                <Clock size={11} />
                <span>Ticket Audit History</span>
              </h4>

              <div className="space-y-3 max-h-[140px] overflow-y-auto pr-1">
                {taskActivities.length === 0 ? (
                  <p className="text-[10px] theme-text-muted italic">No history edits recorded.</p>
                ) : (
                  taskActivities.map(log => (
                    <div key={log.id} className="text-[10px]">
                      <p className="theme-text-secondary leading-snug">
                        <strong className="theme-text font-semibold">{users.find(u => u.id === log.userId)?.name}</strong>: {log.details}
                      </p>
                      <span className="text-[8px] text-slate-400 block mt-0.5">
                        {new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Action Pathways */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-2 mt-6">
            <button
              onClick={() => onEditClick(task)}
              className="flex items-center justify-center gap-1.5 w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition cursor-pointer"
              id="detail-edit-task-btn"
            >
              <Edit3 size={12} />
              <span>Edit Attributes</span>
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center justify-center gap-1.5 w-full py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-xs font-semibold rounded-lg transition cursor-pointer border border-red-500/20"
              id="detail-delete-task-btn"
            >
              <Trash2 size={12} />
              <span>Delete Ticket</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
