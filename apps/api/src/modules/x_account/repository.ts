import { PrismaClient } from '../../../prisma/generated/prisma/client';
import { UpsertXAccountData } from './consts';

export class XAccountRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async upsert(data: UpsertXAccountData) {
    const { userId, authToken, ct0 } = data;

    return this.prisma.xAccount.upsert({
      where: { userId },
      update: {
        authToken,
        ct0,
      },
      create: {
        userId,
        authToken,
        ct0,
      },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.xAccount.findUnique({
      where: { userId },
    });
  }

  async delete(userId: string) {
    return this.prisma.xAccount.delete({
      where: { userId },
    });
  }
}
