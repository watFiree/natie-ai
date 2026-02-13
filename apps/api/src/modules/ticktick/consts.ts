export type TickTickTokens = {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
};

export type TickTickRedirectUrlOptions = {
  scopes: string[];
  state: string;
};

export const TICKTICK_SCOPES = [
  'tasks:write',
  'tasks:read',
];

export const TICKTICK_AUTH_URL = 'https://ticktick.com/oauth/authorize';
export const TICKTICK_TOKEN_URL = 'https://ticktick.com/oauth/token';
export const TICKTICK_API_BASE_URL = 'https://api.ticktick.com/open/v1';
