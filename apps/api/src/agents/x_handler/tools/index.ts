import { StructuredTool } from '@langchain/core/tools';
import { XClientProvider } from './consts';
import { XSearchTool } from './search';
import { XGetNewsTool } from './getNews';
import { XGetHomeTimelineTool } from './getHomeTimeline';
import { XGetUserTweetsTool } from './getUserTweets';
import { XGetTweetTool } from './getTweet';
import { XGetThreadTool } from './getThread';
import { XGetRepliesTool } from './getReplies';
import { XGetBookmarksTool } from './getBookmarks';

export const createTools = (
  clientProvider: XClientProvider
): StructuredTool[] => [
  new XSearchTool(clientProvider),
  new XGetNewsTool(clientProvider),
  new XGetHomeTimelineTool(clientProvider),
  new XGetUserTweetsTool(clientProvider),
  new XGetTweetTool(clientProvider),
  new XGetThreadTool(clientProvider),
  new XGetRepliesTool(clientProvider),
  new XGetBookmarksTool(clientProvider),
];
