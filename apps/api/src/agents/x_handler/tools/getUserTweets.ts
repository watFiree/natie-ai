import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { XClientProvider } from './consts';

interface UserTweetsResult {
  success: boolean;
  tweets?: unknown[];
  nextCursor?: string;
  error?: string;
}

export class XGetUserTweetsTool extends StructuredTool {
  name = 'x_get_user_tweets';
  description = 'Get tweets from a specific X (Twitter) user by their user ID';

  schema = z.object({
    userId: z
      .string()
      .describe(
        'The user ID of the X account (numeric ID, not username). Use search to find user ID first if needed.'
      ),
    count: z
      .number()
      .positive()
      .optional()
      .describe('Number of tweets to fetch (default: 20)'),
  });

  constructor(private readonly clientProvider: XClientProvider) {
    super();
  }

  async _call(input: { userId: string; count?: number }) {
    try {
      const client = await this.clientProvider();
      const result = await client.getUserTweets(
        input.userId,
        input.count ?? 20
      );

      if (!result.success) {
        const envelope: UserTweetsResult = {
          success: false,
          error: result.error,
        };
        return JSON.stringify(envelope, null, 2);
      }

      if (result.tweets.length === 0) {
        const envelope: UserTweetsResult = {
          success: true,
          tweets: [],
        };
        return JSON.stringify(envelope, null, 2);
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

      const envelope: UserTweetsResult = {
        success: true,
        tweets,
        nextCursor: result.nextCursor,
      };
      return JSON.stringify(envelope, null, 2);
    } catch (err) {
      const envelope: UserTweetsResult = {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
      return JSON.stringify(envelope);
    }
  }
}
