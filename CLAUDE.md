# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project shape

TaskFlow is a **two-part** app:

- **Frontend** (`src/`) — a React 19 + TypeScript + Vite 6 SPA. Runs standalone; all state is client-side in a single Context, persisted to `localStorage`.
- **Backend** (`server/`) — an Express 4 + Prisma + SQLite REST API with JWT/bcrypt auth. It mirrors the frontend's domain model but **the SPA is not yet wired to it** — the frontend still runs on `localStorage`/mock data.

## Commands

**Frontend (repo root)**
- `npm run dev` — Vite dev server on port 3000 (host 0.0.0.0)
- `npm run build` / `npm run preview` — production build / preview
- `npm run lint` — type-check only (`tsc --noEmit`); no ESLint. The root `tsconfig.json` **excludes `server/`** (it has its own config), so this checks the frontend only.

**Backend (`server/`)**
- `npm run dev` — API with hot reload (`tsx watch`) on port 4000
- `npm run build` / `npm run start` — compile to `dist/` / run compiled
- `npm run lint` — type-check (`tsc --noEmit`)
- `npm run prisma:generate` / `npm run prisma:migrate` / `npm run prisma:reset`
- `npm run seed` — load the demo dataset (ports `src/data/mockData.ts` into SQLite)

**Docker (repo root)** — `docker compose up -d --build`. Publishes web on **8090** and API on **4100** (chosen to avoid the dev servers on 3000/4000). SQLite persists in the `taskflow-db` volume.

There is no test runner. Use `npm run lint` in each package to validate type-safety.

## Frontend architecture

**Central state — `src/context/AppContext.tsx`.** A single `AppProvider` holds *all* app state (users, projects, tasks, comments, activity logs, navigation, settings, search/filters) and exposes it via `useApp()`. There is no other store. Key behaviors:
- **Persistence:** collections are seeded from `src/data/mockData.ts`, then mirrored to `localStorage` under `tf_*` keys (`tf_user`, `tf_projects`, `tf_tasks`, `tf_comments`, `tf_activities`, `tf_settings`) via `useEffect`. Clearing those keys resets the app.
- **Auth is simulated:** `loginUser(email)` matches against `mockUsers`, falling back to Marcus Vance (PM) on no match. Users are never created client-side.
- **Project progress is derived, not stored:** the module-level `recalculateProgress` recomputes `project.progress` (% of tasks `Done`) inside `addTask`/`updateTask`/`deleteTask`. Preserve this recalc when changing task mutations or progress bars desync.
- **Activity logs** are written as a side effect of nearly every mutation; newest-first. IDs use `Date.now()`.
- **Performance:** the Context `value` is `useMemo`'d and every action is `useCallback`'d so a single task change doesn't re-render all consumers. Keep this when adding actions.

**Navigation — no router.** Screens switch via `navState` (`{ screen, projectId?, taskId? }`) plus a manual `navStack` history. `navigateTo`/`navigateBack` are synchronous (no artificial delay). `isPreloading` still exists in the context type but is hardwired `false` — the `Preloader` is kept for future real async. `App.tsx`'s `renderScreen()` maps `navState.screen` to a screen. Deep-linking to a task auto-opens the detail modal via a **`useEffect`** in `AppContent` keyed on `navState.taskId` (not a render-body side effect).

**Screens vs. modals.** Top-level screens (`Dashboard`, `Projects`, `ProjectDetail`, `TeamMembers`, `Settings`, `Login`) live in `src/components/` and are routed by `renderScreen`. Modals (`TaskFormModal`, `TaskDetailModal`) are local state in `AppContent`, rendered in an `AnimatePresence` overlay. `ProjectDetail` hosts the `KanbanBoard` / `ListView` views. Heavy derived lists in these components are `useMemo`'d (single-pass groupings/counts) — follow that pattern.

**Types — `src/types.ts`.** Single source of truth for the domain model (`Task`, `Project`, `User`, `Comment`, `ActivityLog`) and the `TaskStatus`/`TaskPriority`/`Screen` string-literal unions. `TaskStatus` ordering (`Backlog → To Do → In Progress → Review → Done`) defines the Kanban columns.

**Styling.** Tailwind CSS v4 via `@tailwindcss/vite` (configured in CSS, not JS). Three CSS-variable themes — Light / Dark / Cosmic — defined in `src/index.css` (`:root`, `.dark-theme`, `.cosmic-theme`); the theme class is toggled on `document.documentElement` from `settings.theme`. Use the `theme-bg` / `theme-text-*` utilities and CSS vars rather than hardcoding colors. Animations use `motion/react`; icons use `lucide-react`. Screen transitions are a fast (~120ms) opacity crossfade.

**Import alias.** `@/*` resolves to the repo root (set in both `tsconfig.json` and `vite.config.ts`).

## Backend architecture (`server/`)

Express app in `src/index.ts` with this middleware chain: `helmet` → `compression` → CORS (allowlist via `CLIENT_ORIGIN`) → `express.json({ limit: '100kb' })` → rate limiters → `requireAuth` → routes.

- **Routes** (`src/routes/`): `auth`, `projects`, `tasks`, `comments`, `users`, `settings`, `activity`, `dashboard`. All except `auth/login` & `auth/register` require a Bearer JWT.
- **Data model — `prisma/schema.prisma`.** `User`, `Project`, `Task`, `Comment`, `ActivityLog`, `Settings`, integer PKs. `status`/`priority`/`theme` are `String` columns (SQLite has no enums); `zod` schemas in `src/lib/schemas.ts` enforce the literals to match the TS unions. `Project.progress` is **computed on read** (`src/services/progress.ts`), never stored.
- **Activity strings** in `src/services/activity.ts` reproduce the exact human-readable sentences the frontend Context generated (e.g. `Moved "X" from "To Do" to "In Progress"`) — keep them in sync if you touch either side.
- **Auth/security:** `src/lib/jwt.ts` refuses to start in production without a strong (≥32 char, non-default) `JWT_SECRET`. Users are always serialized without the password hash (`src/lib/serialize.ts`).

## Docker

- `Dockerfile` (root) — multi-stage: Node builds the Vite bundle → nginx serves it (`nginx.conf`, SPA history fallback).
- `server/Dockerfile` + `server/docker-entrypoint.sh` — runs `prisma migrate deploy`, seeds **only if the DB is empty**, then `tsx src/index.ts`.
- `docker-compose.yml` — orchestrates both; API runs `NODE_ENV=production` with a strong `JWT_SECRET` and SQLite on a named volume at `/data/dev.db`.

## Conventions

- Do not modify the HMR/file-watching logic in `vite.config.ts` — it is intentionally gated on `DISABLE_HMR` for the AI Studio agent-edit environment.
- Keep frontend and backend domain shapes aligned with `src/types.ts`.
- This is a Google AI Studio app: `GEMINI_API_KEY`/`APP_URL` are injected at runtime (see `.env.example`), but the app makes **no live Gemini calls** — it is fully client-side.
