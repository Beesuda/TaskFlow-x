import type { Task } from '@prisma/client';

// % of a project's tasks that are Done, rounded — mirrors recalculateProgress()
// in the frontend AppContext. Computed on read; never stored.
export function computeProgress(tasks: Pick<Task, 'status'>[]): number {
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.status === 'Done').length;
  return Math.round((done / tasks.length) * 100);
}
