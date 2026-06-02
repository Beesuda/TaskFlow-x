import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { validateBody } from '../middleware/validate.js';
import { createProjectSchema, updateProjectSchema } from '../lib/schemas.js';
import { computeProgress } from '../services/progress.js';
import { logActivity } from '../services/activity.js';

const router = Router();

// GET /api/projects — each project with computed progress + task counts.
router.get('/', async (_req, res) => {
  const projects = await prisma.project.findMany({
    orderBy: { id: 'asc' },
    include: { tasks: { select: { status: true } } },
  });

  const result = projects.map((p) => {
    const taskCount = p.tasks.length;
    const doneCount = p.tasks.filter((t) => t.status === 'Done').length;
    const { tasks, ...rest } = p;
    return { ...rest, progress: computeProgress(tasks), taskCount, doneCount, openCount: taskCount - doneCount };
  });

  res.json(result);
});

// GET /api/projects/:id — project + its tasks.
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const project = await prisma.project.findUnique({
    where: { id },
    include: { tasks: { orderBy: { id: 'asc' } } },
  });
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  res.json({ ...project, progress: computeProgress(project.tasks) });
});

// POST /api/projects
router.post('/', validateBody(createProjectSchema), async (req, res) => {
  const { name, description, category, dueDate } = req.body as typeof createProjectSchema._type;
  const project = await prisma.project.create({
    data: { name, description, category: category ?? null, dueDate },
  });

  await logActivity({
    userId: req.user!.id,
    action: 'created',
    projectId: project.id,
    details: `Created new project "${name}"`,
  });

  res.status(201).json({ ...project, progress: 0, taskCount: 0, doneCount: 0, openCount: 0 });
});

// PATCH /api/projects/:id
router.patch('/:id', validateBody(updateProjectSchema), async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  const project = await prisma.project.update({ where: { id }, data: req.body });
  res.json(project);
});

// DELETE /api/projects/:id — cascades tasks/comments/activity via schema.
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  await prisma.project.delete({ where: { id } });
  // Project-scoped activity rows cascade-delete with the project, so this log
  // is recorded with no projectId (it would otherwise be orphaned/removed).
  await logActivity({ userId: req.user!.id, action: 'deleted', details: `Deleted project "${existing.name}"` });
  res.json({ ok: true });
});

export default router;
