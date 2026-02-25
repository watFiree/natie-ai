import { postChat } from '@/lib/api/default/default';
import { GetMessagesChatType } from '@/lib/api/models';
import { ChatModelAdapter } from '@assistant-ui/react';
import { mapToAssistantContent } from './helpers';

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
      const assistantContent = mapToAssistantContent(result.data.messages);

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
