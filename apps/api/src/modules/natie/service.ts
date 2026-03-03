import { createAgent as createLangChainAgent, ReactAgent } from 'langchain';
import type { PrismaClient } from '../../../prisma/generated/prisma/client';
import {
  createEmailSubagentTool,
  type EmailSubagentDeps,
} from '../../integrations/gmail/agent';
import {
  createXSubagentTool,
  type XSubagentDeps,
} from '../../integrations/x/agent';
import {
  createCalendarSubagentTool,
  type CalendarSubagentDeps,
} from '../../integrations/google_calendar/agent';
import { createClient as createXClient } from '../../integrations/x/clientFactory';
import type { GmailOAuthService } from '../gmail/service';
import type { GmailAccountRepository } from '../gmail/repository';
import type { CalendarOAuthService } from '../google_calendar/service';
import type { CalendarAccountRepository } from '../google_calendar/repository';
import type { XAccountRepository } from '../../modules/x_account/repository';
import { model } from './model';
import { createSystemPrompt } from './system';

export class NatieService {
  constructor(
    private prisma: PrismaClient,
    private gmailService: GmailOAuthService,
    private gmailAccountRepo: GmailAccountRepository,
    private xAccountRepo: XAccountRepository,
    private calendarService: CalendarOAuthService,
    private calendarAccountRepo: CalendarAccountRepository
  ) {}

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

      const xDeps: XSubagentDeps = { clientProvider };
      subagentTools.push(createXSubagentTool(xDeps));
    }

    // Google Calendar subagent (if user has calendar connected)
    const calendarAccounts =
      await this.calendarAccountRepo.findByUserId(userId);
    if (calendarAccounts.length > 0) {
      const tokenProvider = (email: string) =>
        this.calendarService.getEnsuredAccessToken(userId, email);

      const calendarDeps: CalendarSubagentDeps = {
        tokenProvider,
        calendarAccounts: calendarAccounts.map((a) => a.email),
      };
      subagentTools.push(createCalendarSubagentTool(calendarDeps));
    }

    return createLangChainAgent({
      model,
      systemPrompt: createSystemPrompt(),
      tools: subagentTools,
    });
  }
}
