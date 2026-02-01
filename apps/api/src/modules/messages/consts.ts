import { LangChainMessageType } from '../../../prisma/generated/prisma/client';

export type CreateMessageData = {
  conversationId: string;
  type: LangChainMessageType;
  content: string;
  toolCallId?: string;
  toolName?: string;
};

export type CreateTelegramMessageData = {
  conversationId: string;
  type: LangChainMessageType;
  content: string;
  toolCallId?: string;
  toolName?: string;
};
