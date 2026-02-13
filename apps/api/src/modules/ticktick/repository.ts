import { PrismaClient } from '../../../prisma/generated/prisma/client';
import type { TickTickTokens } from './consts';
import { encrypt, decrypt } from '../../common/encryption';

export type TickTickAccountData = {
  userId: string;
  tokens: TickTickTokens;
};

export class TickTickAccountRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async upsert(data: TickTickAccountData) {
    const { userId, tokens } = data;

    const expiresAt = tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000)
      : null;

    return this.prisma.tickTickAccount.upsert({
      where: { userId },
      update: {
        accessToken: encrypt(tokens.access_token),
        refreshToken: encrypt(tokens.refresh_token ?? ''),
        expiresAt,
        scope: tokens.scope ?? null,
      },
      create: {
        userId,
        accessToken: encrypt(tokens.access_token),
        refreshToken: encrypt(tokens.refresh_token ?? ''),
        expiresAt,
        scope: tokens.scope ?? null,
      },
    });
  }

  async findByUserId(userId: string) {
    const account = await this.prisma.tickTickAccount.findUnique({
      where: { userId },
    });

    if (!account) {
      return null;
    }

    return {
      ...account,
      accessToken: decrypt(account.accessToken),
      refreshToken: decrypt(account.refreshToken),
    };
  }

  async delete(userId: string) {
    return this.prisma.tickTickAccount.delete({
      where: { userId },
    });
  }

  async updateTokens(userId: string, tokens: TickTickTokens) {
    const expiresAt = tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000)
      : null;

    return this.prisma.tickTickAccount.update({
      where: { userId },
      data: {
        accessToken: encrypt(tokens.access_token),
        refreshToken: encrypt(tokens.refresh_token ?? ''),
        expiresAt,
        scope: tokens.scope ?? null,
      },
    });
  }
}
