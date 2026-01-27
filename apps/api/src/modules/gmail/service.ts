import { google, Auth } from 'googleapis';
import type { RedirectUrlOptions, GoogleTokens } from './consts';
import type { GmailAccountRepository } from './repository';

export class GmailOAuthService {
  private readonly oauth2: Auth.OAuth2Client;
  private readonly repository: GmailAccountRepository;

  constructor(
    oauth2Client: Auth.OAuth2Client,
    repository: GmailAccountRepository
  ) {
    this.oauth2 = oauth2Client;
    this.repository = repository;
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

  async getUserEmail(): Promise<string | null> {
    const oauth2 = google.oauth2({ auth: this.oauth2, version: 'v2' });
    const { data } = await oauth2.userinfo.get();
    return data.email ?? null;
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

  async saveAccount(
    userId: string,
    email: string,
    tokens: GoogleTokens
  ) {
    return this.repository.upsert({
      userId,
      email,
      tokens,
    });
  }

  async getAccountsByUserId(userId: string) {
    return this.repository.findByUserId(userId);
  }

  async getAccountByEmail(email: string) {
    return this.repository.findByEmail(email);
  }

  async deleteAccount(email: string) {
    return this.repository.delete(email);
  }

  async getEnsuredAccessToken(userId: string, email: string): Promise<string> {
    const account = await this.repository.findByEmail(email);
    if (!account || account.userId !== userId) throw new Error('Account not found');

    const isExpired = account.expiresAt
      ? account.expiresAt.getTime() < Date.now() + 5 * 60 * 1000
      : true;

    if (isExpired && account.refreshToken) {
      const { credentials } = await this.oauth2.refreshAccessToken();
      await this.repository.updateTokens(email, credentials);
      this.oauth2.setCredentials(credentials);
    }

    return account.accessToken;
  }
}
