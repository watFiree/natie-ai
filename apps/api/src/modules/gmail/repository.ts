import { PrismaClient } from '../../../prisma/generated/prisma/client';
import type { GoogleTokens } from './consts';
import { encrypt, decrypt } from '../../common/encryption';

export type GmailAccountData = {
  userId: string;
  email: string;
  tokens: GoogleTokens;
};

export class GmailAccountRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async upsert(data: GmailAccountData) {
    const { userId, email, tokens } = data;

    return this.prisma.gmailAccount.upsert({
      where: { userId_email: { userId, email } },
      update: {
        accessToken: encrypt(tokens.access_token ?? ''),
        refreshToken: encrypt(tokens.refresh_token ?? ''),
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
      create: {
        userId,
        email,
        accessToken: encrypt(tokens.access_token ?? ''),
        refreshToken: encrypt(tokens.refresh_token ?? ''),
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
    });
  }

  async findByUserId(userId: string) {
    const accounts = await this.prisma.gmailAccount.findMany({
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
    const account = await this.prisma.gmailAccount.findUnique({
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
    return this.prisma.gmailAccount.delete({
      where: { userId_email: { userId, email } },
    });
  }

  async updateTokens(userId: string, email: string, tokens: GoogleTokens) {
    return this.prisma.gmailAccount.update({
      where: { userId_email: { userId, email } },
      data: {
        accessToken: encrypt(tokens.access_token ?? ''),
        refreshToken: encrypt(tokens.refresh_token ?? ''),
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
    });
  }
}
