import {
  GmailBaseToolParams,
  GmailCreateDraft,
  GmailGetMessage,
  GmailGetThread,
  GmailSearch,
  GmailSendMessage,
} from '@langchain/community/tools/gmail';
import { StructuredTool } from '@langchain/core/tools';

const gmailParamsFactory = (email: string, accessToken: () => Promise<string>): GmailBaseToolParams => ({
  credentials: {
    clientEmail: email,
    privateKey: process.env.GMAIL_PRIVATE_KEY,
    accessToken: accessToken,
  },
});

export const createTools = (emailAccounts: {email: string, accessToken: () => Promise<string>}[]): StructuredTool[] => emailAccounts.map(({ email, accessToken }) => [
    new GmailCreateDraft(gmailParamsFactory(email, accessToken)),
    new GmailGetMessage(gmailParamsFactory(email, accessToken)),
    new GmailGetThread(gmailParamsFactory(email, accessToken)),
    new GmailSearch(gmailParamsFactory(email, accessToken)),
    new GmailSendMessage(gmailParamsFactory(email, accessToken)),
  ]).flat();
