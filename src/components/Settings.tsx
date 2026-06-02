/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Settings as SettingsIcon, 
  User as UserIcon, 
  Sun, 
  Moon, 
  Sparkles, 
  Bell, 
  Mail, 
  Smartphone, 
  Check, 
  ShieldAlert,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Settings: React.FC = () => {
  const { 
    currentUser, 
    settings, 
    updateSettings, 
    loginUser, 
    users 
  } = useApp();

  const [name, setName] = useState(settings.profileName);
  const [email, setEmail] = useState(settings.profileEmail);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const themesList = [
    { 
      key: 'Light' as const, 
      label: 'Warm Light', 
      desc: 'High contrast clean slate and dark grey typography.', 
      icon: Sun,
      classes: 'bg-white border-slate-200 text-slate-800'
    },
    { 
      key: 'Dark' as const, 
      label: 'Cool Dark', 
      desc: 'Eye-friendly, soothing navy twilight elements.', 
      icon: Moon,
      classes: 'bg-slate-900 border-slate-850 text-slate-100'
    },
    { 
      key: 'Cosmic' as const, 
      label: 'Deep Cosmic', 
      desc: 'Vibrant indigo shadows with retro purple hints.', 
      icon: Sparkles,
      classes: 'bg-indigo-950 border-purple-900/40 text-purple-200'
    }
  ];

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (!name.trim()) {
      setError('Preferred display name is required.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid administrative contact email.');
      return;
    }

    // Persist to Context
    updateSettings({
      profileName: name.trim(),
      profileEmail: email.trim()
    });

    setSuccess('Settings profile updated successfully.');
    
    // Simulate updating mock current user references
    if (currentUser) {
      currentUser.name = name.trim();
      currentUser.email = email.trim();
      localStorage.setItem('tf_user', JSON.stringify(currentUser));
    }

    setTimeout(() => setSuccess(''), 3000);
  };

  const handleNotificationToggle = (key: 'email' | 'browser' | 'weeklyDigest') => {
    updateSettings({
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key]
      }
    });

    setSuccess('Notification tolerances adjusted.');
    setTimeout(() => setSuccess(''), 2000);
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl" id="settings-page-wrapper">
      {/* Header section */}
      <div>
        <h3 className="bold-title text-2xl tracking-tighter uppercase theme-text mb-0.5">System Preferences</h3>
        <p className="text-sm theme-text-secondary mt-1">
          Adjust visual themes, override administrative notification rules, and customize profile identities.
        </p>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 text-xs font-semibold text-green-700 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/25 rounded-xl flex items-center gap-1.5"
            id="settings-success-alert"
          >
            <Check size={14} className="bg-green-500 text-white rounded-full p-0.5" />
            <span>{success}</span>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 text-xs font-semibold text-red-700 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/25 rounded-xl flex items-center gap-1.5"
            id="settings-error-alert"
          >
            <ShieldAlert size={14} className="bg-red-500 text-white rounded-full p-0.5" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="settings-grid">
        
        {/* Left column (col-span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Theme Preferences selection panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs theme-card" id="settings-theme-panel">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
              <Sparkles size={14} />
              <span>Canvas Visual Palette</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {themesList.map(tOption => {
                const isSelected = settings.theme === tOption.key;
                const TIcon = tOption.icon;

                return (
                  <button
                    key={tOption.key}
                    id={`settings-theme-btn-${tOption.key.toLowerCase()}`}
                    onClick={() => updateSettings({ theme: tOption.key })}
                    className={`p-4 border rounded-xl text-left hover:border-blue-500 transition cursor-pointer select-none relative overflow-hidden group ${tOption.classes} ${
                      isSelected 
                        ? 'ring-2 ring-blue-500 border-blue-500 shadow-md scale-[1.02]' 
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {/* Tick mark indicator */}
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center p-0.5 shadow-sm">
                        <Check size={10} strokeWidth={4} />
                      </span>
                    )}

                    <TIcon size={18} className="text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="font-bold text-xs tracking-tight block">{tOption.label}</p>
                    <p className="text-[10px] opacity-75 mt-1 leading-snug font-normal">{tOption.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Personal Profile Information settings */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs theme-card" id="settings-profile-panel">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
              <UserIcon size={14} />
              <span>Identity Profile Configurations</span>
            </h3>

            <form onSubmit={handleProfileSubmit} className="space-y-4 font-sans text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full name input */}
                <div>
                  <label className="block text-slate-500 font-bold uppercase tracking-wider mb-1" htmlFor="settings-name-input">
                    Preferred Display Name
                  </label>
                  <input
                    id="settings-name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg theme-input text-sm"
                  />
                </div>

                {/* Contact email administrative */}
                <div>
                  <label className="block text-slate-500 font-bold uppercase tracking-wider mb-1" htmlFor="settings-email-input">
                    Administrative Contact Email
                  </label>
                  <input
                    id="settings-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg theme-input text-sm"
                  />
                </div>
              </div>

              {/* Show-only user role card for fidelity */}
              <div className="bg-slate-50 dark:bg-slate-950/30 p-3 rounded-lg border border-slate-100 dark:border-slate-800/40 flex items-center justify-between text-xs font-semibold theme-text-secondary">
                <span>Account Clearance Level</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest text-[10px]">
                  {currentUser?.role || 'Assembly Participant'}
                </span>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center justify-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 transition shadow-md shadow-blue-500/10 text-white font-semibold text-xs rounded-lg cursor-pointer"
                  id="settings-save-profile-btn"
                >
                  <Save size={13} />
                  <span>Save Preferences</span>
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right column (col-span 1): Notifications switch checklists */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs theme-card" id="settings-notifications-panel">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
              <Bell size={14} />
              <span>Notification Tolerances</span>
            </h3>

            <div className="space-y-4">
              
              {/* Option 1: Email notes */}
              <label className="flex items-start gap-3 cursor-pointer select-none group">
                <input
                  id="notif-opt-email"
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={() => handleNotificationToggle('email')}
                  className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <div className="text-xs">
                  <span className="font-bold theme-text block group-hover:text-blue-600 transition">Email Digests</span>
                  <span className="text-[10px] theme-text-secondary leading-normal block mt-0.5 font-normal">
                    Receive inbox updates immediately when tickets of active workspaces change columns.
                  </span>
                </div>
              </label>

              {/* Option 2: Browser alerts */}
              <label className="flex items-start gap-3 cursor-pointer select-none group">
                <input
                  id="notif-opt-browser"
                  type="checkbox"
                  checked={settings.notifications.browser}
                  onChange={() => handleNotificationToggle('browser')}
                  className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <div className="text-xs">
                  <span className="font-bold theme-text block group-hover:text-blue-600 transition">Assignment Alerts</span>
                  <span className="text-[10px] theme-text-secondary leading-normal block mt-0.5 font-normal">
                    Allow browser notification flags directly inside active tab frames.
                  </span>
                </div>
              </label>

              {/* Option 3: Weekly summary lists */}
              <label className="flex items-start gap-3 cursor-pointer select-none group">
                <input
                  id="notif-opt-weeklyDigest"
                  type="checkbox"
                  checked={settings.notifications.weeklyDigest}
                  onChange={() => handleNotificationToggle('weeklyDigest')}
                  className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <div className="text-xs">
                  <span className="font-bold theme-text block group-hover:text-blue-600 transition">Weekly Insights</span>
                  <span className="text-[10px] theme-text-secondary leading-normal block mt-0.5 font-normal">
                    Deliver deep research workloads and individual task statistics once weekly.
                  </span>
                </div>
              </label>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
