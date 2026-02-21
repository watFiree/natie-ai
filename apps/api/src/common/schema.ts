import z from 'zod';
import {
  LangChainMessageType,
  MessageChannel,
} from '../../prisma/generated/prisma/client';

export const ErrorResponseSchema = z.object({
  error: z.string(),
});

const ToolCallSchema = z.object({
  name: z.string(),
  args: z.object({
    query: z.string(),
  }),
  type: z.string(),
  id: z.string(),
});

const ResponseMetadataSchema = z.object({
  tokenUsage: z.object({
    promptTokens: z.number(),
    completionTokens: z.number(),
    totalTokens: z.number(),
  }),
  finish_reason: z.string(),
  model_provider: z.string(),
  model_name: z.string(),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
    prompt_tokens_details: z.object({
      cached_tokens: z.number(),
      audio_tokens: z.number(),
    }),
    completion_tokens_details: z.object({
      reasoning_tokens: z.number(),
      audio_tokens: z.number(),
      accepted_prediction_tokens: z.number(),
      rejected_prediction_tokens: z.number(),
    }),
  }),
  system_fingerprint: z.string(),
});

export const MessageSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  createdAt: z.iso.datetime(),
  conversationId: z.string(),
  type: z.enum(LangChainMessageType),
  content: z.string(),
  responseMetadata: z.union([ResponseMetadataSchema, z.unknown()]).nullable(),
  toolCalls: z.array(ToolCallSchema).nullable(),
  invalidToolCalls: z.unknown().nullable(),
  toolCallId: z.string().nullable(),
  channel: z.enum(MessageChannel),
});

export const MessagesListSchema = z.object({
  messages: z.array(MessageSchema),
});
