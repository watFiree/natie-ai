import {
  AIMessageChunk,
  BaseMessage,
  MessageStructure,
  MessageType,
  ToolMessage,
} from '@langchain/core/messages';
import { ClientTool, ServerTool } from '@langchain/core/tools';
import { ToolsToMessageToolSet } from 'langchain';
import {
  LangChainMessageType,
  MessageChannel,
} from '../../../prisma/generated/prisma/client';
import { MessageTyped, ResponseMetadata, ToolCall } from './consts';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isValidResponseMetadata = (value: unknown): value is ResponseMetadata => {
  if (!isRecord(value)) return false;

  const tokenUsage = value.tokenUsage;
  const usage = value.usage;
  if (!isRecord(tokenUsage) || !isRecord(usage)) return false;
  if (
    typeof tokenUsage.promptTokens !== 'number' ||
    typeof tokenUsage.completionTokens !== 'number' ||
    typeof tokenUsage.totalTokens !== 'number'
  ) {
    return false;
  }

  if (
    typeof value.finish_reason !== 'string' ||
    typeof value.model_provider !== 'string' ||
    typeof value.model_name !== 'string' ||
    typeof value.system_fingerprint !== 'string'
  ) {
    return false;
  }

  const promptTokensDetails = usage.prompt_tokens_details;
  const completionTokensDetails = usage.completion_tokens_details;

  if (
    typeof usage.prompt_tokens !== 'number' ||
    typeof usage.completion_tokens !== 'number' ||
    typeof usage.total_tokens !== 'number' ||
    !isRecord(promptTokensDetails) ||
    !isRecord(completionTokensDetails)
  ) {
    return false;
  }

  return (
    typeof promptTokensDetails.cached_tokens === 'number' &&
    typeof promptTokensDetails.audio_tokens === 'number' &&
    typeof completionTokensDetails.reasoning_tokens === 'number' &&
    typeof completionTokensDetails.audio_tokens === 'number' &&
    typeof completionTokensDetails.accepted_prediction_tokens === 'number' &&
    typeof completionTokensDetails.rejected_prediction_tokens === 'number'
  );
};

const toResponseMetadata = (value: unknown): ResponseMetadata | undefined =>
  isValidResponseMetadata(value) ? value : undefined;

const isToolCall = (value: unknown): value is ToolCall => {
  if (!isRecord(value) || !isRecord(value.args)) return false;
  return (
    typeof value.name === 'string' &&
    typeof value.type === 'string' &&
    typeof value.id === 'string' &&
    typeof value.args.query === 'string'
  );
};

const toToolCalls = (value: unknown): ToolCall[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  return value.filter(isToolCall);
};

type InvalidToolCallItem = NonNullable<
  MessageTyped['invalidToolCalls']
>[number];

const isInvalidToolCallItem = (value: unknown): value is InvalidToolCallItem =>
  isRecord(value) &&
  typeof value.type === 'string' &&
  value.type === 'invalid_tool_call';

const toInvalidToolCalls = (
  value: unknown
): MessageTyped['invalidToolCalls'] => {
  if (!Array.isArray(value)) return undefined;
  return value.filter(isInvalidToolCallItem);
};

export const mapLangChainUpdateChunkToInternal = (
  conversationId: string,
  channel: MessageChannel,
  chunk: unknown
): MessageTyped[] => {
  if (isRecord(chunk)) {
    if (
      'model_request' in chunk &&
      isRecord(chunk.model_request) &&
      'messages' in chunk.model_request &&
      Array.isArray(chunk.model_request.messages)
    ) {
      return chunk.model_request.messages
        .map((message) => {
          if (AIMessageChunk.isInstance(message)) {
            return {
              conversationId,
              channel,
              type: 'ai' satisfies LangChainMessageType,
              content: String(message.content),
              toolCallId: '',
              name: message.name,
              responseMetadata: toResponseMetadata(message.response_metadata),
              toolCalls: toToolCalls(message.tool_calls),
              invalidToolCalls: toInvalidToolCalls(message.invalid_tool_calls),
            } satisfies MessageTyped;
          }
          return undefined;
        })
        .filter((x): x is NonNullable<typeof x> => x !== undefined);
    }

    if (
      isRecord(chunk) &&
      'tools' in chunk &&
      isRecord(chunk.tools) &&
      'messages' in chunk.tools &&
      Array.isArray(chunk.tools.messages)
    ) {
      return chunk.tools.messages
        .map((message) => {
          if (ToolMessage.isInstance(message)) {
            return {
              conversationId,
              channel,
              type: 'tool' satisfies LangChainMessageType,
              content: String(message.content),
              toolCallId: message.tool_call_id,
              name: message.name,
              responseMetadata: toResponseMetadata(message.response_metadata),
            } satisfies MessageTyped;
          }

          return undefined;
        })
        .filter((x): x is NonNullable<typeof x> => x !== undefined);
    }
  }
  return [];
};

export const mapLangChainMessagesToInternal = (
  conversationId: string,
  channel: MessageChannel,
  messages: BaseMessage<
    MessageStructure<
      ToolsToMessageToolSet<readonly (ClientTool | ServerTool)[]>
    >,
    MessageType
  >[]
): MessageTyped[] => {
  return messages.map((message) => {
    if (message instanceof ToolMessage) {
      return {
        conversationId,
        channel,
        type: 'tool',
        content: String(message.content),
        toolCallId: message.tool_call_id,
        name: message.name,
        responseMetadata: toResponseMetadata(message.response_metadata),
      };
    }
    return {
      conversationId,
      channel,
      type: 'ai',
      content: String(message.content),
      toolCallId: '',
      name: message.name,
      responseMetadata:
        'response_metadata' in message
          ? toResponseMetadata(message.response_metadata)
          : undefined,
      toolCalls:
        'tool_calls' in message ? toToolCalls(message.tool_calls) : undefined,
      invalidToolCalls:
        'invalid_tool_calls' in message
          ? toInvalidToolCalls(message.invalid_tool_calls)
          : undefined,
    };
  });
};
