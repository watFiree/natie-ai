import { z } from 'zod';

export const TodoAppAccountResponseSchema = z.object({
  connected: z.boolean(),
  provider: z.string().optional(),
});

export const SuccessResponseSchema = z.object({
  success: z.boolean(),
});

export const OAuthCallbackQuerySchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
});

export const RedirectResponseSchema = z.void().describe('Redirect');
