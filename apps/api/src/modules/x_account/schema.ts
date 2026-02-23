import { z } from 'zod';

export const SaveXAccountSchema = z.object({
  authToken: z.string(),
  ct0: z.string(),
});

export const XAccountResponseSchema = z.object({
  id: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const DeleteXAccountResponseSchema = z.object({
  success: z.boolean(),
});
