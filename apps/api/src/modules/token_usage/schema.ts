import z from 'zod';

export const TokenUsageSummaryItemSchema = z.object({
  id: z.string(),
  modelName: z.string(),
  modelProvider: z.string(),
  promptTokens: z.number(),
  completionTokens: z.number(),
  totalTokens: z.number(),
  cachedTokens: z.number(),
  reasoningTokens: z.number(),
  inputPricePerToken: z.string(),
  outputPricePerToken: z.string(),
  estimatedCost: z.string(),
});

export const TokenUsageSummaryResponseSchema = z.object({
  usage: z.array(TokenUsageSummaryItemSchema),
});
