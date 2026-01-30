import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { XClientProvider } from './consts';

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
    const client = await this.clientProvider();
    const result = await client.getUserTweets(input.userId, input.count ?? 20);

    if (!result.success) {
      return `Error fetching user tweets: ${(result as { error: string }).error}`;
    }

    if (result.tweets.length === 0) {
      return 'No tweets found for this user.';
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

    return JSON.stringify({ tweets, nextCursor: result.nextCursor }, null, 2);
  }
}
