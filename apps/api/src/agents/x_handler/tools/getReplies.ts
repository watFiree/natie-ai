import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { XClientProvider } from './consts';

interface RepliesResult {
  success: boolean;
  replies?: unknown[];
  nextCursor?: string;
  error?: string;
}

export class XGetRepliesTool extends StructuredTool {
  name = 'x_get_replies';
  description = 'Get replies to a specific tweet from X (Twitter)';
  MAX_PAGES = 6;

  schema = z.object({
    tweetId: z.string().describe('The tweet ID to get replies for'),
    pagesCount: z
      .number()
      .int()
      .positive()
      .max(this.MAX_PAGES)
      .optional()
      .describe(
        `Number of pages to fetch (default: 1, max: ${this.MAX_PAGES})`
      ),
  });

  constructor(private readonly clientProvider: XClientProvider) {
    super();
  }

  async _call(input: {
    tweetId: string;
    pagesCount?: number;
  }): Promise<string> {
    try {
      const client = await this.clientProvider();
      const pagesCount = Math.min(input.pagesCount ?? 1, this.MAX_PAGES);
      const result = await client.getRepliesPaged(input.tweetId, {
        includeRaw: false,
        maxPages: pagesCount,
      });

      if (!result.success) {
        const errorResult: RepliesResult = {
          success: false,
          error: result.error,
        };
        return JSON.stringify(errorResult, null, 2);
      }

      if (result.tweets.length === 0) {
        const emptyResult: RepliesResult = {
          success: true,
          replies: [],
        };
        return JSON.stringify(emptyResult, null, 2);
      }

      const replies = result.tweets.map((tweet) => ({
        id: tweet.id,
        text: tweet.text,
        author: tweet.author,
        createdAt: tweet.createdAt,
        replyCount: tweet.replyCount,
        retweetCount: tweet.retweetCount,
        likeCount: tweet.likeCount,
        media: tweet.media?.map((m) => ({ type: m.type, url: m.url })),
      }));

      const successResult: RepliesResult = {
        success: true,
        replies,
        nextCursor: result.nextCursor,
      };
      return JSON.stringify(successResult, null, 2);
    } catch (err) {
      const errorResult: RepliesResult = {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
      return JSON.stringify(errorResult);
    }
  }
}
