import type { Auth } from 'googleapis';
import type { CalendarAccountRepository } from './repository';
import { createOAuth2Client } from '../google/clientFactory';

export class CalendarOAuthService {
  private readonly oauth2ClientFactory: () => Auth.OAuth2Client;
  private readonly repository: CalendarAccountRepository;

  constructor(
    repository: CalendarAccountRepository,
    oauth2ClientFactory: () => Auth.OAuth2Client = createOAuth2Client
  ) {
    this.oauth2ClientFactory = oauth2ClientFactory;
    this.repository = repository;
  }

  async getAccountsByUserId(userId: string) {
    return this.repository.findByUserId(userId);
  }

  async getAccountByUserAndEmail(userId: string, email: string) {
    return this.repository.findByUserAndEmail(userId, email);
  }

  async deleteAccount(userId: string, email: string) {
    return this.repository.delete(userId, email);
  }

  async getEnsuredAccessToken(userId: string, email: string): Promise<string> {
    const account = await this.repository.findByUserAndEmail(userId, email);
    if (!account) throw new Error('Calendar account not found');

    const isExpired = account.expiresAt
      ? account.expiresAt.getTime() < Date.now() + 5 * 60 * 1000
      : true;

    if (isExpired && account.refreshToken) {
      const oauth2 = this.oauth2ClientFactory();
      oauth2.setCredentials({
        access_token: account.accessToken,
        refresh_token: account.refreshToken,
      });
      try {
        const { credentials } = await oauth2.refreshAccessToken();
        await this.repository.updateTokens(userId, email, credentials);
        if (!credentials.access_token) {
          throw new Error(
            `Calendar account ${email} needs to be reconnected. The authorization has not worked. Please remove and re-add this account.`
          );
        }
        return credentials.access_token;
      } catch (err) {
        const isInvalidGrant =
          typeof err === 'object' &&
          err !== null &&
          'message' in err &&
          typeof err.message === 'string' &&
          err.message.includes('invalid_grant');

        if (isInvalidGrant) {
          throw new Error(
            `Calendar account ${email} needs to be reconnected. The authorization has been revoked or expired. Please remove and re-add this account.`
          );
        }
        throw err;
      }
    }
    return account.accessToken;
  }
}
