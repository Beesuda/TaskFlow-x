import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { computeProgress } from '../services/progress.js';

const router = Router();

// GET /api/dashboard — single aggregate payload backing Dashboard.tsx.
router.get('/', async (req, res) => {
  const userId = req.user!.id;

  const [projects, tasks, activityLogs] = await Promise.all([
    prisma.project.findMany({ orderBy: { id: 'asc' }, include: { tasks: { select: { status: true } } } }),
    prisma.task.findMany({ orderBy: { id: 'asc' } }),
    prisma.activityLog.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
  ]);

  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
  const doneTasksCount = tasks.filter((t) => t.status === 'Done').length;

  // Average of per-project computed progress, matching the frontend.
  const overallProgress =
    totalProjects > 0
      ? Math.round(projects.reduce((sum, p) => sum + computeProgress(p.tasks), 0) / totalProjects)
      : 0;

  const myAssignedTasks = tasks.filter((t) => t.assigneeId === userId);
  const myOpenTasks = myAssignedTasks.filter((t) => t.status !== 'Done');

  // Upcoming deadlines: open tasks sorted by due date (soonest first).
  const upcomingDeadlines = tasks
    .filter((t) => t.status !== 'Done')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  const projectSummaries = projects.map((p) => {
    const { tasks: pTasks, ...rest } = p;
    return {
      ...rest,
      progress: computeProgress(pTasks),
      taskCount: pTasks.length,
      doneCount: pTasks.filter((t) => t.status === 'Done').length,
    };
  });

  res.json({
    metrics: { totalProjects, totalTasks, inProgressTasks, doneTasksCount, overallProgress },
    projects: projectSummaries,
    myTasks: myOpenTasks,
    myOpenTaskCount: myOpenTasks.length,
    upcomingDeadlines,
    recentActivity: activityLogs,
  });
});

export default router;
