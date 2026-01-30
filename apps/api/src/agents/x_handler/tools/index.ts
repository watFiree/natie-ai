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

export { XClientProvider } from './consts';
export { XSearchTool } from './search';
export { XGetNewsTool } from './getNews';
export { XGetHomeTimelineTool } from './getHomeTimeline';
export { XGetUserTweetsTool } from './getUserTweets';
export { XGetTweetTool } from './getTweet';
export { XGetThreadTool } from './getThread';
export { XGetRepliesTool } from './getReplies';
export { XGetBookmarksTool } from './getBookmarks';
