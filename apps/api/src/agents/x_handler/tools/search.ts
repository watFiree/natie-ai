import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { XClientProvider } from './consts';

export class XSearchTool extends StructuredTool {
  name = 'x_search';
  description =
    'Search for tweets on X (Twitter) using a query string. Supports Twitter search operators like "from:user", "to:user", "#hashtag", "since:YYYY-MM-DD", etc.';

  schema = z.object({
    query: z
      .string()
      .describe(
        'The search query. Supports Twitter search operators like "from:username", "to:username", "#hashtag", "since:2024-01-01", "lang:en", etc.'
      ),
    count: z
      .number()
      .optional()
      .describe('Number of tweets to fetch (default: 20)'),
  });

  constructor(private readonly clientProvider: XClientProvider) {
    super();
  }

  async _call(input: { query: string; count?: number }) {
    const client = await this.clientProvider();
    const result = await client.search(input.query, input.count ?? 20);

    if (!result.success) {
      return `Error searching tweets: ${(result as { error: string }).error}`;
    }

    if (result.tweets.length === 0) {
      return 'No tweets found for the given query.';
    }

    const tweets = result.tweets.map((tweet) => ({
      id: tweet.id,
      text: tweet.text,
      author: tweet.author,
      createdAt: tweet.createdAt,
      replyCount: tweet.replyCount,
      retweetCount: tweet.retweetCount,
      likeCount: tweet.likeCount,
      media: tweet.media?.map((m) => ({ type: m.type, url: m.url })),
    }));

    return JSON.stringify({ tweets, nextCursor: result.nextCursor }, null, 2);
  }
}
