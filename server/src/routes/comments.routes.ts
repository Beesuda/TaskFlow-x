import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { validateBody } from '../middleware/validate.js';
import { createCommentSchema } from '../lib/schemas.js';
import { logActivity } from '../services/activity.js';

// Mounted at /api so it can own both /tasks/:taskId/comments and /comments/:id.
const router = Router();

// GET /api/tasks/:taskId/comments
router.get('/tasks/:taskId/comments', async (req, res) => {
  const taskId = Number(req.params.taskId);
  const comments = await prisma.comment.findMany({ where: { taskId }, orderBy: { createdAt: 'asc' } });
  res.json(comments);
});

// POST /api/tasks/:taskId/comments
router.post('/tasks/:taskId/comments', validateBody(createCommentSchema), async (req, res) => {
  const taskId = Number(req.params.taskId);
  const { message } = req.body as typeof createCommentSchema._type;

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  const comment = await prisma.comment.create({
    data: { taskId, userId: req.user!.id, message },
  });

  const snippet = message.length > 40 ? `${message.slice(0, 40)}...` : message;
  await logActivity({
    userId: req.user!.id,
    action: 'commented',
    taskId,
    projectId: task.projectId,
    details: `Commented on "${task.title}": "${snippet}"`,
  });

  res.status(201).json(comment);
});

// DELETE /api/comments/:id
router.delete('/comments/:id', async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.comment.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: 'Comment not found' });
    return;
  }
  await prisma.comment.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;
