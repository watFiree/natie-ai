import { HumanMessage } from '@langchain/core/messages';
import { tool } from 'langchain';
import { z } from 'zod';
import { createAgent } from './createAgent';
import { createSystemPrompt } from './system';
import { createTools } from './tools';
import type { TokenProvider } from './tools/consts';

export interface TodoSubagentDeps {
  tokenProvider: TokenProvider;
}

export function createTodoSubagentTool(deps: TodoSubagentDeps) {
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
      name: 'todo_agent',
      description:
        'Handle todo/task management: view tasks, create tasks, update tasks, complete tasks, delete tasks. Use this when the user wants to interact with their todo list or tasks.',
      schema: z.object({
        query: z
          .string()
          .describe('The task-related request or question to handle'),
      }),
    }
  );
}
