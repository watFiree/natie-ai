import { HumanMessage } from '@langchain/core/messages';
import { createAgent } from 'langchain';
import { z } from 'zod';
import { model } from './model';
import { createSystemPrompt } from './system';
import { AgentInfo, ExtendedAgentType } from './consts';

const AgentTypeSchema = z.union([
  z.literal('chat'),
  z.literal('x'),
  z.literal('email'),
]);

export class AgentDelegate {
  async run(message: string, agents: AgentInfo[]): Promise<ExtendedAgentType> {
    if (agents.length === 0) return 'chat';
    const systemPrompt = createSystemPrompt(agents);
    const agent = createAgent({
      model,
      systemPrompt,
      responseFormat: z.object({
        agent: AgentTypeSchema,
      }),
    });

    try {
      const response = await agent.invoke({
        messages: [new HumanMessage(`Users message: ${message}`)],
      });

      const agentType = response.structuredResponse
        .agent satisfies ExtendedAgentType;

      return agentType;
    } catch (error) {
      console.error('Error in narrowAgent:', error);
      return 'chat';
    }
  }
}
