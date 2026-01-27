import { User } from '../../prisma/generated/prisma/client';

declare module 'fastify' {
  interface FastifyRequest {
    user?: User | null;
  }
}
