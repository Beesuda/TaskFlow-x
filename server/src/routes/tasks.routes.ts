import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { validateBody } from '../middleware/validate.js';
import { createTaskSchema, updateTaskSchema } from '../lib/schemas.js';
import { logActivity } from '../services/activity.js';

const router = Router();

// GET /api/tasks?projectId=&status=&priority=&assigneeId=&q=
router.get('/', async (req, res) => {
  const { projectId, status, priority, assigneeId, q } = req.query;

  const where: Record<string, unknown> = {};
  if (projectId) where.projectId = Number(projectId);
  if (status && status !== 'All') where.status = String(status);
  if (priority && priority !== 'All') where.priority = String(priority);
  if (assigneeId && assigneeId !== 'All') {
    where.assigneeId = assigneeId === 'Unassigned' ? null : Number(assigneeId);
  }
  if (q) {
    const term = String(q);
    where.OR = [{ title: { contains: term } }, { description: { contains: term } }];
  }

  const tasks = await prisma.task.findMany({ where, orderBy: { id: 'asc' } });
  res.json(tasks);
});

// GET /api/tasks/:id — task + comments + activity (for TaskDetailModal).
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      comments: { orderBy: { createdAt: 'asc' } },
      activityLogs: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  res.json(task);
});

// POST /api/tasks
router.post('/', validateBody(createTaskSchema), async (req, res) => {
  const data = req.body as typeof createTaskSchema._type;

  const project = await prisma.project.findUnique({ where: { id: data.projectId } });
  if (!project) {
    res.status(400).json({ error: 'projectId does not reference an existing project' });
    return;
  }

  const task = await prisma.task.create({ data });

  const assignee = data.assigneeId ? await prisma.user.findUnique({ where: { id: data.assigneeId } }) : null;
  await logActivity({
    userId: req.user!.id,
    action: 'created',
    taskId: task.id,
    projectId: task.projectId,
    details: `Created task "${task.title}"` + (assignee ? ` and assigned to ${assignee.name}` : ''),
  });

  res.status(201).json(task);
});

// PATCH /api/tasks/:id — generates the right activity sentence, mirroring updateTask().
router.patch('/:id', validateBody(updateTaskSchema), async (req, res) => {
  const id = Number(req.params.id);
  const fields = req.body as typeof updateTaskSchema._type;

  const oldTask = await prisma.task.findUnique({ where: { id } });
  if (!oldTask) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  const task = await prisma.task.update({ where: { id }, data: fields });

  // Reproduce the frontend's change-detection sentence priority.
  let details = `Updated task "${oldTask.title}"`;
  if (fields.status && fields.status !== oldTask.status) {
    details = `Moved "${oldTask.title}" from "${oldTask.status}" to "${fields.status}"`;
  } else if (fields.assigneeId !== undefined && fields.assigneeId !== oldTask.assigneeId) {
    const newUser = fields.assigneeId ? await prisma.user.findUnique({ where: { id: fields.assigneeId } }) : null;
    details = newUser ? `Assigned "${oldTask.title}" to ${newUser.name}` : `Unassigned "${oldTask.title}"`;
  } else if (fields.priority && fields.priority !== oldTask.priority) {
    details = `Changed priority of "${oldTask.title}" to "${fields.priority}"`;
  }

  await logActivity({
    userId: req.user!.id,
    action: fields.status ? 'changed_status' : 'updated',
    taskId: id,
    projectId: oldTask.projectId,
    details,
  });

  res.json(task);
});

// DELETE /api/tasks/:id — cascades comments via schema.
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  await prisma.task.delete({ where: { id } });
  // Logged with projectId only — task-scoped activity cascades away with the task.
  await logActivity({
    userId: req.user!.id,
    action: 'deleted',
    projectId: task.projectId,
    details: `Deleted task "${task.title}"`,
  });

  res.json({ ok: true });
});

export default router;
