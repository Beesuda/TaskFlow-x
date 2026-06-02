/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TaskStatus = 'Backlog' | 'To Do' | 'In Progress' | 'Review' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string; // fallback to initials if not found
  role: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  progress: number; // 0-100 percentage
  dueDate: string;
  category?: string;
}

export interface Task {
  id: number;
  projectId: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: number | null;
  dueDate: string;
  createdAt: string;
}

export interface Comment {
  id: number;
  taskId: number;
  userId: number;
  message: string;
  createdAt: string;
}

export interface ActivityLog {
  id: number;
  taskId?: number;
  projectId?: number;
  userId: number;
  action: string; // e.g., 'created', 'changed_status', 'assigned', 'commented'
  details: string; // e.g., 'Moved to In Progress', 'Assigned to Michael Chen'
  createdAt: string;
}

export type Screen = 'LOGIN' | 'DASHBOARD' | 'PROJECTS' | 'PROJECT_DETAIL' | 'TEAM' | 'SETTINGS';

export interface NavigationState {
  screen: Screen;
  projectId?: number;
  taskId?: number;
}

export interface AppSettings {
  profileName: string;
  profileEmail: string;
  theme: 'Light' | 'Dark' | 'Cosmic';
  notifications: {
    email: boolean;
    browser: boolean;
    weeklyDigest: boolean;
  };
}
