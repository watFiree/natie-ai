import { HumanMessage, BaseMessage, AIMessage } from '@langchain/core/messages';
import { ReactAgent } from 'langchain';
import { Readable } from 'stream';
import { AgentContext, AgentRunOptions } from './consts';
import { MessageRepository } from '../../../modules/messages/repository';
import { mapInternalMessageToLangChain } from '../formatMessages';

export class AgentRunner {
  constructor(private readonly context: AgentContext) {}

  async buildMessages(
    conversationId: string,
    currentMessage: string,
    historyLimit: number = 4
  ): Promise<{
    messages: BaseMessage[];
    dbMessages: Awaited<ReturnType<MessageRepository['findByConversationId']>>;
  }> {
    const dbMessages = await this.context.messageRepo.findByConversationId(
      conversationId,
      historyLimit
    );

    const messages = dbMessages
      .map((msg) =>
        mapInternalMessageToLangChain(
          msg.type,
          msg.content,
          msg.toolCallId,
          msg.toolName
        )
      )
      .reverse();

    messages.push(new HumanMessage(currentMessage));

    return { messages, dbMessages };
  }

  async saveUserMessage(
    conversationId: string,
    message: string,
    channel?: AgentRunOptions['channel']
  ): Promise<void> {
    await this.context.messageRepo.create({
      conversationId,
      type: 'human',
      content: message,
      channel,
    });
  }

  async saveAIMessage(
    conversationId: string,
    content: string,
    toolCallId?: string,
    toolName?: string,
    channel?: AgentRunOptions['channel']
  ): Promise<void> {
    await this.context.messageRepo.create({
      conversationId,
      type: 'ai',
      content,
      toolCallId,
      toolName,
      channel,
    });
  }

  async run(
    agent: ReactAgent,
    options: AgentRunOptions
  ): Promise<{ messages: BaseMessage[] } | Readable> {
    const { messages } = await this.buildMessages(
      options.conversationId,
      options.message
    );

    await this.saveUserMessage(options.conversationId, options.message, options.channel);

    if (options.type === 'invoke') {
      const result = (await agent.invoke({ messages })) as {
        messages: BaseMessage[];
      };

      const lastMessage = result.messages[result.messages.length - 1];
      if (lastMessage instanceof AIMessage) {
        await this.saveAIMessage(
          options.conversationId,
          String(lastMessage.content),
          undefined,
          undefined,
          options.channel
        );
      }

      return result;
    } else {
      const sseGenerator = async function* (this: AgentRunner) {
        yield `event: ping\ndata: ${Date.now()}\n\n`;

        let fullResponse = '';

        for await (const [mode, chunk] of (await agent.stream(
          { messages },
          {
            streamMode: ['messages', 'updates'],
            signal: options.abortController.signal,
          }
        )) as AsyncIterable<[string, unknown]>) {
          yield `event: ${mode}\ndata: ${JSON.stringify(chunk)}\n\n`;

          if (
            mode === 'messages' &&
            typeof chunk === 'object' &&
            chunk !== null
          ) {
            const chunkObj = chunk as { content?: unknown };
            if (chunkObj.content) {
              fullResponse += String(chunkObj.content);
            }
          }
        }

        if (fullResponse) {
          await this.saveAIMessage(options.conversationId, fullResponse, undefined, undefined, options.channel);
        }

        yield `event: done\ndata: {}\n\n`;
      }.bind(this);

      return Readable.from(sseGenerator());
    }
  }
}
