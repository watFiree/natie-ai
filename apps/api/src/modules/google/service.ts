import { google, type Auth } from 'googleapis';
import type { RedirectUrlOptions, GoogleTokens } from './consts';
import { createOAuth2Client } from './clientFactory';

export class GoogleOAuthService {
  private readonly oauth2: Auth.OAuth2Client;

  constructor(
    oauth2ClientFactory: () => Auth.OAuth2Client = createOAuth2Client
  ) {
    this.oauth2 = oauth2ClientFactory();
  }

  generateRedirectUrl(options: RedirectUrlOptions): string {
    const {
      scopes,
      state,
      accessType = 'offline',
      prompt = 'consent',
      includeGrantedScopes = true,
      loginHint,
    } = options;

    return this.oauth2.generateAuthUrl({
      scope: scopes,
      state,
      access_type: accessType,
      prompt,
      include_granted_scopes: includeGrantedScopes,
      ...(loginHint ? { login_hint: loginHint } : {}),
    });
  }

  async exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
    if (!code) throw new Error('Missing authorization code');

    const { tokens } = await this.oauth2.getToken(code);
    return tokens;
  }

  async getEmailFromIdToken(tokens: GoogleTokens): Promise<string | null> {
    if (!tokens.id_token) return null;

    const ticket = await this.oauth2.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    return payload?.email ?? null;
  }

  async getUserEmail(): Promise<string | null> {
    const oauth2 = google.oauth2({ auth: this.oauth2, version: 'v2' });
    const { data } = await oauth2.userinfo.get();
    return data.email ?? null;
  }
}
