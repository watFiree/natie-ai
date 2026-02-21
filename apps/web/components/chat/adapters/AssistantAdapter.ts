import { postChat } from '@/lib/api/default/default';
import { GetMessagesChatType, PostChat200MessagesItem } from '@/lib/api/models';
import {
  ChatModelAdapter,
  ThreadAssistantMessagePart,
} from '@assistant-ui/react';

const mapAssistantParts = (
  message: PostChat200MessagesItem
): ThreadAssistantMessagePart[] => {
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
        args: toolCall.args,
        argsText: JSON.stringify(toolCall.args),
      });
    }
  }

  return content;
};

export const assistantAdapter = (
  chatType: GetMessagesChatType
): ChatModelAdapter => ({
  async run({ messages, abortSignal }) {
    const userMessage = messages[messages.length - 1];
    const result = await postChat(
      {
        message:
          userMessage.content.find((part) => part.type === 'text')?.text || '',
        chatType,
      },
      { signal: abortSignal }
    );

    if (result.status === 200) {
      const assistantContent = result.data.messages
        .filter((message) => message.type !== 'human')
        .flatMap(mapAssistantParts);

      return {
        content:
          assistantContent.length > 0
            ? assistantContent
            : [
                {
                  type: 'text',
                  text: 'An error occurred while processing your request.',
                },
              ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: 'An error occurred while processing your request.',
        },
      ],
    };
  },
});
