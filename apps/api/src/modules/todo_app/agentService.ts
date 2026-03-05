import { createAgent as createLangChainAgent, ReactAgent } from 'langchain';
import { TodoAppAccountRepository } from './repository';
import { TodoAppTokenService } from './tokenService';
import { createSystemPrompt } from '../../integrations/todo/system';
import { createTools } from '../../integrations/todo/tools';
import { model } from '../../integrations/todo/model';

export class TodoAgentService {
  constructor(
    private readonly tokenService: TodoAppTokenService,
    private readonly todoAppAccountRepo: TodoAppAccountRepository
  ) {}

  async createAgent(userId: string): Promise<ReactAgent | null> {
    const account = await this.todoAppAccountRepo.findByUserId(userId);

    if (!account) {
      return null;
    }

    const systemPrompt = createSystemPrompt();
    const tokenProvider = () =>
      this.tokenService.getEnsuredAccessToken(userId);
    const tools = createTools(tokenProvider);

    return createLangChainAgent({
      model,
      systemPrompt,
      tools,
    });
  }
}
