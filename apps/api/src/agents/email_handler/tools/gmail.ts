import {
  GmailBaseToolParams,
  GmailCreateDraft,
  GmailGetMessage,
  GmailGetThread,
  GmailSearch,
  GmailSendMessage,
} from '@langchain/community/tools/gmail';
import { StructuredTool } from '@langchain/core/tools';

const gmailParams: GmailBaseToolParams = {
  credentials: {
    clientEmail: process.env.GMAIL_CLIENT_EMAIL,
    privateKey: process.env.GMAIL_PRIVATE_KEY,
    // Either (privateKey + clientEmail) or accessToken is required
    accessToken: 'an access token or function to get access token',
  },
};

export const tools: StructuredTool[] = [
  new GmailCreateDraft(gmailParams),
  new GmailGetMessage(gmailParams),
  new GmailGetThread(gmailParams),
  new GmailSearch(gmailParams),
  new GmailSendMessage(gmailParams),
];
