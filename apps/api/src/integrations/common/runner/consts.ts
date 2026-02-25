import { MessageRepository } from '../../../modules/messages/repository';
import { TokenUsageService } from '../../../modules/token_usage/service';
import {
  PrismaClient,
  MessageChannel,
} from '../../../../prisma/generated/prisma/client';

export interface AgentContext {
  prisma: PrismaClient;
  messageRepo: MessageRepository;
  tokenUsageService: TokenUsageService;
}

export interface AgentRunOptions {
  conversationId: string;
  userId: string;
  message: string;
  type: 'stream' | 'invoke';
  abortController: AbortController;
  channel: MessageChannel;
}
