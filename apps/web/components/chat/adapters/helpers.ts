import { ThreadAssistantMessagePart } from '@assistant-ui/react';
import { GetMessages200MessagesItem } from '@/lib/api/models';
import { ReadonlyJSONObject } from './consts';

export const mapToAssistantContent = (
  messages: GetMessages200MessagesItem[]
): ThreadAssistantMessagePart[] => {
  const toolResults = new Map<string, string>();
  for (const message of messages) {
    if (message.type === 'tool' && message.toolCallId && message.content) {
      toolResults.set(message.toolCallId, message.content);
    }
  }

  const content: ThreadAssistantMessagePart[] = [];
  for (const message of messages) {
    if (message.type !== 'ai') continue;

    if (message.content) {
      content.push({ type: 'text', text: message.content });
    }

    for (const toolCall of message.toolCalls ?? []) {
      content.push({
        type: 'tool-call',
        toolCallId: toolCall.id,
        toolName: toolCall.name,
        args: areToolArgsValid(toolCall.args) ? toolCall.args : {},
        argsText: JSON.stringify(toolCall.args),
        result: toolResults.get(toolCall.id),
      });
    }
  }

  return content;
};

export const areToolArgsValid = (
  args: Record<string, unknown>
): args is ReadonlyJSONObject => {
  return Object.values(args).every(
    (value) =>
      (typeof value === 'object' && value !== null) ||
      typeof value === 'string' ||
      value === null ||
      value === undefined ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      Array.isArray(value)
  );
};
