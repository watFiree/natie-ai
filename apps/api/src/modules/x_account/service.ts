import { createAgent as createLangChainAgent, ReactAgent } from 'langchain';
import { XAccountRepository } from './repository';
import { createClient } from '../../integrations/x/clientFactory';
import { createSystemPrompt } from '../../integrations/x/system';
import { createTools } from '../../integrations/x/tools';
import { model } from '../../integrations/x/model';

export class XAgentService {
  constructor(private readonly xAccountRepo: XAccountRepository) {}

  async createAgent(userId: string): Promise<ReactAgent | null> {
    const xAccount = await this.xAccountRepo.findByUserId(userId);

    if (!xAccount) {
      return null;
    }

    const systemPrompt = createSystemPrompt();
    const clientProvider = () =>
      createClient({
        authToken: xAccount.authToken,
        ct0: xAccount.ct0,
      });
    const tools = createTools(clientProvider);

    return createLangChainAgent({
      model,
      systemPrompt,
      tools,
    });
  }
}
