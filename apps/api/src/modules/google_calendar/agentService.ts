import { createAgent as createLangChainAgent, ReactAgent } from 'langchain';
import { CalendarAccountRepository } from './repository';
import { CalendarOAuthService } from './service';
import { createSystemPrompt } from '../../integrations/google_calendar/system';
import { createTools } from '../../integrations/google_calendar/tools';
import { model } from '../../integrations/google_calendar/model';

export class CalendarAgentService {
  constructor(
    private readonly calendarService: CalendarOAuthService,
    private readonly calendarAccountRepo: CalendarAccountRepository
  ) {}

  async createAgent(userId: string): Promise<ReactAgent | null> {
    const calendarAccounts =
      await this.calendarAccountRepo.findByUserId(userId);

    if (calendarAccounts.length === 0) {
      return null;
    }

    const systemPrompt = createSystemPrompt(
      calendarAccounts.map((account) => account.email)
    );

    const tokenProvider = (email: string) =>
      this.calendarService.getEnsuredAccessToken(userId, email);

    const tools = createTools(tokenProvider);

    return createLangChainAgent({
      model,
      systemPrompt,
      tools,
    });
  }
}
