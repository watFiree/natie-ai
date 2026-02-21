import { z } from 'zod';
import { ChatType } from '../../../prisma/generated/prisma/client';

export const ChatRequestSchema = z.object({
  chatType: z.enum(ChatType),
});

export const ChatMessageRequestSchema = z.object({
  chatType: z.enum(ChatType),
  message: z.string().min(1, 'Message is required'),
});

export type ChatMessageRequest = z.infer<typeof ChatMessageRequestSchema>;
