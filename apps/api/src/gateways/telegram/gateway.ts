import { Telegraf, Context } from 'telegraf';
import { message as messageFilter } from 'telegraf/filters';
import { PrismaClient } from '../../../prisma/generated/prisma/client';
import { GmailOAuthService } from '../../modules/gmail/service';
import { GmailAccountRepository } from '../../modules/gmail/repository';
import { XAccountRepository } from '../../modules/x_account/repository';
import { CalendarOAuthService } from '../../modules/google_calendar/service';
import { CalendarAccountRepository } from '../../modules/google_calendar/repository';
import { MessageRepository } from '../../modules/messages/repository';
import { ChatRepository } from '../../modules/chat/repository';
import { AgentRunner } from '../../integrations/common/runner';
import { TokenUsageService } from '../../modules/token_usage/service';
import {
  ModelPricingRepository,
  TokenUsageRepository,
} from '../../modules/token_usage/repository';
import { NatieService } from '../../modules/natie/service';
import type { FastifyInstance } from 'fastify';
import type { AgentLockService } from '../../modules/agent_lock/service';

const ACTIVE_WEB_CONVERSATION_MESSAGE =
  'You have an active conversation in the web app. Please complete it before sending more messages here.';
const ACTIVE_TELEGRAM_CONVERSATION_MESSAGE =
  'I am still processing your previous message. Please wait for it to finish before sending another one.';
const ACTIVE_CONVERSATION_MESSAGE =
  'Another conversation is in progress. Please wait for it to complete.';

export class TelegramGateway {
  private bot: Telegraf;
  private prisma: PrismaClient;
  private chatRepo: ChatRepository;
  private agentRunner: AgentRunner;
  private natieService: NatieService;
  private readonly agentLockService: AgentLockService;

  constructor(fastify: FastifyInstance, agentLockService: AgentLockService) {
    const token = process.env.TELEGRAM_TOKEN;
    if (!token) {
      throw new Error('TELEGRAM_TOKEN environment variable is required');
    }

    this.bot = new Telegraf(token);
    this.prisma = fastify.prisma;
    this.agentLockService = agentLockService;
    this.chatRepo = new ChatRepository(this.prisma);
    const messageRepo = new MessageRepository(this.prisma);
    const modelPricingRepo = new ModelPricingRepository(this.prisma);
    const tokenUsageRepo = new TokenUsageRepository(this.prisma);
    const tokenUsageService = new TokenUsageService(
      modelPricingRepo,
      tokenUsageRepo
    );
    this.agentRunner = new AgentRunner({
      prisma: this.prisma,
      messageRepo,
      tokenUsageService,
    });

    const gmailAccountRepo = new GmailAccountRepository(this.prisma);
    const gmailService = new GmailOAuthService(gmailAccountRepo);
    const xAccountRepo = new XAccountRepository(this.prisma);
    const calendarAccountRepo = new CalendarAccountRepository(this.prisma);
    const calendarService = new CalendarOAuthService(calendarAccountRepo);

    this.natieService = new NatieService(
      this.prisma,
      gmailService,
      gmailAccountRepo,
      xAccountRepo,
      calendarService,
      calendarAccountRepo
    );
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

    // Show typing indicator
    await ctx.sendChatAction('typing');

    const chat = await this.chatRepo.getOrCreate(
      telegramSettings.userId,
      'telegram',
      'Telegram'
    );

    const response = await this.getResponse(
      telegramSettings.userId,
      chat.id,
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

  private async getResponse(
    userId: string,
    conversationId: string,
    message: string
  ): Promise<string> {
    const abortController = new AbortController();
    const isLockAcquired = await this.agentLockService.acquire(
      userId,
      'telegram'
    );
    if (!isLockAcquired) {
      const activeChannel =
        await this.agentLockService.getActiveChannel(userId);
      if (activeChannel === 'web') {
        return ACTIVE_WEB_CONVERSATION_MESSAGE;
      }

      if (activeChannel === 'telegram') {
        return ACTIVE_TELEGRAM_CONVERSATION_MESSAGE;
      }

      return ACTIVE_CONVERSATION_MESSAGE;
    }

    try {
      const mainAgent = await this.natieService.createMainAgent(userId);

      const result = await this.agentRunner.invoke(mainAgent, {
        conversationId,
        userId,
        message,
        abortController,
        channel: 'telegram',
      });

      const lastMessage = result.messages.at(-1);
      if (lastMessage?.type === 'ai') {
        return String(lastMessage.content);
      }

      return 'I processed your request but could not generate a response.';
    } catch (error) {
      console.error('Error processing with agent:', error);
      return 'Sorry, I encountered an error while processing your request.';
    } finally {
      await this.agentLockService.release(userId);
    }
  }

  public async sendMessage(
    telegramUserId: string,
    text: string
  ): Promise<boolean> {
    try {
      await this.bot.telegram.sendMessage(telegramUserId, text);
      return true;
    } catch (error) {
      console.error('Error sending Telegram message:', error);
      return false;
    }
  }

  public async sendMessageToUser(
    userId: string,
    text: string
  ): Promise<boolean> {
    const telegramSettings = await this.prisma.telegramSettings.findUnique({
      where: { userId },
    });

    if (!telegramSettings) {
      return false;
    }

    return this.sendMessage(telegramSettings.telegramUserId, text);
  }

  public start() {
    this.setupListeners();
    this.bot.launch();
    console.log('🤖 Telegram bot started');
  }

  public stop() {
    this.bot.stop();
    console.log('🤖 Telegram bot stopped');
  }
}
