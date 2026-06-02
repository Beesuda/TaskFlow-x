/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { Eye, EyeOff, Lock, Mail, ShieldAlert } from 'lucide-react';

export const Login: React.FC = () => {
  const { loginUser } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Pre-validation
    if (!email.trim() || !password.trim()) {
      setError('Please complete all required fields.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    const success = loginUser(email);
    setIsSubmitting(false);
    if (!success) {
      setError('Unable to load data or sign in. Try again.');
    }
  };

  const autofillUser = (selectedEmail: string) => {
    setEmail(selectedEmail);
    setPassword('••••••••');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans select-none">
      {/* Background Graphic Accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/10 dark:bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-8 relative z-10"
        id="login-card"
      >
        {/* App Branding Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white font-bold text-2xl shadow-lg shadow-blue-500/20 mb-4 ring-4 ring-blue-50 dark:ring-blue-950/40">
            TF
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Sign in to TaskFlow</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Manage projects, discuss tasks, and collaborate
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-start gap-3 p-3 mb-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium"
            id="login-error-alert"
          >
            <ShieldAlert size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5" htmlFor="email-input">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail size={16} />
              </span>
              <input
                id="email-input"
                type="email"
                required
                placeholder="sarah@example.com or marcus@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-normal text-sm transition-all focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 outline-none"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor="password-input">
                Password
              </label>
              <a 
                href="#forgot" 
                onClick={(e) => { e.preventDefault(); setError('Password recovery was dispatched to registered accounts.'); }}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 transition"
                id="forgot-password-link"
              >
                Forgot Password?
              </a>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock size={16} />
              </span>
              <input
                id="password-input"
                type={isPasswordVisible ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-normal text-sm transition-all focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 outline-none"
              />
              <button
                type="button"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {isPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between">
            <label className="relative flex items-center gap-2 cursor-pointer select-none">
              <input
                id="remember-me-checkbox"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 bg-slate-50"
              />
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Remember Me
              </span>
            </label>
          </div>

          {/* Sign In Button */}
          <button
            id="signin-submit-btn"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>

        {/* Demo Fast Logins Section */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80">
          <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
            Quick SignIn (Demo)
          </p>
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <button
              id="autofill-marcus"
              onClick={() => autofillUser('marcus@example.com')}
              className="px-3 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800/80 rounded-lg text-slate-700 dark:text-slate-300 font-medium border border-slate-100 dark:border-slate-800/40 cursor-pointer"
            >
              Marcus (PM)
            </button>
            <button
              id="autofill-sarah"
              onClick={() => autofillUser('sarah@example.com')}
              className="px-3 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800/80 rounded-lg text-slate-700 dark:text-slate-300 font-medium border border-slate-100 dark:border-slate-800/40 cursor-pointer"
            >
              Sarah (Designer)
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
