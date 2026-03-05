import {
  TICKTICK_AUTH_URL,
  TICKTICK_TOKEN_URL,
  TICKTICK_SCOPES,
  TickTickTokenResponseSchema,
  type TickTickTokenResponse,
} from './consts';

export class TickTickOAuthService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor() {
    const clientId = process.env.TICKTICK_CLIENT_ID;
    const clientSecret = process.env.TICKTICK_CLIENT_SECRET;
    const redirectUri = process.env.TICKTICK_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error(
        'Missing TickTick OAuth env vars: TICKTICK_CLIENT_ID, TICKTICK_CLIENT_SECRET, TICKTICK_REDIRECT_URI'
      );
    }

    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
  }

  generateRedirectUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      scope: TICKTICK_SCOPES,
      state,
      redirect_uri: this.redirectUri,
      response_type: 'code',
    });

    return `${TICKTICK_AUTH_URL}?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<TickTickTokenResponse> {
    const body = new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      redirect_uri: this.redirectUri,
    });

    const credentials = Buffer.from(
      `${this.clientId}:${this.clientSecret}`
    ).toString('base64');

    const response = await fetch(TICKTICK_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `TickTick token exchange failed (${response.status}): ${text}`
      );
    }

    const json: unknown = await response.json();
    const result = TickTickTokenResponseSchema.safeParse(json);
    if (!result.success) {
      throw new Error(
        `Invalid TickTick token response: ${result.error.message}`
      );
    }

    return result.data;
  }

  async refreshAccessToken(
    refreshToken: string
  ): Promise<TickTickTokenResponse> {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    const credentials = Buffer.from(
      `${this.clientId}:${this.clientSecret}`
    ).toString('base64');

    const response = await fetch(TICKTICK_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `TickTick token refresh failed (${response.status}): ${text}`
      );
    }

    const json: unknown = await response.json();
    const result = TickTickTokenResponseSchema.safeParse(json);
    if (!result.success) {
      throw new Error(
        `Invalid TickTick refresh response: ${result.error.message}`
      );
    }

    return result.data;
  }
}
