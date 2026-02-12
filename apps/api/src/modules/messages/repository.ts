import { PrismaClient, Message } from '../../../prisma/generated/prisma/client';
import { CreateMessageData } from './consts';

export class MessageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateMessageData): Promise<Message> {
    const { conversationId, type, content, toolCallId, toolName, channel } =
      data;

    return this.prisma.message.create({
      data: {
        conversationId,
        type,
        content: { text: content },
        toolCallId,
        toolName,
        ...(channel && { channel }),
      },
    });
  }

  async findByConversationId(
    conversationId: string,
    limit?: number
  ): Promise<Message[]> {
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
