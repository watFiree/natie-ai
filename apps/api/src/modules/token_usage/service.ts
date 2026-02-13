import { extractTokenUsageSnapshot } from './extract';
import { TokenUsageRepository } from './repository';

export interface RecordUsageFromPayloadInput {
  userId: string;
  payload: unknown;
  fallbackModel?: string;
}

export class TokenUsageService {
  constructor(private readonly tokenUsageRepo: TokenUsageRepository) {}

  async recordUsageFromPayload(
    input: RecordUsageFromPayloadInput
  ): Promise<boolean> {
    const snapshot = extractTokenUsageSnapshot(input.payload, input.fallbackModel);
    if (!snapshot || !snapshot.model) return false;

    await this.tokenUsageRepo.recordUsage({
      userId: input.userId,
      model: snapshot.model,
      inputTokens: snapshot.inputTokens,
      outputTokens: snapshot.outputTokens,
      totalTokens: snapshot.totalTokens,
    });

    return true;
  }
}
