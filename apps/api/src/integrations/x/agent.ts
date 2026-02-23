import { HumanMessage } from '@langchain/core/messages';
import { tool } from 'langchain';
import { z } from 'zod';
import { createAgent } from './createAgent';
import { createSystemPrompt } from './system';
import { createTools } from './tools';
import type { XClientProvider } from './tools/consts';

export interface XSubagentDeps {
  clientProvider: XClientProvider;
}

export function createXSubagentTool(deps: XSubagentDeps) {
  const systemPrompt = createSystemPrompt();
  const tools = createTools(deps.clientProvider);
  const agent = createAgent(systemPrompt, tools);

  return tool(
    async ({ query }) => {
      const result = await agent.invoke({
        messages: [new HumanMessage(query)],
      });
      return String(result.messages.at(-1)?.content ?? '');
    },
    {
      name: 'x_agent',
      description:
        'Handle X (Twitter) tasks: search tweets, get timeline, get user tweets, get tweet details, threads, replies, news, and bookmarks. Use this when the user wants to interact with X/Twitter.',
      schema: z.object({
        query: z
          .string()
          .describe('The X/Twitter-related task or question to handle'),
      }),
    }
  );
}
