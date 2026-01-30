import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { XClientProvider } from './consts';

export class XGetBookmarksTool extends StructuredTool {
  name = 'x_get_bookmarks';
  description =
    "Get bookmarked tweets from the authenticated user's X (Twitter) account";

  schema = z.object({
    count: z
      .number()
      .positive()
      .optional()
      .describe('Number of bookmarks to fetch (default: 20)'),
  });

  constructor(private readonly clientProvider: XClientProvider) {
    super();
  }

  async _call(input: { count?: number }) {
    const client = await this.clientProvider();
    const result = await client.getBookmarks(input.count ?? 20);

    if (!result.success) {
      return `Error fetching bookmarks: ${(result as { error: string }).error}`;
    }

    if (result.tweets.length === 0) {
      return 'No bookmarks found.';
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

    return JSON.stringify(
      { bookmarks, nextCursor: result.nextCursor },
      null,
      2
    );
  }
}
