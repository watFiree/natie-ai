import { User } from '../../prisma/generated/prisma/client';
import type { AgentLockService } from '../modules/agent_lock/service';

declare module 'fastify' {
  interface FastifyInstance {
    agentLockService: AgentLockService;
  }

  interface FastifyRequest {
    user?: User | null;
  }
}
