import { GmailCreateDraft } from '@langchain/community/tools/gmail';
import { TokenProvider } from './consts';
import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

export class GmailCreateDraftTool extends StructuredTool {
  name = 'gmail_create_draft';
  description = 'Create a Gmail draft message for selected account';

  schema = z.object({
    accountEmail: z.string().email(),
    message: z.string().optional(),
    to: z.string().email(),
    subject: z.string(),
    body: z.string(),
  });

  constructor(private readonly tokenProvider: TokenProvider) {
    super();
  }

  async _call(input: {
    accountEmail: string;
    message?: string;
    to: string;
    subject: string;
    body: string;
  }) {
    const token = await this.tokenProvider(input.accountEmail);

    const tool = new GmailCreateDraft({
      credentials: {
        clientEmail: input.accountEmail,
        privateKey: process.env.GMAIL_PRIVATE_KEY,
        accessToken: token,
      },
    });

    return tool.invoke({
      message: input.message,
      to: input.to,
      subject: input.subject,
      body: input.body,
    });
  }
}
