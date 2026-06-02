import { Router } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import { signToken } from '../lib/jwt.js';
import { publicUser } from '../lib/serialize.js';
import { validateBody } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { loginSchema, registerSchema } from '../lib/schemas.js';
import { logActivity } from '../services/activity.js';

const router = Router();

// Derive 2-letter initials avatar from a name, e.g. "Marcus Vance" -> "MV".
function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const chars = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : name.slice(0, 2);
  return chars.toUpperCase();
}

// POST /api/auth/register
router.post('/register', validateBody(registerSchema), async (req, res) => {
  const { name, email, password, role } = req.body as typeof registerSchema._type;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hash,
      avatar: initials(name),
      role: role ?? 'Team Member',
      settings: { create: {} },
    },
  });

  const token = signToken({ userId: user.id, email: user.email });
  res.status(201).json({ token, user: publicUser(user) });
});

// POST /api/auth/login
router.post('/login', validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body as typeof loginSchema._type;

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = signToken({ userId: user.id, email: user.email });
  await logActivity({ userId: user.id, action: 'login', details: `${user.name} signed into TaskFlow.` });
  res.json({ token, user: publicUser(user) });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/logout — stateless JWT; just records the activity.
router.post('/logout', requireAuth, async (req, res) => {
  const user = req.user!;
  await logActivity({ userId: user.id, action: 'logout', details: `${user.name} logged out.` });
  res.json({ ok: true });
});

export default router;
