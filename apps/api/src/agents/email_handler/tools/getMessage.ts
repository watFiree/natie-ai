import { GmailGetMessage } from '@langchain/community/tools/gmail';
import { TokenProvider } from './consts';
import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

export class GmailGetMessageTool extends StructuredTool {
  name = 'gmail_get_message';
  description = 'Get a Gmail message by ID for selected account';

  schema = z.object({
    accountEmail: z.string().email(),
    messageId: z.string(),
  });

  constructor(private readonly tokenProvider: TokenProvider) {
    super();
  }

  async _call(input: { accountEmail: string; messageId: string }) {
    const token = await this.tokenProvider(input.accountEmail);

    const tool = new GmailGetMessage({
      credentials: {
        clientEmail: input.accountEmail,
        privateKey: process.env.GMAIL_PRIVATE_KEY,
        accessToken: token,
      },
    });

    return tool.invoke({ messageId: input.messageId });
  }
}
