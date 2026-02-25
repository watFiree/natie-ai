import { getMessages } from '@/lib/api/default/default';
import {
  GetMessagesChatType,
  GetMessages200MessagesItem,
} from '@/lib/api/models';
import {
  ThreadAssistantMessagePart,
  ThreadHistoryAdapter,
  ThreadMessage,
} from '@assistant-ui/react';
import { areToolArgsValid } from './helpers';

const mapHumanMessage = (
  message: GetMessages200MessagesItem
): ThreadMessage => ({
  role: 'user',
  content: [{ type: 'text', text: message.content }],
  attachments: [],
  createdAt: new Date(message.createdAt),
  id: message.id,
  metadata: { custom: {} },
});

const mapAiMessage = (
  message: GetMessages200MessagesItem,
  toolResults: Map<string, string>
): ThreadMessage => {
  const content: ThreadAssistantMessagePart[] = [];

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

  return {
    role: 'assistant',
    content,
    createdAt: new Date(message.createdAt),
    id: message.id,
    status: { type: 'complete', reason: 'stop' },
    metadata: {
      custom: {},
      unstable_state: null,
      unstable_annotations: [],
      unstable_data: [],
      steps: [],
      submittedFeedback: undefined,
    },
  };
};

export const historyAdapter = (
  chatType: GetMessagesChatType
): ThreadHistoryAdapter => ({
  async load() {
    try {
      const response = await getMessages({ chatType });

      if (response.status !== 200) return { messages: [] };

      const messages = response.data.messages.toReversed();

      const toolResults = new Map<string, string>();
      const messagesWithoutTools = messages.reduce<
        GetMessages200MessagesItem[]
      >((acc, message) => {
        if (message.type === 'tool' && message.toolCallId && message.content) {
          toolResults.set(message.toolCallId, message.content);
        } else {
          acc.push(message);
        }
        return acc;
      }, []);

      const threadMessages = messagesWithoutTools.map(
        (message, index, array) => ({
          message:
            message.type === 'human'
              ? mapHumanMessage(message)
              : mapAiMessage(message, toolResults),
          parentId: index === 0 ? null : array[index - 1].id,
        })
      );

      return { messages: threadMessages };
    } catch {
      return { messages: [] };
    }
  },
  async append() {},
});
