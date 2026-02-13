import type { TickTickTokens, TickTickRedirectUrlOptions } from './consts';
import {
  TICKTICK_AUTH_URL,
  TICKTICK_TOKEN_URL,
  TICKTICK_API_BASE_URL,
} from './consts';
import type { TickTickAccountRepository } from './repository';

export class TickTickOAuthService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly repository: TickTickAccountRepository;

  constructor(
    clientId: string,
    clientSecret: string,
    redirectUri: string,
    repository: TickTickAccountRepository
  ) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
    this.repository = repository;
  }

  generateRedirectUrl(options: TickTickRedirectUrlOptions): string {
    const { scopes, state } = options;

    const params = new URLSearchParams({
      client_id: this.clientId,
      scope: scopes.join(' '),
      state,
      redirect_uri: this.redirectUri,
      response_type: 'code',
    });

    return `${TICKTICK_AUTH_URL}?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<TickTickTokens> {
    if (!code) throw new Error('Missing authorization code');

    const basicAuth = Buffer.from(
      `${this.clientId}:${this.clientSecret}`
    ).toString('base64');

    const response = await fetch(TICKTICK_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
      }).toString(),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Failed to exchange code for tokens: ${response.status} ${errorBody}`
      );
    }

    const tokens: TickTickTokens = await response.json();
    return tokens;
  }

  async saveAccount(userId: string, tokens: TickTickTokens) {
    return this.repository.upsert({
      userId,
      tokens,
    });
  }

  async getAccountByUserId(userId: string) {
    return this.repository.findByUserId(userId);
  }

  async deleteAccount(userId: string) {
    return this.repository.delete(userId);
  }

  async getEnsuredAccessToken(userId: string): Promise<string> {
    const account = await this.repository.findByUserId(userId);
    if (!account) throw new Error('TickTick account not found');

    // Check if token is expired (with 5 min buffer)
    const isExpired = account.expiresAt
      ? account.expiresAt.getTime() < Date.now() + 5 * 60 * 1000
      : false;

    if (isExpired && account.refreshToken) {
      const newTokens = await this.refreshAccessToken(account.refreshToken);
      await this.repository.updateTokens(userId, newTokens);
      return newTokens.access_token;
    }

    return account.accessToken;
  }

  private async refreshAccessToken(
    refreshToken: string
  ): Promise<TickTickTokens> {
    const basicAuth = Buffer.from(
      `${this.clientId}:${this.clientSecret}`
    ).toString('base64');

    const response = await fetch(TICKTICK_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }).toString(),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Failed to refresh token: ${response.status} ${errorBody}`
      );
    }

    const tokens: TickTickTokens = await response.json();
    return tokens;
  }
}

/**
 * Helper to make authenticated requests to the TickTick API.
 */
export async function ticktickApiRequest(
  accessToken: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${TICKTICK_API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  return response;
}
