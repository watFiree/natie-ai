import { PrismaClient } from '../../../prisma/generated/prisma/client';
import type { TickTickTokenResponse } from '../ticktick/consts';
import { encrypt, decrypt } from '../../common/encryption';

export type TodoAppAccountData = {
  userId: string;
  tokens: TickTickTokenResponse;
};

export class TodoAppAccountRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async upsert(data: TodoAppAccountData) {
    const { userId, tokens } = data;
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    return this.prisma.todoAppAccount.upsert({
      where: { userId },
      update: {
        accessToken: encrypt(tokens.access_token),
        refreshToken: encrypt(tokens.refresh_token ?? ''),
        expiresAt,
      },
      create: {
        userId,
        provider: 'TickTick',
        accessToken: encrypt(tokens.access_token),
        refreshToken: encrypt(tokens.refresh_token ?? ''),
        expiresAt,
      },
    });
  }

  async findByUserId(userId: string) {
    const account = await this.prisma.todoAppAccount.findUnique({
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
    return this.prisma.todoAppAccount.delete({
      where: { userId },
    });
  }

  async updateTokens(userId: string, tokens: TickTickTokenResponse) {
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    return this.prisma.todoAppAccount.update({
      where: { userId },
      data: {
        accessToken: encrypt(tokens.access_token),
        refreshToken: encrypt(tokens.refresh_token ?? ''),
        expiresAt,
      },
    });
  }
}
