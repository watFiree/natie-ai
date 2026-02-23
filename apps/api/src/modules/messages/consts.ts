import { InvalidToolCall } from '@langchain/core/messages';
import {
  LangChainMessageType,
  MessageChannel,
  Prisma,
} from '../../../prisma/generated/prisma/client';

type JsonObject = Prisma.InputJsonObject;

export type ToolCall = JsonObject & {
  name: string;
  args: JsonObject;
  type: string;
  id: string;
};

type TokenUsage = JsonObject & {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

type PromptTokensDetails = JsonObject & {
  cached_tokens: number;
  audio_tokens: number;
};

type CompletionTokensDetails = JsonObject & {
  reasoning_tokens: number;
  audio_tokens: number;
  accepted_prediction_tokens: number;
  rejected_prediction_tokens: number;
};

type Usage = JsonObject & {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  prompt_tokens_details: PromptTokensDetails;
  completion_tokens_details: CompletionTokensDetails;
};

export type ResponseMetadata = JsonObject & {
  tokenUsage: TokenUsage;
  finish_reason: string;
  model_provider: string;
  model_name: string;
  usage: Usage;
  system_fingerprint: string;
};

export type MessageTyped = {
  conversationId: string;
  type: LangChainMessageType;
  content: string;
  responseMetadata?: ResponseMetadata;
  toolCalls?: ToolCall[];
  invalidToolCalls?: (JsonObject & InvalidToolCall<string>)[];
  toolCallId?: string;
  name?: string;
  channel: MessageChannel;
};
