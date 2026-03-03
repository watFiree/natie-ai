import { PrismaClient } from '../../../prisma/generated/prisma/client';
import type { GoogleTokens } from '../google/consts';
import { encrypt, decrypt } from '../../common/encryption';

export type CalendarAccountData = {
  userId: string;
  email: string;
  tokens: GoogleTokens;
};

export class CalendarAccountRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async upsert(data: CalendarAccountData) {
    const { userId, email, tokens } = data;

    return this.prisma.calendarAccount.upsert({
      where: { userId_email: { userId, email } },
      update: {
        accessToken: encrypt(tokens.access_token ?? ''),
        refreshToken: encrypt(tokens.refresh_token ?? ''),
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
      create: {
        userId,
        email,
        provider: 'Google',
        accessToken: encrypt(tokens.access_token ?? ''),
        refreshToken: encrypt(tokens.refresh_token ?? ''),
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
    });
  }

  async findByUserId(userId: string) {
    const accounts = await this.prisma.calendarAccount.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return accounts.map((account) => ({
      ...account,
      accessToken: decrypt(account.accessToken),
      refreshToken: decrypt(account.refreshToken),
    }));
  }

  async findByUserAndEmail(userId: string, email: string) {
    const account = await this.prisma.calendarAccount.findUnique({
      where: { userId_email: { userId, email } },
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

  async delete(userId: string, email: string) {
    return this.prisma.calendarAccount.delete({
      where: { userId_email: { userId, email } },
    });
  }

  async updateTokens(userId: string, email: string, tokens: GoogleTokens) {
    return this.prisma.calendarAccount.update({
      where: { userId_email: { userId, email } },
      data: {
        accessToken: encrypt(tokens.access_token ?? ''),
        refreshToken: encrypt(tokens.refresh_token ?? ''),
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
    });
  }
}
