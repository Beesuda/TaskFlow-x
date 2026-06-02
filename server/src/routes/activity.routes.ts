import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

// GET /api/activity?limit= — recent activity feed, newest first.
router.get('/', async (req, res) => {
  const limit = req.query.limit ? Math.min(Number(req.query.limit), 200) : 50;
  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  res.json(logs);
});

export default router;
