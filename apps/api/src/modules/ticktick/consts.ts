import { z } from 'zod';

export const TICKTICK_AUTH_URL = 'https://ticktick.com/oauth/authorize';
export const TICKTICK_TOKEN_URL = 'https://ticktick.com/oauth/token';
export const TICKTICK_SCOPES = 'tasks:read tasks:write';

export const TickTickTokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  scope: z.string(),
  refresh_token: z.string().optional(),
});

export type TickTickTokenResponse = z.infer<typeof TickTickTokenResponseSchema>;
