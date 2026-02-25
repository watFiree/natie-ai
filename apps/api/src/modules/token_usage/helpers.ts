export interface TokenUsageBlock {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface PromptTokensDetails {
  cached_tokens: number;
}

export interface CompletionTokensDetails {
  reasoning_tokens: number;
}

export interface UsageBlock {
  prompt_tokens_details?: PromptTokensDetails;
  completion_tokens_details?: CompletionTokensDetails;
}

export interface ResponseMetadataWithUsage {
  model_name: string;
  model_provider: string;
  tokenUsage: TokenUsageBlock;
  usage?: UsageBlock;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isTokenUsageBlock(value: unknown): value is TokenUsageBlock {
  if (!isRecord(value)) return false;
  return (
    typeof value.promptTokens === 'number' &&
    typeof value.completionTokens === 'number' &&
    typeof value.totalTokens === 'number'
  );
}

function isPromptTokensDetails(value: unknown): value is PromptTokensDetails {
  if (!isRecord(value)) return false;
  return typeof value.cached_tokens === 'number';
}

function isCompletionTokensDetails(
  value: unknown
): value is CompletionTokensDetails {
  if (!isRecord(value)) return false;
  return typeof value.reasoning_tokens === 'number';
}

function isUsageBlock(value: unknown): value is UsageBlock {
  if (!isRecord(value)) return false;
  if (
    'prompt_tokens_details' in value &&
    value.prompt_tokens_details != null &&
    !isPromptTokensDetails(value.prompt_tokens_details)
  )
    return false;
  if (
    'completion_tokens_details' in value &&
    value.completion_tokens_details != null &&
    !isCompletionTokensDetails(value.completion_tokens_details)
  )
    return false;
  return true;
}

export function isResponseMetadataWithUsage(
  value: unknown
): value is ResponseMetadataWithUsage {
  if (!isRecord(value)) return false;
  return (
    typeof value.model_name === 'string' &&
    typeof value.model_provider === 'string' &&
    isTokenUsageBlock(value.tokenUsage) &&
    (value.usage === undefined || isUsageBlock(value.usage))
  );
}
