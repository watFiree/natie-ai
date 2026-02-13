import { HumanMessage } from '@langchain/core/messages';
import { tool } from 'langchain';
import { z } from 'zod';
import { createAgent } from './createAgent';
import { createSystemPrompt } from './system';
import { createTools } from './tools';
import type { TickTickTokenProvider } from './tools/consts';

export interface TickTickSubagentDeps {
  tokenProvider: TickTickTokenProvider;
}

export function createTickTickSubagentTool(deps: TickTickSubagentDeps) {
  const systemPrompt = createSystemPrompt();
  const tools = createTools(deps.tokenProvider);
  const agent = createAgent(systemPrompt, tools);

  return tool(
    async ({ query }) => {
      const result = await agent.invoke({
        messages: [new HumanMessage(query)],
      });
      return String(result.messages.at(-1)?.content ?? '');
    },
    {
      name: 'ticktick_agent',
      description:
        'Handle TickTick task management: create, update, complete, delete tasks, view projects and task lists. Use this when the user wants to interact with their TickTick tasks.',
      schema: z.object({
        query: z
          .string()
          .describe('The TickTick task-related request or question to handle'),
      }),
    }
  );
}
