import { AgentInfo } from './consts';

export function createSystemPrompt(agents: AgentInfo[]): string {
  const agentDescriptions = agents
    .map((a, i) => `${i + 1}. ${a.name} (${a.type}): ${a.description}`)
    .join('\n');

  return `You are a message routing system. For a given user message and a list of available agents, determine which agent is most appropriate to handle the request. If none return 'chat'

Available agents:
${agentDescriptions}

Respond as structured output says`;
}
