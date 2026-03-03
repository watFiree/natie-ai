import { google } from 'googleapis';

export type TokenProvider = (email: string) => Promise<string>;

export function createCalendarClient(token: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: token });
  return google.calendar({ version: 'v3', auth });
}
