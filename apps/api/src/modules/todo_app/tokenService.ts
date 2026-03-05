import type { TodoAppAccountRepository } from './repository';
import type { TickTickOAuthService } from '../ticktick/service';

export class TodoAppTokenService {
  constructor(
    private readonly repository: TodoAppAccountRepository,
    private readonly tickTickOAuthService: TickTickOAuthService
  ) {}

  async getEnsuredAccessToken(userId: string): Promise<string> {
    const account = await this.repository.findByUserId(userId);
    if (!account) {
      throw new Error('Todo app account not found');
    }

    const isExpired = account.expiresAt
      ? account.expiresAt.getTime() < Date.now() + 5 * 60 * 1000
      : true;

    if (isExpired && account.refreshToken) {
      try {
        const tokens =
          await this.tickTickOAuthService.refreshAccessToken(account.refreshToken);
        await this.repository.updateTokens(userId, tokens);
        return tokens.access_token;
      } catch (err) {
        const isInvalidGrant =
          typeof err === 'object' &&
          err !== null &&
          'message' in err &&
          typeof err.message === 'string' &&
          err.message.includes('invalid_grant');

        if (isInvalidGrant) {
          throw new Error(
            'Todo app account needs to be reconnected. The authorization has been revoked or expired. Please remove and re-add this account.'
          );
        }
        throw err;
      }
    }

    return account.accessToken;
  }
}
