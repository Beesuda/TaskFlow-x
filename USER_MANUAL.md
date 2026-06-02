<p align="center">
  <img src="https://img.shields.io/badge/TaskFlow-User%20Manual-2563EB?style=for-the-badge" alt="TaskFlow User Manual" />
</p>

<h1 align="center">📘 TaskFlow — User Manual</h1>

<p align="center"><em>A complete, step-by-step guide to using the TaskFlow team task-management workspace.</em></p>

---

## 📑 Table of Contents

1. [Introduction](#1-introduction)
2. [Getting Started](#2-getting-started)
3. [Signing In](#3-signing-in)
4. [The Workspace Layout](#4-the-workspace-layout)
5. [Dashboard](#5-dashboard)
6. [Projects](#6-projects)
7. [Inside a Project](#7-inside-a-project)
8. [Working with Tasks](#8-working-with-tasks)
9. [Task Details & Discussion](#9-task-details--discussion)
10. [Team Members](#10-team-members)
11. [Settings & Themes](#11-settings--themes)
12. [Activity & Audit Trail](#12-activity--audit-trail)
13. [Tips & Shortcuts](#13-tips--shortcuts)
14. [Frequently Asked Questions](#14-frequently-asked-questions)
15. [Troubleshooting](#15-troubleshooting)
16. [Glossary](#16-glossary)

---

## 1. Introduction

**TaskFlow** is a collaborative workspace for planning and tracking your team's work. It helps you:

- Organize work into **projects**.
- Break projects into **tasks** with a status, priority, assignee, and due date.
- Track progress visually on a **Kanban board** or a sortable **list**.
- Discuss work through **per-task comments**.
- See team workload and a complete **activity history**.

> **Note on data:** In the standard build, TaskFlow stores everything **in your browser** (local storage). Your data stays on the device/browser you use and is not shared between machines. Clearing your browser data resets the app to its demo state.

---

## 2. Getting Started

You can open TaskFlow in one of these ways, depending on how it was set up for you:

| Setup | Address |
|---|---|
| Local development | `http://localhost:3000` |
| Docker (containerized) | `http://localhost:8090` |

Open the address in any modern browser (Chrome, Edge, Firefox, or Safari). No installation is needed on your side — TaskFlow runs entirely in the browser.

---

## 3. Signing In

When you open TaskFlow you'll see the **Sign In** screen.

**To sign in:**

1. Enter your **email address**.
2. Enter your **password**.
3. *(Optional)* Tick **Remember Me** to stay signed in.
4. Click **Sign In to Dashboard**.

**Demo quick login:** The sign-in screen has **Quick SignIn** buttons (e.g. *Marcus (PM)* and *Sarah (Designer)*) that auto-fill a demo account so you can explore immediately.

**Demo accounts available:**

| Name | Email | Role |
|---|---|---|
| Marcus Vance | `marcus@example.com` | Project Manager |
| Sarah Johnson | `sarah@example.com` | Lead Designer |
| Michael Chen | `michael@example.com` | Product Owner |
| Elena Rostova | `elena@example.com` | Frontend Developer |
| David Kim | `david@example.com` | Backend Engineer |

**Helpful details:**

- 👁️ Use the **eye icon** in the password field to show/hide your password.
- If you leave a field empty or enter an invalid email, an inline message tells you what to fix.
- **Forgot Password?** displays a recovery notice (demo behavior).

> 💡 In the browser-only build, the password is not checked — any value works, and an unrecognized email signs you in as **Marcus Vance** by default.

---

## 4. The Workspace Layout

After signing in, every screen shares the same frame:

- **Navigation sidebar (left):** switch between **Dashboard, Projects, Team,** and **Settings**. It also has the **+ New Task** quick-create button and your profile/sign-out.
- **Main area (center):** the content of the screen you're on.
- **Footer:** app version and build info.

On smaller screens the navigation collapses to a mobile-friendly bar.

**Moving around:**

- Click a sidebar item to change screens.
- Click into a project or task to drill down.
- Use your browser's flow plus in-app **back** controls (e.g. the ◀ chevron on a project) to return.

---

## 5. Dashboard

The **Dashboard** is your home screen and team snapshot. It shows:

- **Welcome banner** — greets you and tells you how many unresolved tasks are assigned to you. The **Explore Projects** button jumps to the Projects screen.
- **Metric tiles:**
  - **Active Projects** — total number of projects.
  - **Total Board Tasks** — total number of tasks.
  - **Tasks Completed** — count + completion percentage.
  - **In Progress Work** — tasks currently in progress.
- **Active Workspaces** — project cards with progress bars; click one to open it.
- **Upcoming Deadlines** — the nearest due, not-yet-done tasks; click to open a task.
- **My Tasks** — your assigned, unfinished tasks; click to open.
- **Recent Activity** — the latest changes across the team.

> Click any project card or task row on the Dashboard to navigate straight to it.

---

## 6. Projects

The **Projects** screen lists every workspace.

**Find a project:**

- **Search** by name or description using the search box.
- **Filter by category** using the category chips/dropdown (categories are derived from your projects).

**Each project card shows:**

- Category tag, name, and description.
- A **progress bar** (percentage of its tasks marked *Done*).
- Task counts (total / open / done).
- Avatars of team members assigned to its tasks.

**Open a project:** click its card.

### Creating a project

1. Click **New Project** (or the create button on the Projects screen).
2. Fill in:
   - **Name** *(required)*
   - **Description**
   - **Category**
   - **Due date** *(required)*
3. Click **Create**.

New projects start at **0% progress** and appear immediately in the list.

> If you leave the name or due date empty, you'll see: *"Project name and due date are required."*

---

## 7. Inside a Project

Opening a project shows its **detail screen** with a header (name, due date, progress) and two ways to view tasks.

### Switching views

Use the toggle to switch between:

- **🔲 Board (Kanban)** — tasks as cards in status columns.
- **☰ List** — tasks in a sortable table.

### Status columns (Kanban order)

`Backlog → To Do → In Progress → Review → Done`

The header shows live counts for each status.

### Searching & filtering within a project

Open the **filters panel** to narrow the visible tasks by:

- **Search** text (matches task title/description),
- **Status**,
- **Priority**,
- **Assignee**.

Use **Reset** (↺) to clear search and filters.

---

## 8. Working with Tasks

### Creating a task

There are two ways:

1. **Quick create:** click **+ New Task** in the sidebar. (If you're inside a project, the task is added to that project; otherwise it defaults to the first project.)
2. **From a board column:** click the **+** on a Kanban column to create a task pre-set to that status.

Fill in the **Create New Task** form:

| Field | Required | Notes |
|---|---|---|
| **Title** | ✅ | Short name of the task |
| **Description** | — | Detailed criteria / context |
| **Column Status** | — | Backlog / To Do / In Progress / Review / Done |
| **Assignee** | — | A team member, or *Unassigned* |
| **Priority** | ✅ | Low / Medium / High |
| **Due Date** | ✅ | Calendar picker |

Click **Create Task**. Missing required fields are highlighted with inline messages.

### Editing a task

- Open a task and choose **Edit Attributes**, **or**
- The same form opens pre-filled; change any field and click **Save Changes**.

### Moving a task between statuses

On the **Kanban board** you can:

- **Drag and drop** a task card into another column, **or**
- Use the **◀ / ▶ arrows** on a card to shift it to the previous/next status (handy on touch devices).

Moving a task updates project progress automatically and records an activity entry.

### Sorting in List view

In **List view**, click a column header to sort by **Title, Due Date, Priority,** or **Status**. Click again to reverse the order (ascending ↔ descending).

### Deleting a task

Open the task and click **Delete Ticket**. You'll be asked to confirm — this cannot be undone. Deleting a task also removes its comments.

---

## 9. Task Details & Discussion

Click any task to open the **Task Detail** view. It has two areas:

**Left — content & discussion**

- Status and priority badges, title, and full description.
- **Team Discussions:** the comment thread.
  - Type in the box and click the **send** button (or press Enter) to post.
  - Your own comments are visually highlighted.
  - Empty comments are rejected with *"Comment cannot be empty."*

**Right — details & history**

- **Assignee**, **Due Date**, and the task's **record number** (`#id`).
- **Ticket Audit History:** every change made to this task, newest first.
- **Action buttons:** **Edit Attributes** and **Delete Ticket**.

Close the panel with the **✕** button or by clicking outside it.

> 💬 Every comment you post is also recorded in the activity history with a short preview.

---

## 10. Team Members

The **Team** screen lists everyone in the workspace.

- **Search** by name, role, or email.
- Each member card shows their avatar, name, role, and **task statistics**:
  - **Total** assigned tasks,
  - **Active** (not done),
  - **Completed**.
- Click a member's tasks shortcut to jump to **Projects** with that person's tasks pre-filtered.

---

## 11. Settings & Themes

Open **Settings** from the sidebar to personalize your workspace.

### Appearance (themes)

Choose one of three visual themes — the change applies instantly:

| Theme | Look |
|---|---|
| ☀️ **Warm Light** | Clean, high-contrast light interface |
| 🌙 **Cool Dark** | Eye-friendly dark navy |
| ✨ **Deep Cosmic** | Indigo/purple dark variant |

### Profile

Update your **display name** and **contact email**, then click **Save Preferences**. A success message confirms the change. Your account role is shown as read-only.

### Notifications

Toggle the notification preferences:

- **Email Digests** — updates when tasks change columns.
- **Assignment Alerts** — browser notifications in the active tab.
- **Weekly Insights** — a weekly summary.

Each toggle saves immediately.

> Your theme and preferences are remembered the next time you open TaskFlow on the same browser.

---

## 12. Activity & Audit Trail

TaskFlow keeps a running history so nothing gets lost:

- **Recent Activity** on the Dashboard shows team-wide changes.
- **Ticket Audit History** inside a task shows that task's full timeline.

Recorded events include: signing in/out, creating/editing tasks and projects, moving a task between statuses, (re)assigning, changing priority, commenting, and deleting. Each entry shows **who**, **what**, and **when**.

---

## 13. Tips & Shortcuts

- **Fastest task entry:** the sidebar **+ New Task** works from anywhere.
- **Open a task from anywhere:** click it on the Dashboard (Upcoming Deadlines / My Tasks), the board, or the list.
- **Quick status changes:** drag cards on the board, or use the ◀ ▶ arrows.
- **Find anything:** use the search box on Projects, inside a project, or on the Team screen.
- **Theme on the fly:** switch Light/Dark/Cosmic in Settings — it applies instantly.
- **Reset a project's filters:** the ↺ reset button clears search + all filters at once.

---

## 14. Frequently Asked Questions

**Q: Where is my data stored?**
In the standard build, in your browser's local storage. It is per-browser and per-device, and isn't synced elsewhere.

**Q: How is "progress" calculated?**
A project's progress is the percentage of its tasks marked **Done**. It updates automatically as you add, move, or delete tasks.

**Q: Can I recover a deleted task?**
No. Deletion is permanent and also removes the task's comments. You're always asked to confirm first.

**Q: What happens if I sign in with an unknown email?**
In the browser-only build you're signed in as the default demo user (Marcus Vance).

**Q: Can multiple people use it together in real time?**
The standard build is single-browser. A backend API exists for a future networked version, but the app currently runs locally per browser.

---

## 15. Troubleshooting

| Problem | What to do |
|---|---|
| The page won't load | Confirm you're using the right address (`:3000` for dev or `:8090` for Docker) and that the app is running. |
| I see old or wrong data | Your browser may have cached previous data. Clear the site's local storage in your browser's settings to reset. |
| My changes didn't save | Make sure you clicked **Save**/**Create**; required fields (marked *) must be filled. |
| A task won't move on the board | Drop it fully inside the target column, or use the ◀ ▶ arrows on the card. |
| I can't find a task | Clear search/filters with the ↺ reset button — it may be filtered out of the current view. |
| Theme/profile didn't stick | Settings persist per browser; using a different browser/device starts fresh. |

---

## 16. Glossary

| Term | Meaning |
|---|---|
| **Project / Workspace** | A container that groups related tasks. |
| **Task / Ticket** | A single unit of work with a status, priority, assignee, and due date. |
| **Status** | Where a task sits in the workflow: Backlog, To Do, In Progress, Review, or Done. |
| **Priority** | Importance level: Low, Medium, or High. |
| **Assignee** | The team member responsible for a task (or *Unassigned*). |
| **Kanban board** | A visual board with columns for each status. |
| **List view** | A sortable table of tasks. |
| **Progress** | Percentage of a project's tasks that are Done. |
| **Activity / Audit history** | The recorded log of who changed what and when. |

---

<p align="center"><sub>TaskFlow Workspace · User Manual · See <a href="README.md">README.md</a> for technical & setup details.</sub></p>
