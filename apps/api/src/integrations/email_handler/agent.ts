import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { tool } from 'langchain';
import { z } from 'zod';
import { createAgent } from './createAgent';
import { createSystemPrompt } from './system';
import { createTools } from './tools';
import type { TokenProvider } from './tools/consts';

export interface EmailSubagentDeps {
  tokenProvider: TokenProvider;
  labels: string[];
  emailAccounts: string[];
  onAIMessage?: (message: AIMessage) => Promise<void>;
}

export function createEmailSubagentTool(deps: EmailSubagentDeps) {
  const systemPrompt = createSystemPrompt(deps.labels, deps.emailAccounts);
  const tools = createTools(deps.tokenProvider);
  const agent = createAgent(systemPrompt, tools);

  return tool(
    async ({ query }) => {
      const result = await agent.invoke({
        messages: [new HumanMessage(query)],
      });

      const lastMessage = result.messages.at(-1);
      if (lastMessage instanceof AIMessage && deps.onAIMessage) {
        try {
          await deps.onAIMessage(lastMessage);
        } catch (error) {
          console.error('Failed to track email subagent token usage:', error);
        }
      }

      return String(lastMessage?.content ?? '');
    },
    {
      name: 'email_agent',
      description:
        'Handle email tasks: search, read, draft, send emails via Gmail. Use this when the user wants to interact with their email.',
      schema: z.object({
        query: z
          .string()
          .describe('The email-related task or question to handle'),
      }),
    }
  );
}
