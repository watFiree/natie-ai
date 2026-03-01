import {
  HumanMessage,
  BaseMessage,
  ToolMessage,
} from '@langchain/core/messages';
import { ReactAgent } from 'langchain';
import { Readable } from 'stream';
import { AgentContext, AgentRunOptions } from './consts';
import { mapInternalMessageToLangChain } from './helpers';
import { MessageTyped } from '../../../modules/messages/consts';
import {
  mapLangChainMessagesToInternal,
  mapLangChainUpdateChunkToInternal,
} from '../../../modules/messages/helper';
import { Message } from '../../../../prisma/generated/prisma/client';

type AgentRunCommonOptions = Omit<AgentRunOptions, 'type'>;

export class AgentRunner {
  constructor(private readonly context: AgentContext) {}

  async buildMessages(
    conversationId: string,
    currentMessage: string,
    historyLimit: number = 10
  ): Promise<BaseMessage[]> {
    try {
      const dbMessages = await this.context.messageRepo.findByConversationId(
        conversationId,
        historyLimit
      );

      const messages = dbMessages
        .map((msg) => mapInternalMessageToLangChain(msg))
        .reverse();

      if (messages.length > 0 && messages[0].type === 'tool') {
        messages.shift();
      }

      messages.push(new HumanMessage(currentMessage));

      return messages;
    } catch (err) {
      throw new Error('Failed to build messages', { cause: err });
    }
  }

  async saveMessage(message: MessageTyped): Promise<void> {
    try {
      await this.context.messageRepo.create(message);
    } catch (err) {
      throw new Error('Failed to save message', { cause: err });
    }
  }

  private async prepareRun(
    options: AgentRunCommonOptions
  ): Promise<{ messages: BaseMessage[] }> {
    try {
      const messages = await this.buildMessages(
        options.conversationId,
        options.message
      );

      await this.saveMessage({
        conversationId: options.conversationId,
        type: 'human',
        content: options.message,
        channel: options.channel,
      });

      return { messages };
    } catch (err) {
      throw new Error('Failed to prepare run', { cause: err });
    }
  }

  private getModelName(agent: ReactAgent): string | undefined {
    return typeof agent.options.model === 'string'
      ? agent.options.model
      : agent.options.model.lc_kwargs.model;
  }

  async invoke(
    agent: ReactAgent,
    options: AgentRunCommonOptions
  ): Promise<{ messages: Message[] }> {
    try {
      const { messages } = await this.prepareRun(options);
      const result = await agent.invoke({ messages });

      const newMessages = result.messages.slice(messages.length);
      const internalMessages = mapLangChainMessagesToInternal(
        options.conversationId,
        options.channel,
        newMessages
      );
      const savedMessages =
        await this.context.messageRepo.createMany(internalMessages);

      try {
        await this.context.tokenUsageService.recordUsageFromMessages(
          options.userId,
          savedMessages,
          this.getModelName(agent)
        );
      } catch (err) {
        console.error('Failed to record token usage:', err);
      }

      return { messages: savedMessages };
    } catch (err) {
      throw new Error('Failed to invoke agent', { cause: err });
    }
  }

  async stream(
    agent: ReactAgent,
    options: AgentRunCommonOptions
  ): Promise<Readable> {
    try {
      const { messages } = await this.prepareRun(options);

      const sseGenerator = async function* (this: AgentRunner) {
        yield `event: ping\ndata: ${Date.now()}\n\n`;

        for await (const [mode, chunk] of (await agent.stream(
          { messages },
          {
            streamMode: ['messages', 'updates'],
            signal: options.abortController.signal,
          }
        )) as AsyncIterable<[string, unknown]>) {
          yield `event: ${mode}\ndata: ${JSON.stringify(chunk)}\n\n`;

          if (
            mode === 'updates' &&
            typeof chunk === 'object' &&
            chunk !== null
          ) {
            const internalMessages = mapLangChainUpdateChunkToInternal(
              options.conversationId,
              options.channel,
              chunk
            );
            const savedMessages =
              await this.context.messageRepo.createMany(internalMessages);

            try {
              await this.context.tokenUsageService.recordUsageFromMessages(
                options.userId,
                savedMessages,
                this.getModelName(agent)
              );
            } catch (err) {
              console.error('Failed to record token usage:', err);
            }
          }
        }

        yield `event: done\ndata: {}\n\n`;
      }.bind(this);

      return Readable.from(sseGenerator());
    } catch (err) {
      throw new Error('Failed to stream agent', { cause: err });
    }
  }
}
