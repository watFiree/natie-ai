import { HumanMessage, BaseMessage, AIMessage } from '@langchain/core/messages';
import { ReactAgent } from 'langchain';
import { Readable } from 'stream';
import { TelegramMessageRepository } from './repository';
import { mapInternalMessageToLangChain } from '../../integrations/common/formatMessages';
import { LangChainMessageType } from '../../../prisma/generated/prisma/client';
import { AgentRunOptions } from '../../integrations/common/runner/consts';
import { ExtendedAgentType } from '../../integrations/delegate/consts';

export interface TelegramAgentContext {
  messageRepo: TelegramMessageRepository;
}

export interface TelegramAgentRunOptions extends Omit<AgentRunOptions, 'type'> {
  agentType: ExtendedAgentType;
}

export class TelegramAgentRunner {
  constructor(private readonly context: TelegramAgentContext) {}

  async buildMessages(
    conversationId: string,
    currentMessage: string,
    historyLimit: number = 4
  ): Promise<{
    messages: BaseMessage[];
    dbMessages: Awaited<
      ReturnType<TelegramMessageRepository['findByConversationId']>
    >;
  }> {
    const dbMessages = await this.context.messageRepo.findByConversationId(
      conversationId,
      historyLimit
    );

    const messages = dbMessages
      .map((msg) =>
        mapInternalMessageToLangChain(
          msg.type as LangChainMessageType,
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
    agentType: ExtendedAgentType
  ): Promise<void> {
    await this.context.messageRepo.create({
      conversationId,
      type: 'human',
      content: message,
      agentType,
    });
  }

  async saveAIMessage(
    conversationId: string,
    content: string,
    agentType: ExtendedAgentType,
    toolCallId?: string,
    toolName?: string
  ): Promise<void> {
    await this.context.messageRepo.create({
      conversationId,
      type: 'ai',
      content,
      agentType,
      toolCallId,
      toolName,
    });
  }

  async run(
    agent: ReactAgent,
    options: TelegramAgentRunOptions
  ): Promise<{ messages: BaseMessage[] } | Readable> {
    const { messages } = await this.buildMessages(
      options.conversationId,
      options.message
    );

    await this.saveUserMessage(
      options.conversationId,
      options.message,
      options.agentType
    );

    const result = (await agent.invoke({ messages })) as {
      messages: BaseMessage[];
    };

    const lastMessage = result.messages[result.messages.length - 1];
    if (lastMessage instanceof AIMessage) {
      await this.saveAIMessage(
        options.conversationId,
        String(lastMessage.content),
        options.agentType
      );
    }

    return result;
  }
}
