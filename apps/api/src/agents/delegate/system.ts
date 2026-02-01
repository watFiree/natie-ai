import { AgentInfo } from './consts';

/**
 * Builds a system prompt that instructs a routing system to choose the most appropriate agent for a user message.
 *
 * @param agents - Array of agents to include in the prompt; each will be listed with its index, name, type, and description.
 * @returns The formatted system prompt containing the routing instruction, a numbered list of available agents, and a directive to "Respond as structured output says".
 */
export function createSystemPrompt(agents: AgentInfo[]): string {
  const agentDescriptions = agents
    .map((a, i) => `${i + 1}. ${a.name} (${a.type}): ${a.description}`)
    .join('\n');

  return `You are a message routing system. For a given user message and a list of available agents, determine which agent is most appropriate to handle the request. If none return 'chat'

Available agents:
${agentDescriptions}

Respond as structured output says`;
}