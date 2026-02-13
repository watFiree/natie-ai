export interface ExtractedTokenUsage {
  model: string | null;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

const INPUT_TOKEN_KEYS = [
  'input_tokens',
  'inputTokens',
  'prompt_tokens',
  'promptTokens',
];
const OUTPUT_TOKEN_KEYS = [
  'output_tokens',
  'outputTokens',
  'completion_tokens',
  'completionTokens',
];
const TOTAL_TOKEN_KEYS = ['total_tokens', 'totalTokens'];
const MODEL_KEYS = ['model_name', 'modelName', 'model', 'model_id', 'modelId'];

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toSafeTokenNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.trunc(value));
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.trunc(parsed));
    }
  }

  if (typeof value === 'bigint') {
    const maxSafe = BigInt(Number.MAX_SAFE_INTEGER);
    if (value <= maxSafe) {
      return Math.max(0, Number(value));
    }
  }

  return null;
}

function extractNumberFromKeys(
  record: Record<string, unknown>,
  keys: string[]
): number | null {
  for (const key of keys) {
    const value = toSafeTokenNumber(record[key]);
    if (value !== null) return value;
  }
  return null;
}

function extractModelFromKeys(record: Record<string, unknown>): string | null {
  for (const key of MODEL_KEYS) {
    const value = record[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }
  return null;
}

export function extractTokenUsageSnapshot(
  payload: unknown,
  fallbackModel?: string
): ExtractedTokenUsage | null {
  const queue: unknown[] = [payload];
  const visited = new Set<object>();

  let foundModel: string | null = null;
  let foundInputTokens: number | null = null;
  let foundOutputTokens: number | null = null;
  let foundTotalTokens: number | null = null;
  let processedNodes = 0;

  while (queue.length > 0 && processedNodes < 250) {
    processedNodes += 1;
    const current = queue.shift();

    if (Array.isArray(current)) {
      for (const item of current) {
        queue.push(item);
      }
      continue;
    }

    if (!isObjectRecord(current)) {
      continue;
    }

    if (visited.has(current)) {
      continue;
    }
    visited.add(current);

    foundInputTokens ??= extractNumberFromKeys(current, INPUT_TOKEN_KEYS);
    foundOutputTokens ??= extractNumberFromKeys(current, OUTPUT_TOKEN_KEYS);
    foundTotalTokens ??= extractNumberFromKeys(current, TOTAL_TOKEN_KEYS);
    foundModel ??= extractModelFromKeys(current);

    for (const value of Object.values(current)) {
      if (typeof value === 'object' && value !== null) {
        queue.push(value);
      }
    }
  }

  const inputTokens = foundInputTokens ?? 0;
  const outputTokens = foundOutputTokens ?? 0;
  const totalTokens = foundTotalTokens ?? inputTokens + outputTokens;

  if (inputTokens === 0 && outputTokens === 0) {
    return null;
  }

  return {
    model: foundModel ?? fallbackModel ?? null,
    inputTokens,
    outputTokens,
    totalTokens,
  };
}
