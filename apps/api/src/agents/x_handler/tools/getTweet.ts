import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { XClientProvider } from './consts';

interface TweetResult {
  success: boolean;
  tweet?: unknown;
  error?: string;
}

export class XGetTweetTool extends StructuredTool {
  name = 'x_get_tweet';
  description =
    'Get a specific tweet by its ID from X (Twitter). Returns the full tweet data including text, author, engagement stats, and media.';

  schema = z.object({
    tweetId: z.string().describe('The tweet ID to fetch'),
  });

  constructor(private readonly clientProvider: XClientProvider) {
    super();
  }

  async _call(input: { tweetId: string }) {
    try {
      const client = await this.clientProvider();
      const result = await client.getTweet(input.tweetId);

      if (!result.success) {
        return JSON.stringify(
          {
            success: false,
            error: result.error,
          } as TweetResult,
          null,
          2
        );
      }

      if (!result.tweet) {
        return JSON.stringify(
          {
            success: true,
            tweet: null,
          } as TweetResult,
          null,
          2
        );
      }

      const tweet = {
        id: result.tweet.id,
        text: result.tweet.text,
        author: result.tweet.author,
        authorId: result.tweet.authorId,
        createdAt: result.tweet.createdAt,
        replyCount: result.tweet.replyCount,
        retweetCount: result.tweet.retweetCount,
        likeCount: result.tweet.likeCount,
        conversationId: result.tweet.conversationId,
        inReplyToStatusId: result.tweet.inReplyToStatusId,
        media: result.tweet.media?.map((m) => ({
          type: m.type,
          url: m.url,
          previewUrl: m.previewUrl,
          videoUrl: m.videoUrl,
        })),
        article: result.tweet.article,
        quotedTweet: result.tweet.quotedTweet
          ? {
              id: result.tweet.quotedTweet.id,
              text: result.tweet.quotedTweet.text,
              author: result.tweet.quotedTweet.author,
            }
          : undefined,
      };

      return JSON.stringify({
        success: true,
        tweet,
      } as TweetResult);
    } catch (err) {
      return JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      } as TweetResult);
    }
  }
}
