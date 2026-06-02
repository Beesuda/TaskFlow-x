/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Mail, Briefcase, CheckCircle2, ListFilter } from 'lucide-react';
import { motion } from 'motion/react';

export const TeamMembers: React.FC = () => {
  const { users, tasks, projects, navigateTo, setFilters } = useApp();
  const [search, setSearch] = useState('');

  // Filter members based on keyword (memoized).
  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  }, [users, search]);

  // Per-user task counts (total / done / active) computed in a single pass.
  const countsByUser = useMemo(() => {
    const map = new Map<number, { total: number; done: number; active: number }>();
    for (const t of tasks) {
      if (t.assigneeId === null) continue;
      const entry = map.get(t.assigneeId) ?? { total: 0, done: 0, active: 0 };
      entry.total++;
      if (t.status === 'Done') entry.done++;
      else entry.active++;
      map.set(t.assigneeId, entry);
    }
    return map;
  }, [tasks]);

  const getUserTasksCount = (userId: number) => countsByUser.get(userId)?.total ?? 0;
  const getUserCompletedTasksCount = (userId: number) => countsByUser.get(userId)?.done ?? 0;
  const getUserActiveTasksCount = (userId: number) => countsByUser.get(userId)?.active ?? 0;

  const handleMemberTasksRedirect = (userId: number) => {
    // Navigate to projects screen and apply filter automatically
    setFilters(prev => ({
      ...prev,
      assigneeId: userId.toString()
    }));
    navigateTo('PROJECTS');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header section */}
      <div>
        <h3 className="bold-title text-2xl tracking-tighter uppercase theme-text mb-0.5">Workspace Assembly</h3>
        <p className="text-sm theme-text-secondary mt-1">
          Review participant credentials, view load distributions, and audit individual task responsibilities.
        </p>
      </div>

      {/* Member quick searches toolbar */}
      <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl theme-card shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="member-search-input"
            type="text"
            placeholder="Search team members by name, role, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 theme-text outline-none focus:border-blue-500"
          />
        </div>
        <span className="text-xs theme-text-muted font-semibold tracking-tight hidden sm:block">
          Showing {filteredUsers.length} of {users.length} teammates
        </span>
      </div>

      {/* Interactive team members grid */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12 p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/50 dark:bg-slate-900/10" id="team-empty-state">
          <p className="text-sm theme-text-muted">No team members conform to your search credentials.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="members-grid">
          {filteredUsers.map(member => {
            const total = getUserTasksCount(member.id);
            const activeCount = getUserActiveTasksCount(member.id);
            const completeCount = getUserCompletedTasksCount(member.id);
            const completionPercent = total > 0 ? Math.round((completeCount / total) * 100) : 0;

            return (
              <motion.div
                layout
                whileHover={{ y: -3 }}
                transition={{ duration: 0.15 }}
                key={member.id}
                className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between theme-card relative"
              >
                <div>
                  {/* Top layout line */}
                  <div className="flex items-center gap-3">
                    {/* Circle avatar */}
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold text-base shadow-sm shrink-0">
                      {member.avatar}
                    </div>

                    {/* Member role, credentials */}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm tracking-tight theme-text truncate">
                        {member.name}
                      </h3>
                      <p className="text-[11px] theme-text-secondary mt-0.5 font-medium flex items-center gap-1.5 grayscale shrink-0">
                        <Briefcase size={12} className="text-slate-400" />
                        <span>{member.role}</span>
                      </p>
                    </div>
                  </div>

                  {/* Mail address line */}
                  <div className="mt-4 flex items-center gap-2 text-xs theme-text-secondary">
                    <Mail size={13} className="text-slate-400shrink-0" />
                    <span className="truncate select-all select-none">{member.email}</span>
                  </div>
                </div>

                {/* Loading counts */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    {/* Active load */}
                    <div className="bg-slate-50/60 dark:bg-slate-950/20 p-2.5 rounded-xl border border-slate-100/60 dark:border-slate-800/30">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                        Active Tickets
                      </span>
                      <span className="text-base font-extrabold theme-text block mt-0.5">
                        {activeCount}
                      </span>
                    </div>

                    {/* Closed load */}
                    <div className="bg-slate-50/60 dark:bg-slate-950/20 p-2.5 rounded-xl border border-slate-100/60 dark:border-slate-800/30">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                        Closed Tasks
                      </span>
                      <span className="text-base font-extrabold text-green-500 block mt-0.5">
                        {completeCount}
                      </span>
                    </div>
                  </div>

                  {/* Metrics progress */}
                  {total > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-[10px] theme-text-secondary font-semibold mb-1">
                        <span>Milestone Success</span>
                        <span>{completionPercent}%</span>
                      </div>
                      <div className="h-1 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full transition-all duration-350"
                          style={{ width: `${completionPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Filter redirect link */}
                  {total > 0 && (
                    <button
                      onClick={() => handleMemberTasksRedirect(member.id)}
                      className="mt-4 flex items-center justify-center gap-1.5 w-full py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/40 dark:hover:bg-slate-850 text-slate-500 hover:text-blue-600 border border-slate-100/50 dark:border-slate-800/40 rounded-lg text-[10px] font-bold cursor-pointer transition"
                    >
                      <ListFilter size={10} />
                      <span>Audit Assigned Workload</span>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
