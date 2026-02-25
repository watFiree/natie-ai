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
    // Fetch one extra message to handle edge case where last message is a tool response
    const dbMessages = await this.context.messageRepo.findByConversationId(
      conversationId,
      historyLimit + 1
    );

    const messages = dbMessages
      .map((msg) => mapInternalMessageToLangChain(msg))
      .reverse();

    // If the last message before current user message is a tool response,
    // we need to ensure we also have the preceding AI message with tool_calls.
    // If we fetched extra messages and the last one is still a tool message,
    // we keep it - otherwise we trim to the requested limit.
    const lastMsgIndex = messages.length - 1;
    if (
      lastMsgIndex >= 0 &&
      messages[lastMsgIndex] instanceof ToolMessage &&
      messages.length > historyLimit
    ) {
      // Last message is tool response and we have extra messages,
      // keep all (limit+1) to preserve the AI message with tool_calls
    } else if (messages.length > historyLimit) {
      // Trim to requested limit
      messages.splice(0, messages.length - historyLimit);
    }

    messages.push(new HumanMessage(currentMessage));

    return messages;
  }

  async saveMessage(message: MessageTyped): Promise<void> {
    await this.context.messageRepo.create(message);
  }

  private async prepareRun(
    options: AgentRunCommonOptions
  ): Promise<{ messages: BaseMessage[] }> {
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
  }

  async stream(
    agent: ReactAgent,
    options: AgentRunCommonOptions
  ): Promise<Readable> {
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

        if (mode === 'updates' && typeof chunk === 'object' && chunk !== null) {
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
  }
}
