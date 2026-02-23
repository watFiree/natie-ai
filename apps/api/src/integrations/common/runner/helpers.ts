import {
  InvalidToolCall,
  ToolCall,
  AIMessage,
  BaseMessage,
  HumanMessage,
  ToolMessage,
} from '@langchain/core/messages';
import { LangChainMessageType } from '../../../../prisma/generated/prisma/client';

type InternalMessageLike = {
  type: LangChainMessageType;
  content: unknown;
  toolCalls?: unknown;
  invalidToolCalls?: unknown;
  toolCallId?: string | null;
  name?: string | null;
};

function formatMessageContent(content: unknown): string {
  if (typeof content === 'string') {
    return content;
  }
  return String(content);
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isToolCall = (value: unknown): value is ToolCall => {
  if (!isRecord(value) || !isRecord(value.args)) return false;
  return typeof value.name === 'string';
};

const toToolCalls = (value: unknown): ToolCall[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const toolCalls = value.filter(isToolCall);
  return toolCalls.length > 0 ? toolCalls : undefined;
};

const isInvalidToolCall = (value: unknown): value is InvalidToolCall =>
  isRecord(value) &&
  (value.type === undefined || value.type === 'invalid_tool_call');

const toInvalidToolCalls = (value: unknown): InvalidToolCall[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const invalidToolCalls = value.filter(isInvalidToolCall);
  return invalidToolCalls.length > 0 ? invalidToolCalls : undefined;
};

export function mapInternalMessageToLangChain(
  message: InternalMessageLike
): BaseMessage {
  const textContent = formatMessageContent(message.content);

  switch (message.type) {
    case 'ai': {
      const toolCalls = toToolCalls(message.toolCalls);
      const invalidToolCalls = toInvalidToolCalls(message.invalidToolCalls);
      return new AIMessage({
        content: textContent,
        ...(toolCalls ? { tool_calls: toolCalls } : {}),
        ...(invalidToolCalls ? { invalid_tool_calls: invalidToolCalls } : {}),
      });
    }
    case 'tool':
      return new ToolMessage({
        content: textContent,
        tool_call_id: message.toolCallId || '',
        name: message.name || undefined,
      });
    default:
      return new HumanMessage(textContent);
  }
}

