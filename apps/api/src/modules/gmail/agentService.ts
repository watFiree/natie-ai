import { createAgent as createLangChainAgent, ReactAgent } from 'langchain';
import type { PrismaClient } from '../../../prisma/generated/prisma/client';
import { GmailAccountRepository } from './repository';
import { GmailOAuthService } from './service';
import { createSystemPrompt } from '../../integrations/gmail/system';
import { createTools } from '../../integrations/gmail/tools';
import { model } from '../../integrations/gmail/model';

export class GmailAgentService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly gmailService: GmailOAuthService,
    private readonly gmailAccountRepo: GmailAccountRepository
  ) {}

  async createAgent(userId: string): Promise<ReactAgent | null> {
    const emailAccounts = await this.gmailAccountRepo.findByUserId(userId);

    if (emailAccounts.length === 0) {
      return null;
    }

    const settings = await this.prisma.emailIntegrationSettings.findFirst({
      where: { userId },
    });

    const systemPrompt = createSystemPrompt(
      settings?.labels ?? [],
      emailAccounts.map((account) => account.email)
    );

    const tokenProvider = (email: string) =>
      this.gmailService.getEnsuredAccessToken(userId, email);

    const tools = createTools(tokenProvider);

    return createLangChainAgent({
      model,
      systemPrompt,
      tools,
    });
  }
}
