import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { XClientProvider } from './consts';

export class XGetRepliesTool extends StructuredTool {
  name = 'x_get_replies';
  description = 'Get replies to a specific tweet from X (Twitter)';

  schema = z.object({
    tweetId: z.string().describe('The tweet ID to get replies for'),
    pagesCount: z
      .number()
      .positive()
      .optional()
      .describe('Number of pages to fetch (default: 1)'),
  });

  constructor(private readonly clientProvider: XClientProvider) {
    super();
  }

  async _call(input: { tweetId: string; pagesCount?: number }) {
    try {
      const client = await this.clientProvider();
      const result = await client.getRepliesPaged(input.tweetId, {
        includeRaw: false,
        maxPages: input.pagesCount ?? 1,
      });

      if (!result.success) {
        return `Error fetching replies: ${(result as { error: string }).error}`;
      }

      if (result.tweets.length === 0) {
        return 'No replies found for this tweet.';
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

      return JSON.stringify(
        { replies, nextCursor: result.nextCursor },
        null,
        2
      );
    } catch (err) {
      return `Error fetching replies: ${err instanceof Error ? err.message : String(err)}`;
    }
  }
}
