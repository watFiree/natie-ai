import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  workosUserId: z.string(),
  email: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const StatusResponseSchema = z.object({
  user: UserSchema.nullable(),
});

export const CallbackQuerySchema = z.object({
  code: z.string().optional(),
});

export const RedirectResponseSchema = z.void().describe('Redirect');
