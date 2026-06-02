/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  User, Project, Task, Comment, ActivityLog, Screen, NavigationState, TaskStatus, TaskPriority, AppSettings
} from '../types';
import { mockUsers, mockProjects, mockTasks, mockComments, mockActivityLogs } from '../data/mockData';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  projects: Project[];
  tasks: Task[];
  comments: Comment[];
  activityLogs: ActivityLog[];
  navState: NavigationState;
  navStack: NavigationState[];
  settings: AppSettings;
  isPreloading: boolean;
  
  // Navigation actions
  navigateTo: (screen: Screen, projectId?: number, taskId?: number) => void;
  navigateBack: () => void;
  
  // Auth actions
  loginUser: (email: string) => boolean;
  logoutUser: () => void;
  
  // Project actions
  addProject: (name: string, description: string, category: string, dueDate: string) => void;
  
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (taskId: number, updatedFields: Partial<Task>) => void;
  deleteTask: (taskId: number) => void;
  
  // Comment actions
  addComment: (taskId: number, message: string) => void;
  
  // Preferences
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  
  // Filter/Search actions
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: {
    status: string;
    priority: string;
    assigneeId: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    status: string;
    priority: string;
    assigneeId: string;
  }>>;
  resetFilters: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Re-calculate a project's progress (% of its tasks that are Done) from a task list.
// Module-scoped (pure) so it has a stable identity and never invalidates memoized callbacks.
const recalculateProgress = (projId: number, currentTasksList: Task[]) => {
  const projectTasks = currentTasksList.filter(t => t.projectId === projId);
  if (projectTasks.length === 0) return 0;
  const completedTasks = projectTasks.filter(t => t.status === 'Done');
  return Math.round((completedTasks.length / projectTasks.length) * 100);
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPreloading, setIsPreloading] = useState(false);
  // Load initial states from LocalStorage or seed data
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('tf_user');
    if (cached) {
      try { return JSON.parse(cached); } catch { return null; }
    }
    return null;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const cached = localStorage.getItem('tf_projects');
    if (cached) {
      try { return JSON.parse(cached); } catch { return mockProjects; }
    }
    return mockProjects;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const cached = localStorage.getItem('tf_tasks');
    if (cached) {
      try { return JSON.parse(cached); } catch { return mockTasks; }
    }
    return mockTasks;
  });

  const [comments, setComments] = useState<Comment[]>(() => {
    const cached = localStorage.getItem('tf_comments');
    if (cached) {
      try { return JSON.parse(cached); } catch { return mockComments; }
    }
    return mockComments;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const cached = localStorage.getItem('tf_activities');
    if (cached) {
      try { return JSON.parse(cached); } catch { return mockActivityLogs; }
    }
    return mockActivityLogs;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const cached = localStorage.getItem('tf_settings');
    if (cached) {
      try { return JSON.parse(cached); } catch { return { profileName: 'Marcus Vance', profileEmail: 'marcus@example.com', theme: 'Light', notifications: { email: true, browser: true, weeklyDigest: false } }; }
    }
    return {
      profileName: 'Marcus Vance',
      profileEmail: 'marcus@example.com',
      theme: 'Light',
      notifications: {
        email: true,
        browser: true,
        weeklyDigest: false
      }
    };
  });

  // Navigation management with history stack
  const [navState, setNavState] = useState<NavigationState>(() => {
    const storedUser = localStorage.getItem('tf_user');
    return storedUser ? { screen: 'DASHBOARD' } : { screen: 'LOGIN' };
  });

  const [navStack, setNavStack] = useState<NavigationState[]>([]);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'All',
    priority: 'All',
    assigneeId: 'All'
  });

  // Synchronize dynamic items with localStorage
  useEffect(() => {
    localStorage.setItem('tf_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('tf_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('tf_comments', JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem('tf_activities', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem('tf_settings', JSON.stringify(settings));
  }, [settings]);

  // Adjust app theme on DOM element when settings.theme changes
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark-theme', 'cosmic-theme');
    if (settings.theme === 'Dark') {
      root.classList.add('dark-theme');
    } else if (settings.theme === 'Cosmic') {
      root.classList.add('cosmic-theme');
    }
  }, [settings.theme]);

  // Sync settings when current user shifts (simulated profiles)
  useEffect(() => {
    if (currentUser) {
      setSettings(prev => ({
        ...prev,
        profileName: currentUser.name,
        profileEmail: currentUser.email
      }));
    }
  }, [currentUser]);

  // Navigation helper — synchronous; no artificial loading delay.
  const navigateTo = useCallback((screen: Screen, projectId?: number, taskId?: number) => {
    setNavStack(prev => [...prev, navState]);
    setNavState({ screen, projectId, taskId });
  }, [navState]);

  const navigateBack = useCallback(() => {
    if (navStack.length > 0) {
      const prev = navStack[navStack.length - 1];
      setNavStack(prevStack => prevStack.slice(0, prevStack.length - 1));
      setNavState(prev);
    } else {
      // Fallback
      setNavState({ screen: currentUser ? 'DASHBOARD' : 'LOGIN' });
    }
  }, [navStack, currentUser]);

  // Auth Operations
  const loginUser = useCallback((email: string) => {
    const cleanedEmail = email.trim().toLowerCase();
    const found = mockUsers.find(u => u.email.toLowerCase() === cleanedEmail) || mockUsers[4]; // Default to Marcus (PM) if not matched exactly
    setCurrentUser(found);
    localStorage.setItem('tf_user', JSON.stringify(found));
    setNavStack([]);
    setNavState({ screen: 'DASHBOARD' });
    
    // Log Activity
    const newLog: ActivityLog = {
      id: Date.now(),
      userId: found.id,
      action: 'login',
      details: `${found.name} signed into TaskFlow.`,
      createdAt: new Date().toISOString()
    };
    setActivityLogs(prev => [newLog, ...prev]);
    return true;
  }, []);

  const logoutUser = useCallback(() => {
    if (currentUser) {
      const newLog: ActivityLog = {
        id: Date.now(),
        userId: currentUser.id,
        action: 'logout',
        details: `${currentUser.name} logged out.`,
        createdAt: new Date().toISOString()
      };
      setActivityLogs(prev => [newLog, ...prev]);
    }
    setCurrentUser(null);
    localStorage.removeItem('tf_user');
    setNavStack([]);
    setNavState({ screen: 'LOGIN' });
  }, [currentUser]);

  // Project Operations
  const addProject = useCallback((name: string, description: string, category: string, dueDate: string) => {
    const newProject: Project = {
      id: Date.now(),
      name,
      description,
      progress: 0,
      dueDate,
      category
    };

    setProjects(prev => [...prev, newProject]);

    if (currentUser) {
      const newLog: ActivityLog = {
        id: Date.now(),
        projectId: newProject.id,
        userId: currentUser.id,
        action: 'created',
        details: `Created new project "${name}"`,
        createdAt: new Date().toISOString()
      };
      setActivityLogs(prev => [newLog, ...prev]);
    }
  }, [currentUser]);

  // Task Operations
  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTaskId = Date.now();
    const newTask: Task = {
      ...taskData,
      id: newTaskId,
      createdAt: new Date().toISOString()
    };

    setTasks(prev => {
      const updated = [...prev, newTask];
      
      // Also update project progress dynamically
      setProjects(pList => pList.map(p => {
        if (p.id === taskData.projectId) {
          return {
            ...p,
            progress: recalculateProgress(p.id, updated)
          };
        }
        return p;
      }));

      return updated;
    });

    // Write Activity Log
    if (currentUser) {
      const assignedUser = mockUsers.find(u => u.id === taskData.assigneeId);
      const newLog: ActivityLog = {
        id: Date.now(),
        taskId: newTaskId,
        projectId: taskData.projectId,
        userId: currentUser.id,
        action: 'created',
        details: `Created task "${taskData.title}"` + (assignedUser ? ` and assigned to ${assignedUser.name}` : ''),
        createdAt: new Date().toISOString()
      };
      setActivityLogs(prev => [newLog, ...prev]);
    }
  }, [currentUser]);

  const updateTask = useCallback((taskId: number, updatedFields: Partial<Task>) => {
    let oldTask: Task | undefined;
    
    setTasks(prev => {
      const updated = prev.map(t => {
        if (t.id === taskId) {
          oldTask = t;
          return { ...t, ...updatedFields };
        }
        return t;
      });

      // Recalculate progress for task's project
      const projId = oldTask?.projectId || updated.find(t => t.id === taskId)?.projectId;
      if (projId) {
        setProjects(pList => pList.map(p => {
          if (p.id === projId) {
            return {
              ...p,
              progress: recalculateProgress(p.id, updated)
            };
          }
          return p;
        }));
      }

      return updated;
    });

    // Write Activity Log
    if (currentUser && oldTask) {
      let changeText = `Updated task "${oldTask.title}"`;
      if (updatedFields.status && updatedFields.status !== oldTask.status) {
        changeText = `Moved "${oldTask.title}" from "${oldTask.status}" to "${updatedFields.status}"`;
      } else if (updatedFields.assigneeId !== undefined && updatedFields.assigneeId !== oldTask.assigneeId) {
        const newUser = mockUsers.find(u => u.id === updatedFields.assigneeId);
        changeText = newUser 
          ? `Assigned "${oldTask.title}" to ${newUser.name}`
          : `Unassigned "${oldTask.title}"`;
      } else if (updatedFields.priority && updatedFields.priority !== oldTask.priority) {
        changeText = `Changed priority of "${oldTask.title}" to "${updatedFields.priority}"`;
      }

      const newLog: ActivityLog = {
        id: Date.now(),
        taskId: taskId,
        projectId: oldTask.projectId,
        userId: currentUser.id,
        action: updatedFields.status ? 'changed_status' : 'updated',
        details: changeText,
        createdAt: new Date().toISOString()
      };
      setActivityLogs(prev => [newLog, ...prev]);
    }
  }, [currentUser]);

  const deleteTask = useCallback((taskId: number) => {
    let taskToDelete: Task | undefined;
    setTasks(prev => {
      taskToDelete = prev.find(t => t.id === taskId);
      const filtered = prev.filter(t => t.id !== taskId);

      // Recalculate progress for project
      if (taskToDelete) {
        const projId = taskToDelete.projectId;
        setProjects(pList => pList.map(p => {
          if (p.id === projId) {
            return {
              ...p,
              progress: recalculateProgress(p.id, filtered)
            };
          }
          return p;
        }));
      }

      return filtered;
    });

    // Delete comments for this task
    setComments(prev => prev.filter(c => c.taskId !== taskId));

    if (currentUser && taskToDelete) {
      const newLog: ActivityLog = {
        id: Date.now(),
        projectId: taskToDelete.projectId,
        userId: currentUser.id,
        action: 'deleted',
        details: `Deleted task "${taskToDelete.title}"`,
        createdAt: new Date().toISOString()
      };
      setActivityLogs(prev => [newLog, ...prev]);
    }
  }, [currentUser]);

  // Add Comment
  const addComment = useCallback((taskId: number, message: string) => {
    if (!currentUser) return;

    const newComment: Comment = {
      id: Date.now(),
      taskId,
      userId: currentUser.id,
      message,
      createdAt: new Date().toISOString()
    };

    setComments(prev => [...prev, newComment]);

    // Activity Log
    const targetTask = tasks.find(t => t.id === taskId);
    const newLog: ActivityLog = {
      id: Date.now(),
      taskId,
      projectId: targetTask?.projectId,
      userId: currentUser.id,
      action: 'commented',
      details: `Commented on "${targetTask?.title || 'task'}": "${message.substring(0, 40)}${message.length > 40 ? '...' : ''}"`,
      createdAt: new Date().toISOString()
    };
    setActivityLogs(prev => [newLog, ...prev]);
  }, [currentUser, tasks]);

  // Update Settings Preferences
  const updateSettings = useCallback((newSettingsValues: Partial<AppSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettingsValues
    }));
  }, []);

  // Filters Reset
  const resetFilters = useCallback(() => {
    setFilters({
      status: 'All',
      priority: 'All',
      assigneeId: 'All'
    });
    setSearchQuery('');
  }, []);

  // Memoize the context value so consumers only re-render when real state changes,
  // not on every AppProvider render. Callbacks are stable via useCallback above.
  const value = useMemo<AppContextType>(() => ({
    currentUser,
    users: mockUsers,
    projects,
    tasks,
    comments,
    activityLogs,
    navState,
    navStack,
    settings,
    isPreloading,
    navigateTo,
    navigateBack,
    loginUser,
    logoutUser,
    addProject,
    addTask,
    updateTask,
    deleteTask,
    addComment,
    updateSettings,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    resetFilters
  }), [
    currentUser, projects, tasks, comments, activityLogs, navState, navStack,
    settings, isPreloading, navigateTo, navigateBack, loginUser, logoutUser,
    addProject, addTask, updateTask, deleteTask, addComment, updateSettings,
    searchQuery, filters, resetFilters
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
