import { z } from 'zod';

export const NatieChatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  type: z.enum(['stream', 'invoke']),
});

export type NatieChatRequest = z.infer<typeof NatieChatRequestSchema>;
