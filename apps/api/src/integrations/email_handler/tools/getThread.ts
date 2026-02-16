import { GmailGetThread } from '@langchain/community/tools/gmail';
import { TokenProvider } from './consts';
import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

export class GmailGetThreadTool extends StructuredTool {
  name = 'gmail_get_thread';
  description = 'Get a Gmail thread by ID for selected account';

  schema = z.object({
    accountEmail: z.string().email(),
    threadId: z.string(),
  });

  constructor(private readonly tokenProvider: TokenProvider) {
    super();
  }

  async _call(input: { accountEmail: string; threadId: string }) {
    const token = await this.tokenProvider(input.accountEmail);

    const tool = new GmailGetThread({
      credentials: {
        clientEmail: input.accountEmail,
        accessToken: token,
      },
    });

    return tool.invoke({ threadId: input.threadId });
  }
}
