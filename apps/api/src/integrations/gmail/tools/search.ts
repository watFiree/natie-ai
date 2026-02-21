import { GmailSearch } from '@langchain/community/tools/gmail';
import { TokenProvider } from './consts';
import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

export class GmailSearchTool extends StructuredTool {
  name = 'gmail_search';
  description = 'Search Gmail messages for selected account';

  schema = z.object({
    accountEmail: z.string().email(),
    query: z.string(),
  });

  constructor(private readonly tokenProvider: TokenProvider) {
    super();
  }

  async _call(input: { accountEmail: string; query: string }) {
    const token = await this.tokenProvider(input.accountEmail);

    const tool = new GmailSearch({
      credentials: {
        clientEmail: input.accountEmail,
        privateKey: process.env.GMAIL_PRIVATE_KEY,
        accessToken: token,
      },
    });

    return tool.invoke({ query: input.query });
  }
}
