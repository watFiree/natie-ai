import { Telegraf, Context } from 'telegraf';
import { message as messageFilter } from 'telegraf/filters';
import { PrismaClient } from '../../../prisma/generated/prisma/client';
import {
  TelegramMessageRepository,
  TelegramConversationRepository,
} from './repository';
import { TelegramAgentRunner } from './runner';
import { createAgent as createEmailAgent } from '../../integrations/email_handler/createAgent';
import { createSystemPrompt as createEmailSystemPrompt } from '../../integrations/email_handler/system';
import { createTools as createEmailTools } from '../../integrations/email_handler/tools';
import { createAgent as createXAgent } from '../../integrations/x_handler/createAgent';
import { createSystemPrompt as createXSystemPrompt } from '../../integrations/x_handler/system';
import { createTools as createXTools } from '../../integrations/x_handler/tools';
import { GmailOAuthService } from '../../modules/gmail/service';
import { createOAuth2Client } from '../../modules/gmail/clientFactory';
import { GmailAccountRepository } from '../../modules/gmail/repository';
import { XAccountRepository } from '../../modules/x_account/repository';
import { createClient as createXClient } from '../../integrations/x_handler/clientFactory';
import { AgentDelegate, type AgentInfo } from '../../integrations/delegate';
import { createAgent as createChatAgent } from '../../integrations/chat';
import type { FastifyInstance } from 'fastify';
import type { ExtendedAgentType } from '../../integrations/delegate';
import { ReactAgent } from 'langchain';

export class TelegramGateway {
  private bot: Telegraf;
  private prisma: PrismaClient;
  private telegramMessageRepo: TelegramMessageRepository;
  private telegramConversationRepo: TelegramConversationRepository;
  private telegramAgentRunner: TelegramAgentRunner;
  private gmailService: GmailOAuthService;
  private gmailAccountRepo: GmailAccountRepository;
  private xAccountRepo: XAccountRepository;
  private agentDelegate: AgentDelegate;

  constructor(fastify: FastifyInstance) {
    const token = process.env.TELEGRAM_TOKEN;
    if (!token) {
      throw new Error('TELEGRAM_TOKEN environment variable is required');
    }

    this.bot = new Telegraf(token);
    this.prisma = fastify.prisma;
    this.telegramMessageRepo = new TelegramMessageRepository(this.prisma);
    this.telegramConversationRepo = new TelegramConversationRepository(
      this.prisma
    );
    this.telegramAgentRunner = new TelegramAgentRunner({
      messageRepo: this.telegramMessageRepo,
    });
    this.gmailAccountRepo = new GmailAccountRepository(this.prisma);
    this.gmailService = new GmailOAuthService(
      createOAuth2Client(),
      this.gmailAccountRepo
    );
    this.xAccountRepo = new XAccountRepository(this.prisma);
    this.agentDelegate = new AgentDelegate();
  }

  private setupListeners(): void {
    this.bot.on(messageFilter('text'), async (ctx) => {
      try {
        await this.handleTextMessage(ctx);
      } catch (error) {
        console.error('Error handling Telegram message:', error);
        await ctx.reply('Sorry, something went wrong. Please try again later.');
      }
    });

    // Handle photos with captions
    this.bot.on(messageFilter('photo'), async (ctx) => {
      try {
        await this.handlePhotoMessage(ctx);
      } catch (error) {
        console.error('Error handling Telegram photo:', error);
        await ctx.reply('Sorry, something went wrong. Please try again later.');
      }
    });

    // Handle documents
    this.bot.on(messageFilter('document'), async (ctx) => {
      try {
        await this.handleDocumentMessage(ctx);
      } catch (error) {
        console.error('Error handling Telegram document:', error);
        await ctx.reply('Sorry, something went wrong. Please try again later.');
      }
    });
  }

  private async handleTextMessage(ctx: Context): Promise<void> {
    const chatId = ctx.chat?.id;
    const userId = ctx.from?.id;
    const text = ctx.message && 'text' in ctx.message ? ctx.message.text : '';
    if (!chatId || !userId || !text) return;

    const telegramSettings = await this.findTelegramSettingsByUserId(userId);
    if (!telegramSettings) {
      await ctx.reply(
        `You are not registered. Please connect your Telegram account through the web interface first. Your account id: ${userId}`
      );
      return;
    }

    const userAgents = await this.getUserAgents(telegramSettings.userId);

    const selectedAgentType = await this.getAgentToDelegate(text, userAgents);
    const selectedAgent = userAgents.find((a) => a.type === selectedAgentType);

    if (!selectedAgent) {
      await ctx.reply(
        "I'm not sure which agent should handle your request. Could you be more specific?"
      );
      return;
    }

    // Show typing indicator
    await ctx.sendChatAction('typing');

    const conversation = await this.telegramConversationRepo.getOrCreate(
      telegramSettings.id
    );

    const response = await this.getResponse(
      telegramSettings.userId,
      selectedAgent,
      conversation.id,
      text
    );

    await ctx.reply(response);
  }

  private async handlePhotoMessage(ctx: Context): Promise<void> {
    const userId = ctx.from?.id;
    const caption =
      ctx.message && 'caption' in ctx.message
        ? (ctx.message.caption ?? '')
        : '';

    if (!userId) return;

    const telegramSettings = await this.findTelegramSettingsByUserId(userId);
    if (!telegramSettings) {
      await ctx.reply('You are not registered.');
      return;
    }

    // For now, inform users that image processing is limited
    await ctx.reply(
      "I received your image. Image analysis is not fully supported yet, but I'll help if I can with the caption."
    );

    if (caption) {
      // Process caption as a text message
      await this.handleTextMessage(ctx);
    }
  }

  private async handleDocumentMessage(ctx: Context): Promise<void> {
    const userId = ctx.from?.id;
    if (!userId) return;

    const telegramSettings = await this.findTelegramSettingsByUserId(userId);
    if (!telegramSettings) {
      await ctx.reply('You are not registered.');
      return;
    }

    await ctx.reply(
      'I received your document. Document processing is not fully supported yet.'
    );
  }

  private async findTelegramSettingsByUserId(
    telegramUserId: number
  ): Promise<{ id: string; userId: string; email: string } | null> {
    const telegramSettings = await this.prisma.telegramSettings.findUnique({
      where: { telegramUserId: telegramUserId.toString() },
      include: { user: true },
    });

    if (!telegramSettings) {
      return null;
    }

    return {
      id: telegramSettings.id,
      userId: telegramSettings.user.id,
      email: telegramSettings.user.email,
    };
  }

  private async getUserAgents(userId: string): Promise<AgentInfo[]> {
    const userAgents = await this.prisma.userAgent.findMany({
      where: {
        userId,
        isEnabled: true,
      },
      include: {
        agent: true,
      },
    });

    const agents = userAgents.map((ua) => ({
      id: ua.agentId,
      userAgentId: ua.id,
      name: ua.displayName || ua.agent.description,
      description: ua.agent.description,
      type: ua.agent.type,
    })) satisfies AgentInfo[];

    const chatAgent: AgentInfo = {
      id: 'chat',
      userAgentId: `chat-${userId}`,
      name: 'Chat',
      description:
        'General chat agent for answering questions and having conversations without using any tools',
      type: 'chat',
    };

    return [chatAgent, ...agents];
  }

  private async getAgentToDelegate(
    message: string,
    agents: AgentInfo[]
  ): Promise<ExtendedAgentType> {
    return this.agentDelegate.run(message, agents);
  }

  private async getResponse(
    userId: string,
    agent: AgentInfo,
    conversationId: string,
    message: string
  ): Promise<string> {
    const abortController = new AbortController();

    try {
      let reactAgent: ReactAgent;

      if (agent.type === 'email') {
        const settings = await this.prisma.emailAgentSettings.findFirst({
          where: { userId },
        });
        const emailAccounts = await this.gmailAccountRepo.findByUserId(userId);

        if (emailAccounts.length === 0) {
          return 'You need to connect a Gmail account first to use the email agent.';
        }

        const systemPrompt = createEmailSystemPrompt(
          settings?.labels ?? [],
          emailAccounts.map((a) => a.email)
        );
        const tokenProvider = (email: string) =>
          this.gmailService.getEnsuredAccessToken(userId, email);
        const tools = createEmailTools(tokenProvider);
        reactAgent = createEmailAgent(systemPrompt, tools);
      } else if (agent.type === 'x') {
        const xAccount = await this.xAccountRepo.findByUserId(userId);

        if (!xAccount) {
          return 'You need to connect your X (Twitter) account first to use the X agent.';
        }

        const systemPrompt = createXSystemPrompt();
        const clientProvider = () =>
          createXClient({
            authToken: xAccount.authToken,
            ct0: xAccount.ct0,
          });
        const tools = createXTools(clientProvider);
        reactAgent = createXAgent(systemPrompt, tools);
      } else if (agent.type === 'chat') {
        reactAgent = createChatAgent();
      } else {
        return `Agent type "${agent.type}" is not supported yet.`;
      }

      const result = await this.telegramAgentRunner.run(reactAgent, {
        conversationId,
        message,
        agentType: agent.type,
        abortController,
      });

      if ('messages' in result) {
        const lastMessage = result.messages.at(-1);
        if (lastMessage && 'content' in lastMessage) {
          return String(lastMessage.content);
        }
      }

      return 'I processed your request but could not generate a response.';
    } catch (error) {
      console.error('Error processing with agent:', error);
      return 'Sorry, I encountered an error while processing your request.';
    }
  }

  public start() {
    this.setupListeners();
    this.bot.launch();
    console.log('🤖 Telegram bot started');

    // Graceful shutdown
    process.once('SIGINT', () => {
      this.bot.stop('SIGINT');
      void this.prisma.$disconnect();
    });
    process.once('SIGTERM', () => {
      this.bot.stop('SIGTERM');
      void this.prisma.$disconnect();
    });
  }
}
