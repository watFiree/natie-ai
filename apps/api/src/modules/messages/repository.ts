import { PrismaClient, Message } from '../../../prisma/generated/prisma/client';
import { MessageTyped } from './consts';

export class MessageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: MessageTyped): Promise<Message> {
    const {
      conversationId,
      type,
      content,
      toolCallId,
      name,
      responseMetadata,
      toolCalls,
      invalidToolCalls,
      channel,
    } = data;

    return this.prisma.message.create({
      data: {
        conversationId,
        type,
        content,
        toolCallId,
        name,
        responseMetadata,
        toolCalls,
        invalidToolCalls,
        channel,
      },
    });
  }

  async createMany(data: MessageTyped[]): Promise<Message[]> {
    return this.prisma.$transaction(async (tx) => {
      const createdMessages: Message[] = [];
      for (const message of data) {
        const created = await tx.message.create({
          data: message,
        });
        createdMessages.push(created);
      }
      return createdMessages;
    });
  }

  async findByConversationId(
    conversationId: string,
    limit?: number
  ): Promise<Message[]> {
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit,
    });
  }
}
