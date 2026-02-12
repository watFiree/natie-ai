import { z } from 'zod';

export const AgentRequestSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  type: z.enum(['stream', 'invoke']),
});

export type AgentRequest = z.infer<typeof AgentRequestSchema>;

export const CreateEmailAgentConversationSchema = z.object({
  userAgentId: z.string(),
});

export type CreateEmailAgentConversation = z.infer<
  typeof CreateEmailAgentConversationSchema
>;
