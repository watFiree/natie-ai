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

const mapMessageToThreadMessage = (
  message: GetMessages200MessagesItem
): ThreadMessage => {
  if (message.type === 'human') {
    return {
      role: 'user',
      content: [
        {
          type: 'text',
          text: message.content,
        },
      ],
      attachments: [],
      createdAt: new Date(message.createdAt),
      id: message.id,
      metadata: {
        custom: {},
      },
    };
  }

  // if (message.type === 'ai') {
  const content: ThreadAssistantMessagePart[] = [];
  if (message.content) {
    content.push({
      type: 'text',
      text: message.content,
    });
  }
  if (message.toolCalls !== null) {
    for (const toolCall of message.toolCalls) {
      content.push({
        type: 'tool-call',
        toolCallId: toolCall.id || 'unkown-tool-call-id',
        toolName: toolCall.name || 'unkown-tool-name',
        args: areToolArgsValid(toolCall.args) ? toolCall.args : {},
        argsText: JSON.stringify(toolCall.args),
      });
    }
  }

  return {
    role: 'assistant',
    content,
    createdAt: new Date(message.createdAt),
    id: message.id,
    status: {
      type: 'complete',
      reason: 'stop',
    },
    metadata: {
      custom: {},
      unstable_state: null,
      unstable_annotations: [],
      unstable_data: [],
      steps: [],
      submittedFeedback: undefined,
    },
  };
  // }

  // TODO: inject result to previous message
  // if(message.type === 'tool') {
  //   return {
  //     role: 'assistant',
  //     content: [{
  //       type: 'tool-call',
  //       toolCallId: message.toolCallId || 'unkown-tool-call-id',
  //       toolName: message.name || 'unkown-tool-name',
  //       args: message.args,
  //       argsText: JSON.stringify(message.args),
  //     }],
  //     createdAt: new Date(message.createdAt),
  //     id: message.id,
  //     status: {
  //       type: 'complete',
  //       reason: 'stop',
  //     },
  //     metadata: {
  //       custom: {},
  //       unstable_state: null,
  //       unstable_annotations: [null],
  //       unstable_data: [null],
  //       steps: [{}],
  //       submittedFeedback: undefined,
  //     },
};

export const historyAdapter = (
  chatType: GetMessagesChatType
): ThreadHistoryAdapter => ({
  async load() {
    try {
      const response = await getMessages({
        chatType,
      });

      if (response.status === 200) {
        const orderedMessages = response.data.messages.toReversed();
        const formattedMessages = orderedMessages.map(
          (message, index, originalMessages) => ({
            message: mapMessageToThreadMessage(message),
            parentId: index === 0 ? null : originalMessages[index - 1].id,
          })
        );
        return { messages: formattedMessages };
      }

      return { messages: [] };
    } catch {
      return { messages: [] };
    }
  },
  async append() {},
});
