import { z } from 'zod';

export const SaveXAccountSchema = z.object({
  authToken: z.string(),
  ct0: z.string(),
});
