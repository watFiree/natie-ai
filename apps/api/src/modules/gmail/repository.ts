import { PrismaClient } from '../../../prisma/generated/prisma/client';
import type { GoogleTokens } from './consts';

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
      where: { email },
      update: {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
      create: {
        userId,
        email,
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.gmailAccount.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.gmailAccount.findUnique({
      where: { email },
    });
  }

  async delete(email: string) {
    return this.prisma.gmailAccount.delete({
      where: { email },
    });
  }

  async updateTokens(email: string, tokens: GoogleTokens) {
    return this.prisma.gmailAccount.update({
      where: { email },
      data: {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
    });
  }
}
