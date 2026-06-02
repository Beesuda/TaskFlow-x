import { z } from 'zod';

// Literal unions mirroring src/types.ts on the frontend.
export const taskStatusSchema = z.enum(['Backlog', 'To Do', 'In Progress', 'Review', 'Done']);
export const taskPrioritySchema = z.enum(['Low', 'Medium', 'High']);
export const themeSchema = z.enum(['Light', 'Dark', 'Cosmic']);

export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;

// nullable assignee accepts a number or null (Unassigned).
const assigneeId = z.number().int().nullable();

// Shared bounded string helpers — upper bounds reject abusive/oversized input
// while staying well above any legitimate UI value.
const shortText = (min = 1) => z.string().trim().min(min).max(120);
const longText = z.string().max(5000);
const email = z.string().trim().email().max(254);
const dateStr = z.string().trim().min(1).max(40);

export const loginSchema = z.object({
  email,
  password: z.string().min(1).max(200),
});

export const registerSchema = z.object({
  name: shortText(),
  email,
  password: z.string().min(8).max(200),
  role: shortText().optional(),
});

export const createProjectSchema = z.object({
  name: shortText(),
  description: longText.default(''),
  category: shortText().optional(),
  dueDate: dateStr,
});

export const updateProjectSchema = z.object({
  name: shortText().optional(),
  description: longText.optional(),
  category: shortText().nullable().optional(),
  dueDate: dateStr.optional(),
});

export const createTaskSchema = z.object({
  projectId: z.number().int(),
  title: shortText(),
  description: longText.default(''),
  status: taskStatusSchema.default('To Do'),
  priority: taskPrioritySchema,
  assigneeId: assigneeId.default(null),
  dueDate: dateStr,
});

export const updateTaskSchema = z.object({
  title: shortText().optional(),
  description: longText.optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  assigneeId: assigneeId.optional(),
  dueDate: dateStr.optional(),
});

export const createCommentSchema = z.object({
  message: z.string().trim().min(1).max(2000),
});

export const updateSettingsSchema = z.object({
  profileName: shortText().optional(),
  profileEmail: email.optional(),
  theme: themeSchema.optional(),
  notifications: z
    .object({
      email: z.boolean().optional(),
      browser: z.boolean().optional(),
      weeklyDigest: z.boolean().optional(),
    })
    .optional(),
});
