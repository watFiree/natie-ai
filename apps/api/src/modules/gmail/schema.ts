import { z } from 'zod';

export const GmailProviderSchema = z.literal('gmail');

export const GmailAccountResponseSchema = z.object({
  email: z.string().email(),
  provider: GmailProviderSchema,
});

export const GmailAccountsResponseSchema = z.array(GmailAccountResponseSchema);

export const OAuthCallbackQuerySchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
});

export const DeleteGmailAccountQuerySchema = z.object({
  email: z.string().email(),
});

export const SuccessResponseSchema = z.object({
  success: z.boolean(),
});

export const RedirectResponseSchema = z.void().describe('Redirect');
