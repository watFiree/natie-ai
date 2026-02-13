import { PrismaClient } from '../../../prisma/generated/prisma/client';
import { DEFAULT_MODEL_PRICING, FALLBACK_MODEL_PRICING } from './consts';

const TOKENS_PER_MILLION = 1_000_000n;

export interface RecordTokenUsageInput {
  userId: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens?: number;
}

function sanitizeTokenCount(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.trunc(value));
}

function calculateCostMicros(tokens: number, unitPricePerMillion: number): bigint {
  return (
    (BigInt(sanitizeTokenCount(tokens)) * BigInt(unitPricePerMillion)) /
    TOKENS_PER_MILLION
  );
}

export class TokenUsageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private async getOrCreateModelPricing(model: string) {
    const defaults = DEFAULT_MODEL_PRICING[model] ?? FALLBACK_MODEL_PRICING;

    return this.prisma.modelPricing.upsert({
      where: { model },
      create: {
        model,
        inputPricePerMillionMicros: defaults.inputPricePerMillionMicros,
        outputPricePerMillionMicros: defaults.outputPricePerMillionMicros,
      },
      update: {},
    });
  }

  async recordUsage(input: RecordTokenUsageInput): Promise<void> {
    const model = input.model.trim();
    if (!model) return;

    const inputTokens = sanitizeTokenCount(input.inputTokens);
    const outputTokens = sanitizeTokenCount(input.outputTokens);
    const providedTotalTokens = sanitizeTokenCount(input.totalTokens ?? 0);
    const totalTokens = Math.max(inputTokens + outputTokens, providedTotalTokens);

    if (inputTokens === 0 && outputTokens === 0) {
      return;
    }

    const pricing = await this.getOrCreateModelPricing(model);
    const inputCostMicros = calculateCostMicros(
      inputTokens,
      pricing.inputPricePerMillionMicros
    );
    const outputCostMicros = calculateCostMicros(
      outputTokens,
      pricing.outputPricePerMillionMicros
    );
    const totalCostMicros = inputCostMicros + outputCostMicros;

    await this.prisma.userModelTokenUsage.upsert({
      where: {
        userId_model: { userId: input.userId, model },
      },
      create: {
        userId: input.userId,
        model,
        inputTokens: BigInt(inputTokens),
        outputTokens: BigInt(outputTokens),
        totalTokens: BigInt(totalTokens),
        inputCostMicros,
        outputCostMicros,
        totalCostMicros,
      },
      update: {
        inputTokens: { increment: BigInt(inputTokens) },
        outputTokens: { increment: BigInt(outputTokens) },
        totalTokens: { increment: BigInt(totalTokens) },
        inputCostMicros: { increment: inputCostMicros },
        outputCostMicros: { increment: outputCostMicros },
        totalCostMicros: { increment: totalCostMicros },
      },
    });
  }
}
