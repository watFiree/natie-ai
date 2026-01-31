import { z } from 'zod';

export const AgentRequestSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  type: z.enum(['stream', 'invoke']),
  agentConversationId: z.string(),
});

export type AgentRequest = z.infer<typeof AgentRequestSchema>;

export const CreateXAgentSchema = z.object({
  userAgentId: z.string(),
});

export type CreateXAgent = z.infer<typeof CreateXAgentSchema>;