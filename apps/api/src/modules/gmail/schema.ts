import { z } from 'zod';

export const GmailProviderSchema = z.literal('gmail');

export const GmailAccountResponseSchema = z.object({
  email: z.string().email(),
  provider: GmailProviderSchema,
});

export const GmailAccountsResponseSchema = z.array(GmailAccountResponseSchema);

export const DeleteGmailAccountQuerySchema = z.object({
  email: z.string().email(),
});

export const SuccessResponseSchema = z.object({
  success: z.boolean(),
});

export const ErrorResponseSchema = z.object({
  error: z.string(),
});
