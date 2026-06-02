import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/projects.routes.js';
import taskRoutes from './routes/tasks.routes.js';
import commentRoutes from './routes/comments.routes.js';
import userRoutes from './routes/users.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import activityRoutes from './routes/activity.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import { requireAuth } from './middleware/auth.js';
import { authLimiter, apiLimiter } from './middleware/rateLimit.js';

const app = express();

// Behind a reverse proxy (e.g. in production) — needed for correct client IPs
// in rate limiting and for secure-cookie/proto handling.
app.set('trust proxy', 1);

// Security headers (CSP, HSTS, no-sniff, frameguard, hides x-powered-by, etc.).
app.use(helmet());

// gzip responses — reduces payload size / improves response time.
app.use(compression());

// CORS restricted to an allowlist instead of reflecting any origin.
// Comma-separated CLIENT_ORIGIN env, defaulting to the local Vite dev server.
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());
app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients (curl, server-to-server) that send no Origin.
      // Disallowed origins simply get no CORS headers (callback false) — the
      // browser then blocks the response. We don't throw, to avoid 500s.
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
  }),
);

// Cap request body size to blunt large-payload DoS.
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Auth routes get the strict limiter (brute-force / signup-abuse protection).
app.use('/api/auth', authLimiter, authRoutes);

// A generous global backstop limiter for the rest of the API.
app.use('/api', apiLimiter);

// Everything below requires a valid Bearer token.
app.use('/api/projects', requireAuth, projectRoutes);
app.use('/api/tasks', requireAuth, taskRoutes);
app.use('/api', requireAuth, commentRoutes); // owns /tasks/:taskId/comments and /comments/:id
app.use('/api/users', requireAuth, userRoutes);
app.use('/api/settings', requireAuth, settingsRoutes);
app.use('/api/activity', requireAuth, activityRoutes);
app.use('/api/dashboard', requireAuth, dashboardRoutes);

// Central error handler. Respects an error's own status code (e.g. body-parser's
// 413 for oversized payloads, 400 for malformed JSON) but never leaks internal
// details — clients get a generic message, full error is logged server-side.
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  const status = (typeof err === 'object' && err !== null && 'status' in err && typeof err.status === 'number')
    ? err.status
    : (typeof err === 'object' && err !== null && 'statusCode' in err && typeof err.statusCode === 'number')
      ? err.statusCode
      : 500;
  const message = status === 413 ? 'Payload too large'
    : status === 400 ? 'Bad request'
    : status >= 400 && status < 500 ? 'Request rejected'
    : 'Internal server error';
  res.status(status).json({ error: message });
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`TaskFlow API listening on http://localhost:${PORT}`);
});
