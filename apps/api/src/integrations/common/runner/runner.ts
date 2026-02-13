import { HumanMessage, BaseMessage, AIMessage } from '@langchain/core/messages';
import { ReactAgent } from 'langchain';
import { Readable } from 'stream';
import { AgentContext, AgentRunOptions } from './consts';
import { MessageRepository } from '../../../modules/messages/repository';
import { mapInternalMessageToLangChain } from '../formatMessages';
import {
  TokenUsageRepository,
  TokenUsageService,
} from '../../../modules/token_usage';

export class AgentRunner {
  private readonly tokenUsageService: TokenUsageService;

  constructor(private readonly context: AgentContext) {
    this.tokenUsageService = new TokenUsageService(
      new TokenUsageRepository(context.prisma)
    );
  }

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

  private async resolveUserId(options: AgentRunOptions): Promise<string | null> {
    if (options.userId) return options.userId;

    const conversation = await this.context.prisma.userChat.findUnique({
      where: { id: options.conversationId },
      select: { userId: true },
    });

    return conversation?.userId ?? null;
  }

  private normalizeChunkContent(content: unknown): string {
    if (typeof content === 'string') return content;

    if (typeof content === 'object' && content !== null && 'text' in content) {
      const text = (content as { text?: unknown }).text;
      if (typeof text === 'string') return text;
    }

    if (Array.isArray(content)) {
      return content
        .map((item) => {
          if (typeof item === 'string') return item;
          if (typeof item === 'object' && item !== null && 'text' in item) {
            const text = (item as { text?: unknown }).text;
            return typeof text === 'string' ? text : '';
          }
          return '';
        })
        .join('');
    }

    return '';
  }

  private async persistTokenUsage(
    userId: string | null,
    payload: unknown,
    modelName?: string
  ): Promise<boolean> {
    if (!userId) return false;

    try {
      return this.tokenUsageService.recordUsageFromPayload({
        userId,
        payload,
        fallbackModel: modelName,
      });
    } catch (error) {
      console.error('Failed to record token usage:', error);
      return false;
    }
  }

  async run(
    agent: ReactAgent,
    options: AgentRunOptions
  ): Promise<{ messages: BaseMessage[] } | Readable> {
    const { messages } = await this.buildMessages(
      options.conversationId,
      options.message
    );

    await this.saveUserMessage(
      options.conversationId,
      options.message,
      options.channel
    );
    const usageUserId = await this.resolveUserId(options);

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

        await this.persistTokenUsage(
          usageUserId,
          lastMessage,
          options.modelName
        );
      }

      return result;
    } else {
      const sseGenerator = async function* (this: AgentRunner) {
        yield `event: ping\ndata: ${Date.now()}\n\n`;

        let fullResponse = '';
        const tokenUsageCandidates: unknown[] = [];

        for await (const [mode, chunk] of (await agent.stream(
          { messages },
          {
            streamMode: ['messages', 'updates'],
            signal: options.abortController.signal,
          }
        )) as AsyncIterable<[string, unknown]>) {
          yield `event: ${mode}\ndata: ${JSON.stringify(chunk)}\n\n`;

          if (typeof chunk === 'object' && chunk !== null) {
            tokenUsageCandidates.push(chunk);
            if (tokenUsageCandidates.length > 25) {
              tokenUsageCandidates.shift();
            }
          }

          if (
            mode === 'messages' &&
            typeof chunk === 'object' &&
            chunk !== null
          ) {
            const chunkObj = chunk as { content?: unknown };
            if (chunkObj.content) {
              fullResponse += this.normalizeChunkContent(chunkObj.content);
            }
          }
        }

        if (fullResponse) {
          await this.saveAIMessage(
            options.conversationId,
            fullResponse,
            undefined,
            undefined,
            options.channel
          );
        }

        if (usageUserId) {
          for (let i = tokenUsageCandidates.length - 1; i >= 0; i -= 1) {
            const recorded = await this.persistTokenUsage(
              usageUserId,
              tokenUsageCandidates[i],
              options.modelName
            );
            if (recorded) break;
          }
        }

        yield `event: done\ndata: {}\n\n`;
      }.bind(this);

      return Readable.from(sseGenerator());
    }
  }
}
