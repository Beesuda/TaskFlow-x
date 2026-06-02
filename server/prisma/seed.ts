import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Ported verbatim from the frontend src/data/mockData.ts so the seeded DB
// reproduces the demo dataset exactly (same integer IDs).
const users = [
  { id: 1, name: 'Sarah Johnson', email: 'sarah@example.com', avatar: 'SJ', role: 'Lead Designer' },
  { id: 2, name: 'Michael Chen', email: 'michael@example.com', avatar: 'MC', role: 'Product Owner' },
  { id: 3, name: 'Elena Rostova', email: 'elena@example.com', avatar: 'ER', role: 'Frontend Developer' },
  { id: 4, name: 'David Kim', email: 'david@example.com', avatar: 'DK', role: 'Backend Engineer' },
  { id: 5, name: 'Marcus Vance', email: 'marcus@example.com', avatar: 'MV', role: 'Project Manager' },
];

const projects = [
  { id: 1, name: 'Website Redesign', description: 'Modernizing the marketing website with fresh brand components, optimized landing pages, and interactive product demo previews.', dueDate: '2026-07-15', category: 'Design & Brand' },
  { id: 2, name: 'Mobile App Launch', description: 'Launching version 1.0 of our companion mobile applications in Google Play Store and Apple App Store, with core task syncing enabled.', dueDate: '2026-08-01', category: 'Engineering' },
  { id: 3, name: 'Q3 Marketing Strategy', description: 'Planning out digital marketing, sponsor events, newsletters, social campaigns, and influencer partnerships for our launch quarter.', dueDate: '2026-09-10', category: 'Growth & Marketing' },
];

const tasks = [
  { id: 101, projectId: 1, title: 'Create homepage wireframes', description: 'Design and draft high-fidelity homepage wireframes, optimizing layouts for conversion screens, newsletter Sign Ups, and CTAs.', status: 'In Progress', priority: 'High', assigneeId: 1, dueDate: '2026-06-05', createdAt: '2026-06-01T08:00:00Z' },
  { id: 102, projectId: 1, title: 'Review and finalize color palette', description: 'Assess initial feedback on contrast ratios, brand harmony, dark/light compliance, and accessibility standards for main text colors.', status: 'Review', priority: 'Medium', assigneeId: 2, dueDate: '2026-06-08', createdAt: '2026-06-01T09:30:00Z' },
  { id: 103, projectId: 1, title: 'Code responsive footer sections', description: 'Implement modern, fluid semantic footer elements in React, attaching correct legal, social, dynamic sitemap links and theme selector buttons.', status: 'To Do', priority: 'Low', assigneeId: 3, dueDate: '2026-06-12', createdAt: '2026-06-01T14:00:00Z' },
  { id: 104, projectId: 1, title: 'Audit accessibility criteria', description: 'Ensure text contrast and screen reader accessibility are perfect. Run lighthouse checks on early preview designs and record report audits.', status: 'Backlog', priority: 'Low', assigneeId: null, dueDate: '2026-06-20', createdAt: '2026-06-01T15:10:00Z' },
  { id: 105, projectId: 1, title: 'Export production vector assets', description: 'Slice SVG icons, logos, background gradients and compressed asset graphics. Store correctly in asset directory repositories.', status: 'Done', priority: 'Medium', assigneeId: 1, dueDate: '2026-06-02', createdAt: '2026-05-30T10:00:00Z' },
  { id: 201, projectId: 2, title: 'Setup Push Notification triggers', description: 'Write Firebase Cloud Messaging triggers and integrate background service listeners. Register devices, store security keys securely in backend env files.', status: 'In Progress', priority: 'High', assigneeId: 4, dueDate: '2026-06-15', createdAt: '2026-06-01T11:00:00Z' },
  { id: 202, projectId: 2, title: 'Implement OAuth sign-up views', description: 'Style clean, premium interactive buttons for Google Workspace, GitHub, and Apple login pathways inside user credentials frames.', status: 'To Do', priority: 'High', assigneeId: 3, dueDate: '2026-06-25', createdAt: '2026-06-01T13:45:00Z' },
  { id: 203, projectId: 2, title: 'Write offline database schemas', description: 'Configure clean SQL database schemas or key-value stores for client local cache sync when connection is temporarily unstable.', status: 'Done', priority: 'Medium', assigneeId: 4, dueDate: '2026-05-31', createdAt: '2026-05-28T09:00:00Z' },
  { id: 301, projectId: 3, title: 'Compile marketing budget outlines', description: 'Structure realistic budget distributions for product launch event, paid targeted search campaigns, organic articles, and sponsorships.', status: 'To Do', priority: 'High', assigneeId: 5, dueDate: '2026-06-10', createdAt: '2026-06-02T02:00:00Z' },
  { id: 302, projectId: 3, title: 'Create newsletter graphics', description: 'Draft 3 creative banner templates for the welcome email sequence, following brand layout rules and crisp typography hierarchies.', status: 'In Progress', priority: 'Medium', assigneeId: 1, dueDate: '2026-06-18', createdAt: '2026-06-02T02:20:00Z' },
];

const comments = [
  { id: 1, taskId: 101, userId: 2, message: 'Looks good so far. Can we try slightly deeper shadows under the main product hero cards to elevate them from the background?', createdAt: '2026-06-02T09:15:00Z' },
  { id: 2, taskId: 101, userId: 1, message: 'Updating based on feedback. Adding the requested visual separation and verifying accessibility constraints are still satisfied.', createdAt: '2026-06-02T10:20:00Z' },
  { id: 3, taskId: 201, userId: 5, message: 'Please coordinate with David to verify how keys are fetched so we do not expose secrets on client side logs.', createdAt: '2026-06-02T11:45:00Z' },
];

const activityLogs = [
  { id: 1, taskId: 101, projectId: 1, userId: 1, action: 'created', details: 'Created task "Create homepage wireframes"', createdAt: '2026-06-01T08:00:00Z' },
  { id: 2, taskId: 101, projectId: 1, userId: 1, action: 'changed_status', details: 'Moved task status to "In Progress"', createdAt: '2026-06-01T08:15:00Z' },
  { id: 3, taskId: 105, projectId: 1, userId: 1, action: 'changed_status', details: 'Marked "Export production vector assets" as Done', createdAt: '2026-06-02T01:10:00Z' },
  { id: 4, taskId: 301, projectId: 3, userId: 5, action: 'created', details: 'Created and assigned compilation task of marketing budget outlines', createdAt: '2026-06-02T02:00:00Z' },
];

async function main() {
  const seedPassword = process.env.SEED_PASSWORD || 'password123';
  const hash = await bcrypt.hash(seedPassword, 10);

  // Clear in FK-safe order.
  await prisma.activityLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.settings.deleteMany();
  await prisma.user.deleteMany();

  for (const u of users) {
    await prisma.user.create({
      data: { ...u, password: hash, settings: { create: {} } },
    });
  }

  await prisma.project.createMany({ data: projects });
  await prisma.task.createMany({ data: tasks });
  await prisma.comment.createMany({
    data: comments.map((c) => ({ ...c, createdAt: new Date(c.createdAt) })),
  });
  await prisma.activityLog.createMany({
    data: activityLogs.map((a) => ({ ...a, createdAt: new Date(a.createdAt) })),
  });

  console.log(
    `Seeded: ${users.length} users, ${projects.length} projects, ${tasks.length} tasks, ` +
      `${comments.length} comments, ${activityLogs.length} activity logs. ` +
      `All users share password "${seedPassword}".`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
