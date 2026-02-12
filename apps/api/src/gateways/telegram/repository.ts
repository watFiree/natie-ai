import {
  PrismaClient,
  TelegramSettings,
} from '../../../prisma/generated/prisma/client';

export type CreateTelegramSettingsData = {
  userId: string;
  telegramUserId: string;
};

export class TelegramSettingsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async upsert(data: CreateTelegramSettingsData): Promise<TelegramSettings> {
    const { userId, telegramUserId } = data;

    return this.prisma.telegramSettings.upsert({
      where: { userId },
      update: { telegramUserId },
      create: { userId, telegramUserId },
    });
  }

  async findByUserId(userId: string): Promise<TelegramSettings | null> {
    return this.prisma.telegramSettings.findUnique({
      where: { userId },
    });
  }

  async findByTelegramUserId(
    telegramUserId: string
  ): Promise<TelegramSettings | null> {
    return this.prisma.telegramSettings.findUnique({
      where: { telegramUserId },
    });
  }

  async delete(userId: string): Promise<TelegramSettings> {
    return this.prisma.telegramSettings.delete({
      where: { userId },
    });
  }
}
