import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { XClientProvider } from './consts';

interface BookmarksResult {
  success: boolean;
  bookmarks?: unknown[];
  nextCursor?: string;
  error?: string;
}

export class XGetBookmarksTool extends StructuredTool {
  name = 'x_get_bookmarks';
  description =
    "Get bookmarked tweets from the authenticated user's X (Twitter) account";

  schema = z.object({
    count: z
      .number()
      .int()
      .positive()
      .optional()
      .describe('Number of bookmarks to fetch (default: 20)'),
  });

  constructor(private readonly clientProvider: XClientProvider) {
    super();
  }

  async _call(input: { count?: number }) {
    try {
      const client = await this.clientProvider();
      const result = await client.getBookmarks(input.count ?? 20);

      if (!result.success) {
        const errorResult: BookmarksResult = {
          success: false,
          error: result.error,
        };
        return JSON.stringify(errorResult, null, 2);
      }

      if (result.tweets.length === 0) {
        const emptyResult: BookmarksResult = {
          success: true,
          bookmarks: [],
        };
        return JSON.stringify(emptyResult, null, 2);
      }

      const bookmarks = result.tweets.map((tweet) => ({
        id: tweet.id,
        text: tweet.text,
        author: tweet.author,
        createdAt: tweet.createdAt,
        replyCount: tweet.replyCount,
        retweetCount: tweet.retweetCount,
        likeCount: tweet.likeCount,
        media: tweet.media?.map((m) => ({ type: m.type, url: m.url })),
        quotedTweet: tweet.quotedTweet
          ? {
              id: tweet.quotedTweet.id,
              text: tweet.quotedTweet.text,
              author: tweet.quotedTweet.author,
            }
          : undefined,
      }));

      const successResult: BookmarksResult = {
        success: true,
        bookmarks,
        nextCursor: result.nextCursor,
      };
      return JSON.stringify(successResult, null, 2);
    } catch (err) {
      const errorResult: BookmarksResult = {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
      return JSON.stringify(errorResult, null, 2);
    }
  }
}
