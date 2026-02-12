import {
  PrismaClient,
  ChatType,
  UserChat,
} from '../../../prisma/generated/prisma/client';

export class ChatRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getOrCreate(
    userId: string,
    type: ChatType,
    title?: string
  ): Promise<UserChat> {
    return this.prisma.userChat.upsert({
      where: { userId_type: { userId, type } },
      update: {},
      create: { userId, type, title },
    });
  }

  async findById(id: string): Promise<UserChat | null> {
    return this.prisma.userChat.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: string): Promise<UserChat[]> {
    return this.prisma.userChat.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findByUserIdAndType(
    userId: string,
    type: ChatType
  ): Promise<UserChat | null> {
    return this.prisma.userChat.findUnique({
      where: { userId_type: { userId, type } },
    });
  }
}
