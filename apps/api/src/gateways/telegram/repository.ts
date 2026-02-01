import {
  PrismaClient,
  TelegramMessage,
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

export type CreateTelegramMessageData = {
  conversationId: string;
  type: 'human' | 'ai' | 'system' | 'tool';
  content: string;
  agentType?: string;
  toolCallId?: string;
  toolName?: string;
};

export class TelegramMessageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateTelegramMessageData): Promise<TelegramMessage> {
    const { conversationId, type, content, agentType, toolCallId, toolName } =
      data;

    return this.prisma.telegramMessage.create({
      data: {
        conversationId,
        type,
        content: { text: content },
        agentType,
        toolCallId,
        toolName,
      },
    });
  }

  async findByConversationId(
    conversationId: string,
    limit?: number
  ): Promise<TelegramMessage[]> {
    return this.prisma.telegramMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

export class TelegramConversationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getOrCreate(telegramSettingsId: string): Promise<{ id: string }> {
    const existing = await this.prisma.telegramConversation.findUnique({
      where: { telegramSettingsId },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.telegramConversation.create({
      data: { telegramSettingsId },
    });
  }
}
