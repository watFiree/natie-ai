import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { XClientProvider } from './consts';

interface TimelineResult {
  success: boolean;
  tweets?: unknown[];
  nextCursor?: string;
  error?: string;
}

export class XGetHomeTimelineTool extends StructuredTool {
  name = 'x_get_home_timeline';
  description =
    'Get the home timeline (For You feed) from X (Twitter) for the authenticated user';
  DEFAULT_COUNT = 20;
  MAX_COUNT = 200;

  schema = z.object({
    count: z
      .int()
      .positive()
      .max(this.MAX_COUNT)
      .optional()
      .describe('Number of tweets to fetch (default: 20)'),
    latest: z
      .boolean()
      .optional()
      .describe(
        'Get the latest timeline (chronological) instead of algorithmic For You feed'
      ),
  });

  constructor(private readonly clientProvider: XClientProvider) {
    super();
  }

  async _call(input: { count?: number; latest?: boolean }) {
    try {
      const client = await this.clientProvider();
      const count = Math.min(input.count ?? this.DEFAULT_COUNT, this.MAX_COUNT);
      const result = input.latest
        ? await client.getHomeLatestTimeline(count)
        : await client.getHomeTimeline(count);

      if (!result.success) {
        const response: TimelineResult = {
          success: false,
          error: result.error,
        };
        return JSON.stringify(response, null, 2);
      }

      if (result.tweets.length === 0) {
        const response: TimelineResult = {
          success: true,
          tweets: [],
          nextCursor: result.nextCursor,
        };
        return JSON.stringify(response, null, 2);
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
        quotedTweet: tweet.quotedTweet
          ? {
              id: tweet.quotedTweet.id,
              text: tweet.quotedTweet.text,
              author: tweet.quotedTweet.author,
            }
          : undefined,
      }));

      const response: TimelineResult = {
        success: true,
        tweets,
        nextCursor: result.nextCursor,
      };
      return JSON.stringify(response, null, 2);
    } catch (err) {
      const response: TimelineResult = {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
      return JSON.stringify(response, null, 2);
    }
  }
}
