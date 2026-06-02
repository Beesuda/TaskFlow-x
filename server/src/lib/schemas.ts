import { z } from 'zod';

// Literal unions mirroring src/types.ts on the frontend.
export const taskStatusSchema = z.enum(['Backlog', 'To Do', 'In Progress', 'Review', 'Done']);
export const taskPrioritySchema = z.enum(['Low', 'Medium', 'High']);
export const themeSchema = z.enum(['Light', 'Dark', 'Cosmic']);

export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;

// nullable assignee accepts a number or null (Unassigned).
const assigneeId = z.number().int().nullable();

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.string().min(1).optional(),
});

export const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(''),
  category: z.string().optional(),
  dueDate: z.string().min(1),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().nullable().optional(),
  dueDate: z.string().min(1).optional(),
});

export const createTaskSchema = z.object({
  projectId: z.number().int(),
  title: z.string().min(1),
  description: z.string().default(''),
  status: taskStatusSchema.default('To Do'),
  priority: taskPrioritySchema,
  assigneeId: assigneeId.default(null),
  dueDate: z.string().min(1),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  assigneeId: assigneeId.optional(),
  dueDate: z.string().min(1).optional(),
});

export const createCommentSchema = z.object({
  message: z.string().min(1),
});

export const updateSettingsSchema = z.object({
  profileName: z.string().min(1).optional(),
  profileEmail: z.string().email().optional(),
  theme: themeSchema.optional(),
  notifications: z
    .object({
      email: z.boolean().optional(),
      browser: z.boolean().optional(),
      weeklyDigest: z.boolean().optional(),
    })
    .optional(),
});
