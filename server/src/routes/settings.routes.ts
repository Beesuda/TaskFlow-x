import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { validateBody } from '../middleware/validate.js';
import { updateSettingsSchema } from '../lib/schemas.js';
import { publicUser } from '../lib/serialize.js';

const router = Router();

// Shape settings for the frontend AppSettings interface.
async function loadSettings(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { settings: true } });
  if (!user) return null;
  const s = user.settings;
  return {
    profileName: user.name,
    profileEmail: user.email,
    theme: s?.theme ?? 'Light',
    notifications: {
      email: s?.notifEmail ?? true,
      browser: s?.notifBrowser ?? true,
      weeklyDigest: s?.notifWeekly ?? false,
    },
  };
}

// GET /api/settings — current user's settings.
router.get('/', async (req, res) => {
  const settings = await loadSettings(req.user!.id);
  res.json(settings);
});

// PATCH /api/settings — profile name/email, theme, notification toggles.
router.patch('/', validateBody(updateSettingsSchema), async (req, res) => {
  const userId = req.user!.id;
  const body = req.body as typeof updateSettingsSchema._type;

  // Profile fields live on the User row.
  if (body.profileName || body.profileEmail) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(body.profileName ? { name: body.profileName } : {}),
        ...(body.profileEmail ? { email: body.profileEmail } : {}),
      },
    });
  }

  // Theme + notifications live on the Settings row (upsert to be safe).
  if (body.theme || body.notifications) {
    const n = body.notifications ?? {};
    await prisma.settings.upsert({
      where: { userId },
      create: {
        userId,
        theme: body.theme ?? 'Light',
        notifEmail: n.email ?? true,
        notifBrowser: n.browser ?? true,
        notifWeekly: n.weeklyDigest ?? false,
      },
      update: {
        ...(body.theme ? { theme: body.theme } : {}),
        ...(n.email !== undefined ? { notifEmail: n.email } : {}),
        ...(n.browser !== undefined ? { notifBrowser: n.browser } : {}),
        ...(n.weeklyDigest !== undefined ? { notifWeekly: n.weeklyDigest } : {}),
      },
    });
  }

  const updatedUser = await prisma.user.findUnique({ where: { id: userId } });
  const settings = await loadSettings(userId);
  res.json({ settings, user: updatedUser ? publicUser(updatedUser) : null });
});

export default router;
