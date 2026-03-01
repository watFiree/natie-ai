import { z } from 'zod';

export const SaveXAccountSchema = z.object({
  authToken: z.string(),
  ct0: z.string(),
});

export const XAccountResponseSchema = z.object({
  id: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const DeleteXAccountResponseSchema = z.object({
  success: z.boolean(),
});
