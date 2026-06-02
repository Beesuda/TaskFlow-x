/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PreloaderProps {
  isLoading: boolean;
}

export const Preloader: React.FC<PreloaderProps> = ({ isLoading }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <>
          {/* Top linear progress loading bar overlay */}
          <motion.div
            initial={{ width: "0%", opacity: 1 }}
            animate={{ width: "100%", opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.42, ease: "easeInOut" }}
            className="fixed top-0 left-0 h-1 bg-linear-to-r from-blue-500 via-indigo-600 to-indigo-700 z-50 shadow-[0_1px_10px_rgba(59,130,246,0.5)]"
          />

          {/* Centered glass-morphism loading indicator badge */}
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: -10 }}
              transition={{ type: "spring", stiffness: 380, damping: 25 }}
              className="bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-md border border-slate-800 p-5 rounded-2xl shadow-2xl shadow-black/40 flex items-center gap-4 text-white pointer-events-auto border-l-4 border-l-blue-500"
            >
              <div className="relative">
                <Loader2 size={24} className="animate-spin text-blue-500" />
                <Sparkles size={11} className="absolute -top-1 -right-1 text-amber-400 animate-pulse" />
              </div>
              <div className="font-sans">
                <h4 className="bold-title text-[11px] tracking-widest uppercase text-blue-400">PRELOADING</h4>
                <p className="text-[10px] text-slate-350 font-bold uppercase tracking-wider mt-0.5">
                  Synchronizing Workspace Assemblies...
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
