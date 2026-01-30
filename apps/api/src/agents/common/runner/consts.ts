import { MessageRepository } from "../../../modules/messages/repository";
import { PrismaClient } from "../../../../prisma/generated/prisma/client";

export interface AgentContext {
    prisma: PrismaClient;
    messageRepo: MessageRepository;
  }
  
  export interface AgentRunOptions {
    conversationId: string;
    message: string;
    type: 'stream' | 'invoke';
    abortController: AbortController;
  }