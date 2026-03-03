import { HumanMessage } from '@langchain/core/messages';
import { tool } from 'langchain';
import { z } from 'zod';
import { createAgent } from './createAgent';
import { createSystemPrompt } from './system';
import { createTools } from './tools';
import type { TokenProvider } from './tools/consts';

export interface CalendarSubagentDeps {
  tokenProvider: TokenProvider;
  calendarAccounts: string[];
}

export function createCalendarSubagentTool(deps: CalendarSubagentDeps) {
  const systemPrompt = createSystemPrompt(deps.calendarAccounts);
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
      name: 'google_calendar_agent',
      description:
        'Handle Google Calendar tasks: view events, create events, delete events. Use this when the user wants to interact with their calendar.',
      schema: z.object({
        query: z
          .string()
          .describe('The calendar-related task or question to handle'),
      }),
    }
  );
}
