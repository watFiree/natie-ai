import { PrismaClient, TokenUsageRecord, ModelPricing } from '../../../prisma/generated/prisma/client';

export class ModelPricingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByModelAndProvider(modelName: string, modelProvider: string): Promise<ModelPricing | null> {
    return this.prisma.modelPricing.findUnique({
      where: { modelName_modelProvider: { modelName, modelProvider } },
    });
  }

  async findAll(): Promise<ModelPricing[]> {
    return this.prisma.modelPricing.findMany();
  }
}

export interface TokenUsageUpsertInput {
  userId: string;
  modelPricingId: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cachedTokens: number;
  reasoningTokens: number;
}

export class TokenUsageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async upsert(data: TokenUsageUpsertInput): Promise<TokenUsageRecord> {
    return this.prisma.tokenUsageRecord.upsert({
      where: {
        userId_modelPricingId: {
          userId: data.userId,
          modelPricingId: data.modelPricingId,
        },
      },
      create: data,
      update: {
        promptTokens: { increment: data.promptTokens },
        completionTokens: { increment: data.completionTokens },
        totalTokens: { increment: data.totalTokens },
        cachedTokens: { increment: data.cachedTokens },
        reasoningTokens: { increment: data.reasoningTokens },
      },
    });
  }

  async upsertMany(data: TokenUsageUpsertInput[]): Promise<void> {
    await this.prisma.$transaction(
      data.map((d) =>
        this.prisma.tokenUsageRecord.upsert({
          where: {
            userId_modelPricingId: {
              userId: d.userId,
              modelPricingId: d.modelPricingId,
            },
          },
          create: d,
          update: {
            promptTokens: { increment: d.promptTokens },
            completionTokens: { increment: d.completionTokens },
            totalTokens: { increment: d.totalTokens },
            cachedTokens: { increment: d.cachedTokens },
            reasoningTokens: { increment: d.reasoningTokens },
          },
        })
      )
    );
  }

  async getSummaryByUser(userId: string) {
    return this.prisma.tokenUsageRecord.findMany({
      where: { userId },
      include: { modelPricing: true },
    });
  }
}
