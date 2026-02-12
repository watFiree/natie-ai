import { z } from 'zod';

export const NatieChatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  type: z.enum(['stream', 'invoke']),
  agentConversationId: z.string(),
});

export type NatieChatRequest = z.infer<typeof NatieChatRequestSchema>;

export const CreateNatieConversationSchema = z.object({
  userAgentId: z.string(),
});

export type CreateNatieConversation = z.infer<
  typeof CreateNatieConversationSchema
>;
