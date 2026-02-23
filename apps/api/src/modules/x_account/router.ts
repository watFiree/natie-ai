import { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { XAccountRepository } from './repository';
import { authHandler } from '../auth/handler';
import {
  SaveXAccountSchema,
  XAccountResponseSchema,
  DeleteXAccountResponseSchema,
} from './schema';
import { ErrorResponseSchema } from '../../common/schema';

export const XAccountRouter = async (fastify: FastifyInstance) => {
  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();
  const repository = new XAccountRepository(fastify.prisma);

  typedFastify.get(
    '/',
    {
      preHandler: authHandler,
      schema: {
        response: {
          200: XAccountResponseSchema,
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
          return reply.code(404).send({ error: 'No X account found' });
        }

        return reply.send({
          id: account.id,
          createdAt: account.createdAt,
          updatedAt: account.updatedAt,
        });
      } catch (err) {
        req.log.error(err, 'Failed to get X account');
        return reply.code(500).send({ error: 'Internal server error' });
      }
    }
  );

  typedFastify.post(
    '/',
    {
      preHandler: authHandler,
      schema: {
        body: SaveXAccountSchema,
        response: {
          200: XAccountResponseSchema,
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
        const { authToken, ct0 } = req.body;

        const account = await repository.upsert({
          userId: req.user.id,
          authToken,
          ct0,
        });

        return reply.send({
          id: account.id,
          createdAt: account.createdAt,
          updatedAt: account.updatedAt,
        });
      } catch (err) {
        req.log.error(err, 'Failed to save X account');
        return reply.code(500).send({ error: 'Internal server error' });
      }
    }
  );

  typedFastify.delete(
    '/',
    {
      preHandler: authHandler,
      schema: {
        response: {
          200: DeleteXAccountResponseSchema,
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
          return reply.code(404).send({ error: 'Not Found' });
        }

        await repository.delete(req.user.id);

        return reply.send({ success: true });
      } catch (err) {
        req.log.error(err, 'Failed to delete X account');
        return reply.code(500).send({ error: 'Internal server error' });
      }
    }
  );
};
