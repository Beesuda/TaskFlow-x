import { prisma } from '../lib/prisma.js';

export type ActivityAction =
  | 'login'
  | 'logout'
  | 'created'
  | 'changed_status'
  | 'updated'
  | 'assigned'
  | 'commented'
  | 'deleted';

interface LogActivityInput {
  userId: number;
  action: ActivityAction;
  details: string;
  taskId?: number | null;
  projectId?: number | null;
}

// Central helper to write an ActivityLog row. The `details` strings produced by
// callers intentionally match the human-readable sentences the frontend
// AppContext generated, so the Dashboard/TaskDetail feeds stay identical.
export async function logActivity(input: LogActivityInput) {
  return prisma.activityLog.create({
    data: {
      userId: input.userId,
      action: input.action,
      details: input.details,
      taskId: input.taskId ?? null,
      projectId: input.projectId ?? null,
    },
  });
}
