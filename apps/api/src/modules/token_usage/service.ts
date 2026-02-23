import { Message } from '../../../prisma/generated/prisma/client';
import { ModelPricingRepository, TokenUsageRepository, TokenUsageUpsertInput } from './repository';
import { isResponseMetadataWithUsage, ResponseMetadataWithUsage } from './helpers';

interface ParsedTokenUsage {
  modelName: string;
  modelProvider: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cachedTokens: number;
  reasoningTokens: number;
}

export class TokenUsageService {
  constructor(
    private readonly modelPricingRepo: ModelPricingRepository,
    private readonly tokenUsageRepo: TokenUsageRepository,
  ) {}

  async recordUsageFromMessages(userId: string, savedMessages: Message[]): Promise<void> {
    const parsed = this.extractTokenUsageFromMessages(savedMessages);
    if (parsed.length === 0) return;

    const upserts: TokenUsageUpsertInput[] = [];

    for (const usage of parsed) {
      const pricing = await this.modelPricingRepo.findByModelAndProvider(
        usage.modelName,
        usage.modelProvider,
      );

      if (!pricing) continue;

      upserts.push({
        userId,
        modelPricingId: pricing.id,
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        totalTokens: usage.totalTokens,
        cachedTokens: usage.cachedTokens,
        reasoningTokens: usage.reasoningTokens,
      });
    }

    if (upserts.length > 0) {
      await this.tokenUsageRepo.upsertMany(upserts);
    }
  }

  private extractTokenUsageFromMessages(messages: Message[]): ParsedTokenUsage[] {
    const results: ParsedTokenUsage[] = [];

    for (const message of messages) {
      if (!isResponseMetadataWithUsage(message.responseMetadata)) continue;

      const metadata: ResponseMetadataWithUsage = message.responseMetadata;

      results.push({
        modelName: metadata.model_name,
        modelProvider: metadata.model_provider,
        promptTokens: metadata.tokenUsage.promptTokens,
        completionTokens: metadata.tokenUsage.completionTokens,
        totalTokens: metadata.tokenUsage.totalTokens,
        cachedTokens: metadata.usage?.prompt_tokens_details?.cached_tokens ?? 0,
        reasoningTokens: metadata.usage?.completion_tokens_details?.reasoning_tokens ?? 0,
      });
    }

    return results;
  }
}
