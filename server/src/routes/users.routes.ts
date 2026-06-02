import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { publicUser } from '../lib/serialize.js';

const router = Router();

// GET /api/users — team list with per-user task counts (total / done / active),
// backing TeamMembers.tsx.
router.get('/', async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { id: 'asc' },
    include: { tasks: { select: { status: true } } },
  });

  const result = users.map((u) => {
    const total = u.tasks.length;
    const done = u.tasks.filter((t) => t.status === 'Done').length;
    const { tasks: _tasks, ...rest } = u;
    return { ...publicUser(rest), taskCount: total, doneCount: done, activeCount: total - done };
  });

  res.json(result);
});

// GET /api/users/:id
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(publicUser(user));
});

export default router;
