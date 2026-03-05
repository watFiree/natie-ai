import { TodoAppAccountRepository } from './repository';
import { authHandler } from '../auth/handler';
import {
  TodoAppAccountResponseSchema,
  SuccessResponseSchema,
} from './schema';
import { ErrorResponseSchema } from '../../common/schema';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';

export const TodoAppRouter = async (fastify: FastifyInstance) => {
  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();
  const repository = new TodoAppAccountRepository(fastify.prisma);

  // GET /account — Check connection status
  typedFastify.get(
    '/account',
    {
      preHandler: authHandler,
      schema: {
        response: {
          200: TodoAppAccountResponseSchema,
          401: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      if (!req.user?.id) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      try {
        const account = await repository.findByUserId(req.user.id);
        if (!account) {
          return reply.send({ connected: false });
        }
        return reply.send({ connected: true, provider: account.provider });
      } catch (err) {
        req.log.error(err, 'Failed to get todo app account');
        return reply.code(500).send({ error: 'Internal server error' });
      }
    }
  );

  // DELETE /account — Disconnect todo app
  typedFastify.delete(
    '/account',
    {
      preHandler: authHandler,
      schema: {
        response: {
          200: SuccessResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      if (!req.user?.id) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      try {
        const account = await repository.findByUserId(req.user.id);
        if (!account) {
          return reply.code(404).send({ error: 'Account not found' });
        }

        await repository.delete(req.user.id);
        return reply.send({ success: true });
      } catch (err) {
        req.log.error(err, 'Error deleting todo app account');
        return reply.code(500).send({ error: 'Internal server error' });
      }
    }
  );
};
