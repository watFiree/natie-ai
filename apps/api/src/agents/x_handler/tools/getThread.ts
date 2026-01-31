import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { XClientProvider } from './consts';

interface ThreadResult {
  success: boolean;
  tweets?: unknown[];
  error?: string;
}

export class XGetThreadTool extends StructuredTool {
  name = 'x_get_thread';
  description =
    'Get all tweets in a thread/conversation starting from a specific tweet ID. Returns the full thread with all replies in the conversation.';

  schema = z.object({
    tweetId: z.string().describe('The tweet ID to start the thread from'),
  });

  constructor(private readonly clientProvider: XClientProvider) {
    super();
  }

  async _call(input: { tweetId: string }) {
    try {
      const client = await this.clientProvider();
      const result = await client.getThread(input.tweetId);

      if (!result.success) {
        return JSON.stringify(
          {
            success: false,
            error: result.error,
          } as ThreadResult,
          null,
          2
        );
      }

      if (result.tweets.length === 0) {
        return JSON.stringify(
          {
            success: true,
            tweets: [],
          } as ThreadResult,
          null,
          2
        );
      }

      const tweets = result.tweets.map((tweet) => ({
        id: tweet.id,
        text: tweet.text,
        author: tweet.author,
        createdAt: tweet.createdAt,
        replyCount: tweet.replyCount,
        retweetCount: tweet.retweetCount,
        likeCount: tweet.likeCount,
        conversationId: tweet.conversationId,
        inReplyToStatusId: tweet.inReplyToStatusId,
        media: tweet.media?.map((m) => ({ type: m.type, url: m.url })),
      }));

      return JSON.stringify(
        {
          success: true,
          tweets,
        } as ThreadResult,
        null,
        2
      );
    } catch (err) {
      return JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      } as ThreadResult);
    }
  }
}
