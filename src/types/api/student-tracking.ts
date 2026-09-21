import { z } from 'zod';

export const taskProgressSchema = z.object({
  id: z.string(),
  routineId: z.string(),
  routineTitle: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  position: z.number(),
  completed: z.boolean(),
  completedAt: z.string().nullable(),
});

export const routineProgressSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  category: z.string(),
  tasks: z.array(taskProgressSchema),
});

export const studentProgressSchema = z.object({
  student: z.object({ id: z.string(), name: z.string(), email: z.string() }),
  date: z.string(),
  routines: z.array(routineProgressSchema),
  totals: z.object({ tasks: z.number(), completed: z.number(), pending: z.number(), progressPercent: z.number() }),
});

export const studentSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  roleCode: z.string(),
  routinesToday: z.number(),
  tasksToday: z.number(),
  completedToday: z.number(),
  progressPercent: z.number(),
});

export type StudentProgress = z.infer<typeof studentProgressSchema>;
export type StudentSummary = z.infer<typeof studentSummarySchema>;
export type TaskProgress = z.infer<typeof taskProgressSchema>;
