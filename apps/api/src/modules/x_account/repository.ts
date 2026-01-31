import { PrismaClient } from '../../../prisma/generated/prisma/client';
import { UpsertXAccountData } from './consts';
import { encrypt, decrypt } from '../../common/encryption';

export class XAccountRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async upsert(data: UpsertXAccountData) {
    const { userId, authToken, ct0 } = data;

    return this.prisma.xAccount.upsert({
      where: { userId },
      update: {
        authToken: encrypt(authToken),
        ct0: encrypt(ct0),
      },
      create: {
        userId,
        authToken: encrypt(authToken),
        ct0: encrypt(ct0),
      },
    });
  }

  async findByUserId(userId: string) {
    const account = await this.prisma.xAccount.findUnique({
      where: { userId },
    });

    if (!account) {
      return null;
    }

    return {
      ...account,
      authToken: decrypt(account.authToken),
      ct0: decrypt(account.ct0),
    };
  }

  async delete(userId: string) {
    return this.prisma.xAccount.delete({
      where: { userId },
    });
  }
}
