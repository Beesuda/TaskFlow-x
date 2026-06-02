# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server on port 3000 (host 0.0.0.0)
- `npm run build` — production build
- `npm run preview` — preview the production build
- `npm run lint` — type-check only (`tsc --noEmit`); there is no separate ESLint config
- `npm run clean` — remove `dist` and `server.js`

There is no test runner configured. Use `npm run lint` to validate type-safety after changes.

## Environment

This is a Google AI Studio app. `GEMINI_API_KEY` and `APP_URL` are injected at runtime by AI Studio (see `.env.example`); locally they go in `.env.local`. Note: despite the Gemini API capability declared in `metadata.json` and the `@google/genai` dependency, the current app has no live API calls — it is fully client-side with mock data.

## Architecture

TaskFlow is a single-page React 19 + TypeScript + Vite team task-management app. All state lives client-side; there is no backend.

**Central state — `src/context/AppContext.tsx`.** A single `AppProvider` holds *all* app state (users, projects, tasks, comments, activity logs, navigation, settings, search/filters) and exposes it via the `useApp()` hook. Every component reads and mutates state through this context — there is no other state store. Key behaviors:
- **Persistence:** all mutable collections are seeded from `src/data/mockData.ts`, then mirrored to `localStorage` under `tf_*` keys (`tf_user`, `tf_projects`, `tf_tasks`, `tf_comments`, `tf_activities`, `tf_settings`) via `useEffect`. Clearing those keys resets the app.
- **Auth is simulated:** `loginUser(email)` matches against `mockUsers`, falling back to Marcus Vance (the PM) on no match. Users are never created.
- **Project progress is derived, not stored independently:** `recalculateProgress` recomputes `project.progress` (% of tasks `Done`) inside `addTask`/`updateTask`/`deleteTask` using nested `setProjects` calls. When changing task mutations, preserve this recalc or progress bars desync.
- **Activity logs are written as a side effect** of nearly every mutation. New entries are prepended (newest first). IDs throughout use `Date.now()`.

**Navigation — no router.** Screens are switched via a `navState` (`{ screen, projectId?, taskId? }`) plus a manual `navStack` history. `navigateTo`/`navigateBack` manage the stack and trigger a ~450ms `isPreloading` flag that drives the `Preloader` overlay. `App.tsx`'s `renderScreen()` switch maps `navState.screen` to the screen component. Deep-linking to a task auto-opens the detail modal via the `navState.taskId` interception block in `AppContent`.

**Screens vs. modals.** Top-level screens (`Dashboard`, `Projects`, `ProjectDetail`, `TeamMembers`, `Settings`, `Login`) live in `src/components/` and are routed by `renderScreen`. Modals (`TaskFormModal`, `TaskDetailModal`) are controlled by local state in `AppContent` and rendered in an `AnimatePresence` overlay layer. `ProjectDetail` hosts the `KanbanBoard` / `ListView` task views.

**Types — `src/types.ts`.** Single source of truth for the domain model (`Task`, `Project`, `User`, `Comment`, `ActivityLog`) and the `TaskStatus`/`TaskPriority`/`Screen` string-literal unions. `TaskStatus` ordering (`Backlog → To Do → In Progress → Review → Done`) defines Kanban columns.

**Styling.** Tailwind CSS v4 via `@tailwindcss/vite` (configured in CSS, not a JS config). Three themes — Light / Dark / Cosmic — are CSS-variable based: `src/index.css` defines `:root`, `.dark-theme`, `.cosmic-theme` token sets, and the theme class is toggled on `document.documentElement` from `settings.theme`. Use the `theme-bg` / `theme-text-*` utility classes and CSS vars rather than hardcoding colors. Animations use `motion/react`; icons use `lucide-react`.

**Import alias.** `@/*` resolves to the repo root (configured in both `tsconfig.json` and `vite.config.ts`).

## Conventions

- Do not modify the HMR/file-watching logic in `vite.config.ts` — it is intentionally gated on `DISABLE_HMR` for the AI Studio agent-edit environment.
