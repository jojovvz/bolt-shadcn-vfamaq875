import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const profileSchema = z.object({
  full_name: z.string().min(2),
  avatar_url: z.string().url().optional().nullable(),
});

export const lessonSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  youtube_url: z.string().url(),
  module_id: z.number(),
  order_index: z.number(),
});

export const moduleSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  category_id: z.number(),
  order_index: z.number(),
  cover_url: z.string().url().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});