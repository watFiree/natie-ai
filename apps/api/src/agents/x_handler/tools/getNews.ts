import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { XClientProvider } from './consts';

export class XGetNewsTool extends StructuredTool {
  name = 'x_get_news';
  description =
    'Get trending news from X (Twitter) explore tab. Returns news items with headlines, categories, and related tweets.';

  schema = z.object({
    count: z
      .number()
      .positive()
      .optional()
      .describe('Number of news items to fetch (default: 10)'),
    tabs: z
      .array(z.enum(['forYou', 'trending', 'news', 'sports', 'entertainment']))
      .optional()
      .describe('Specific tabs to fetch from (default: all tabs)'),
    aiOnly: z
      .boolean()
      .optional()
      .describe('Filter to show only AI-curated news items'),
    withTweets: z
      .boolean()
      .optional()
      .describe('Also fetch related tweets for each news item'),
  });

  constructor(private readonly clientProvider: XClientProvider) {
    super();
  }

  async _call(input: {
    count?: number;
    tabs?: ('forYou' | 'trending' | 'news' | 'sports' | 'entertainment')[];
    aiOnly?: boolean;
    withTweets?: boolean;
  }) {
    try {
      const client = await this.clientProvider();
      const result = await client.getNews(input.count ?? 10, {
        tabs: input.tabs,
        aiOnly: input.aiOnly,
        withTweets: input.withTweets,
        tweetsPerItem: input.withTweets ? 5 : undefined,
      });

      if (!result.success) {
        return `Error fetching news: ${(result as { error: string }).error}`;
      }

      if (result.items.length === 0) {
        return 'No news items found.';
      }

      const news = result.items.map((item) => ({
        id: item.id,
        headline: item.headline,
        category: item.category,
        timeAgo: item.timeAgo,
        postCount: item.postCount,
        description: item.description,
        url: item.url,
        tweets: item.tweets?.map((tweet) => ({
          id: tweet.id,
          text: tweet.text,
          author: tweet.author,
        })),
      }));

      return JSON.stringify(news, null, 2);
    } catch (err) {
      return `Error fetching news: ${err instanceof Error ? err.message : String(err)}`;
    }
  }
}
