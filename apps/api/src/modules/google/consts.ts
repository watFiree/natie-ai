import type { Auth } from 'googleapis';

export type GoogleTokens = Auth.Credentials;

export type IntegrationType = 'gmail' | 'calendar';

export type RedirectUrlOptions = {
  scopes: string[];
  state: string;
  accessType?: 'online' | 'offline';
  prompt?: 'none' | 'consent' | 'select_account';
  includeGrantedScopes?: boolean;
  loginHint?: string;
};

export const commonScopes = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/userinfo.email',
];

export const gmailScopes = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.labels',
];

export const calendarScopes = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
];

export const integrationConfig = {
  gmail: {
    scopes: [...commonScopes, ...gmailScopes],
    successParam: 'google=success',
    failedParam: 'google=failed',
    alreadyRegisteredParam: 'google=already_registered',
    frontendPath: '/app/email',
  },
  calendar: {
    scopes: [...commonScopes, ...calendarScopes],
    successParam: 'google_calendar=success',
    failedParam: 'google_calendar=failed',
    alreadyRegisteredParam: 'google_calendar=already_registered',
    frontendPath: '/app/calendar',
  },
} satisfies Record<IntegrationType, unknown>;
