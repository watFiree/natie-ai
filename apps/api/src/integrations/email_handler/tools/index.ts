import { StructuredTool } from '@langchain/core/tools';
import { GmailCreateDraftTool } from './draft';
import { GmailGetMessageTool } from './getMessage';
import { GmailGetThreadTool } from './getThread';
import { GmailSearchTool } from './search';
import { GmailSendMessageTool } from './sendMessage';
import { TokenProvider } from './consts';

export const createTools = (tokenProvider: TokenProvider): StructuredTool[] => [
  new GmailCreateDraftTool(tokenProvider),
  new GmailGetMessageTool(tokenProvider),
  new GmailGetThreadTool(tokenProvider),
  new GmailSearchTool(tokenProvider),
  new GmailSendMessageTool(tokenProvider),
];
