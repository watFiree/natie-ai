import { User } from '../../prisma/generated/prisma/client';
import type { AgentLockService } from '../modules/agent_lock/service';
import type { TelegramGateway } from '../gateways/telegram/gateway';

declare module 'fastify' {
  interface FastifyInstance {
    agentLockService: AgentLockService;
    telegramGateway?: TelegramGateway;
  }

  interface FastifyRequest {
    user?: User | null;
  }
}
