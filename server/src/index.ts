import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/projects.routes.js';
import taskRoutes from './routes/tasks.routes.js';
import commentRoutes from './routes/comments.routes.js';
import userRoutes from './routes/users.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import activityRoutes from './routes/activity.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import { requireAuth } from './middleware/auth.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Public auth routes (login/register); /me and /logout self-guard internally.
app.use('/api/auth', authRoutes);

// Everything below requires a valid Bearer token.
app.use('/api/projects', requireAuth, projectRoutes);
app.use('/api/tasks', requireAuth, taskRoutes);
app.use('/api', requireAuth, commentRoutes); // owns /tasks/:taskId/comments and /comments/:id
app.use('/api/users', requireAuth, userRoutes);
app.use('/api/settings', requireAuth, settingsRoutes);
app.use('/api/activity', requireAuth, activityRoutes);
app.use('/api/dashboard', requireAuth, dashboardRoutes);

// Central error handler.
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`TaskFlow API listening on http://localhost:${PORT}`);
});
