/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Screen } from '../types';
import { 
  LayoutDashboard, 
  FolderLock, 
  FolderGit, 
  Users, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  X, 
  Plus, 
  Briefcase,
  ChevronLeft,
  Bell,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavigationProps {
  onNewTaskClick: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onNewTaskClick }) => {
  const { navState, navigateTo, currentUser, logoutUser, projects, settings, updateSettings } = useApp();
  const [isTabletSidebarOpen, setIsTabletSidebarOpen] = useState(false);

  if (navState.screen === 'LOGIN' || !currentUser) return null;

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'Light' ? 'Dark' : 'Light';
    updateSettings({ theme: nextTheme });
  };

  const navItems = [
    { name: 'Dashboard', screen: 'DASHBOARD' as Screen, icon: LayoutDashboard },
    { name: 'Projects', screen: 'PROJECTS' as Screen, icon: FolderGit },
    { name: 'Team Members', screen: 'TEAM' as Screen, icon: Users },
    { name: 'Settings', screen: 'SETTINGS' as Screen, icon: SettingsIcon },
  ];

  const handleNavClick = (screen: Screen) => {
    navigateTo(screen);
    setIsTabletSidebarOpen(false);
  };

  return (
    <>
      {/* 1. DESKTOP SIDEBAR (md and up) */}
      <aside 
        className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 text-white select-none z-30 shadow-xl"
        style={{ backgroundColor: 'var(--bg-sidebar)', color: 'var(--text-sidebar)' }}
        id="desktop-sidebar"
      >
        {/* LOGO SECTION */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-opacity-10 animate-fade-in" style={{ borderColor: 'var(--text-sidebar)' }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 bold-title text-xl tracking-tighter">
              TF
            </div>
            <div>
              <h1 className="bold-title text-2xl tracking-tighter text-white uppercase">TaskFlow.</h1>
              <span className="text-[10px] opacity-60 font-bold uppercase tracking-widest block mt-0.5">Team Workspaces</span>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            id="theme-toggle-desktop"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors cursor-pointer"
            title={settings.theme === 'Light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {settings.theme === 'Light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>

        {/* CREATE TASK LAUNCHER */}
        <div className="px-4 py-4">
          <button 
            id="sidebar-new-task-btn"
            onClick={onNewTaskClick}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 transition-all rounded-lg font-medium text-sm shadow-md shadow-blue-600/30 text-white cursor-pointer group"
          >
            <Plus size={16} className="group-hover:rotate-90 transition-transform duration-200" />
            <span>New Task</span>
          </button>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 px-3 space-y-1 py-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = navState.screen === item.screen || (item.screen === 'PROJECTS' && navState.screen === 'PROJECT_DETAIL');
            const Icon = item.icon;
            return (
              <button
                key={item.screen}
                id={`nav-${item.screen.toLowerCase()}`}
                onClick={() => handleNavClick(item.screen)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all text-left cursor-pointer ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/10' 
                    : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
                {item.screen === 'PROJECTS' && projects.length > 0 && (
                  <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {projects.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* FOOTER USER CARD */}
        <div className="p-4 border-t border-opacity-10 mt-auto" style={{ borderColor: 'var(--text-sidebar)' }}>
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/30">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 font-bold text-white shadow-sm">
              {currentUser.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate leading-tight">{currentUser.name}</p>
              <p className="text-xs opacity-50 truncate leading-none mt-0.5">{currentUser.role}</p>
            </div>
          </div>
          <button 
            id="sidebar-logout-btn"
            onClick={logoutUser}
            className="flex items-center gap-2 mt-3 w-full px-4 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left font-medium cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. TABLET COLLAPSIBLE SIDEBAR TIGGER & DRAWER (md - lg / hidden on mobile) */}
      <div className="hidden sm:max-md:flex items-center justify-between h-14 px-6 fixed top-0 left-0 right-0 z-30 theme-card shadow-sm border-b">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsTabletSidebarOpen(true)}
            className="p-1.5 rounded-lg theme-hover cursor-pointer"
            id="tablet-hamburger-btn"
          >
            <Menu size={20} />
          </button>
          <span className="font-bold tracking-tight text-lg">TaskFlow</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            id="theme-toggle-tablet"
            className="p-2 rounded-lg theme-hover theme-text cursor-pointer transition-colors"
            title={settings.theme === 'Light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {settings.theme === 'Light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button onClick={onNewTaskClick} className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm">
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Tablet Slide-out Drawer */}
      <AnimatePresence>
        {isTabletSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTabletSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40 sm:max-md:block hidden"
            />
            {/* Drawer */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-64 z-50 flex flex-col sm:max-md:flex h-full text-white shadow-2xl"
              style={{ backgroundColor: 'var(--bg-sidebar)' }}
              id="tablet-drawer"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-opacity-10" style={{ borderColor: 'var(--text-sidebar)' }}>
                <span className="font-bold text-lg">TaskFlow</span>
                <button onClick={() => setIsTabletSidebarOpen(false)} className="p-1 rounded-full text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <div className="px-4 py-4">
                <button 
                  onClick={() => { onNewTaskClick(); setIsTabletSidebarOpen(false); }}
                  className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 rounded-lg text-sm font-medium"
                >
                  <Plus size={16} />
                  <span>New Task</span>
                </button>
              </div>
              <nav className="flex-1 px-3 space-y-1">
                {navItems.map((item) => {
                  const isActive = navState.screen === item.screen || (item.screen === 'PROJECTS' && navState.screen === 'PROJECT_DETAIL');
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.screen}
                      onClick={() => handleNavClick(item.screen)}
                      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium leading-none cursor-pointer ${
                        isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-opacity-10 mt-auto" style={{ borderColor: 'var(--text-sidebar)' }}>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/30 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 font-bold text-sm text-white">
                    {currentUser.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate leading-tight">{currentUser.name}</p>
                  </div>
                </div>
                <button 
                  onClick={logoutUser}
                  className="flex items-center gap-2 w-full px-4 py-2 text-xs text-red-400 font-medium cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 3. MOBILE TOP & NAVIGATION VIEW BAR (sm and below) */}
      <div className="block sm:hidden fixed top-0 left-0 right-0 h-14 bg-white dark:bg-slate-900 border-b z-30 px-4 theme-card" id="mobile-top-nav">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
              TF
            </div>
            <span className="font-bold text-base tracking-tight theme-text">TaskFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              id="theme-toggle-mobile"
              className="p-1.5 rounded-lg theme-hover theme-text cursor-pointer transition-colors"
              title={settings.theme === 'Light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {settings.theme === 'Light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button 
              onClick={onNewTaskClick}
              className="p-1.5 bg-blue-600 text-white rounded-lg shadow-md cursor-pointer"
              id="mobile-new-task-btn"
            >
              <Plus size={16} />
            </button>
            <div className="relative">
              <span className="absolute top-0 right-0 w-2 h-2 bg-blue-600 rounded-full" />
              <div className="flex items-center justify-center w-8 h-8 rounded-full theme-hover theme-text cursor-pointer">
                <Bell size={18} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Rail */}
      <div 
        className="block sm:hidden fixed bottom-1 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t z-30 theme-card px-4" 
        style={{ borderRadius: '12px 12px 0 0', boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.05)' }}
        id="mobile-bottom-nav"
      >
        <div className="flex items-center justify-around h-full">
          {navItems.map((item) => {
            const isActive = navState.screen === item.screen || (item.screen === 'PROJECTS' && navState.screen === 'PROJECT_DETAIL');
            const Icon = item.icon;
            return (
              <button
                key={item.screen}
                id={`mobile-nav-${item.screen.toLowerCase()}`}
                onClick={() => handleNavClick(item.screen)}
                className={`flex flex-col items-center justify-center gap-1 w-14 h-12 rounded-lg transition-all cursor-pointer ${
                  isActive ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <Icon size={18} className={isActive ? 'scale-110' : ''} />
                <span className="text-[10px] font-semibold">{item.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
