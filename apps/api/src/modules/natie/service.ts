import { createAgent as createLangChainAgent, ReactAgent } from 'langchain';
import type { PrismaClient } from '../../../prisma/generated/prisma/client';
import {
  createEmailSubagentTool,
  type EmailSubagentDeps,
} from '../../integrations/email_handler/agent';
import { MODEL_NAME as EMAIL_MODEL_NAME } from '../../integrations/email_handler/model';
import {
  createXSubagentTool,
  type XSubagentDeps,
} from '../../integrations/x_handler/agent';
import { MODEL_NAME as X_MODEL_NAME } from '../../integrations/x_handler/model';
import { createClient as createXClient } from '../../integrations/x_handler/clientFactory';
import type { GmailOAuthService } from '../gmail/service';
import type { GmailAccountRepository } from '../gmail/repository';
import type { XAccountRepository } from '../../modules/x_account/repository';
import { model } from './model';
import { SUPERVISOR_SYSTEM_PROMPT } from './system';
import { TokenUsageRepository, TokenUsageService } from '../token_usage';

export class NatieService {
  private readonly tokenUsageService: TokenUsageService;

  constructor(
    private prisma: PrismaClient,
    private gmailService: GmailOAuthService,
    private gmailAccountRepo: GmailAccountRepository,
    private xAccountRepo: XAccountRepository
  ) {
    this.tokenUsageService = new TokenUsageService(
      new TokenUsageRepository(this.prisma)
    );
  }

  private async trackSubagentUsage(
    userId: string,
    payload: unknown,
    modelName: string
  ): Promise<void> {
    try {
      await this.tokenUsageService.recordUsageFromPayload({
        userId,
        payload,
        fallbackModel: modelName,
      });
    } catch (error) {
      console.error('Failed to record subagent token usage:', error);
    }
  }

  async createMainAgent(userId: string): Promise<ReactAgent> {
    const subagentTools = [];

    // Email subagent (if user has Gmail connected)
    const emailAccounts = await this.gmailAccountRepo.findByUserId(userId);
    if (emailAccounts.length > 0) {
      const settings = await this.prisma.emailIntegrationSettings.findFirst({
        where: { userId },
      });
      const tokenProvider = (email: string) =>
        this.gmailService.getEnsuredAccessToken(userId, email);

      const emailDeps: EmailSubagentDeps = {
        tokenProvider,
        labels: settings?.labels ?? [],
        emailAccounts: emailAccounts.map((a) => a.email),
        onAIMessage: (message) =>
          this.trackSubagentUsage(userId, message, EMAIL_MODEL_NAME),
      };
      subagentTools.push(createEmailSubagentTool(emailDeps));
    }

    // X subagent (if user has X connected)
    const xAccount = await this.xAccountRepo.findByUserId(userId);
    if (xAccount) {
      const clientProvider = () =>
        createXClient({
          authToken: xAccount.authToken,
          ct0: xAccount.ct0,
        });

      const xDeps: XSubagentDeps = {
        clientProvider,
        onAIMessage: (message) =>
          this.trackSubagentUsage(userId, message, X_MODEL_NAME),
      };
      subagentTools.push(createXSubagentTool(xDeps));
    }

    return createLangChainAgent({
      model,
      systemPrompt: SUPERVISOR_SYSTEM_PROMPT,
      tools: subagentTools,
    });
  }
}
