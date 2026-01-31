import { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { XAccountRepository } from './repository';
import { authHandler } from '../auth/handler';
import { SaveXAccountSchema } from './schema';

export const XAccountRouter = async (fastify: FastifyInstance) => {
  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();
  const repository = new XAccountRepository(fastify.prisma);

  typedFastify.get('/', { preHandler: authHandler }, async (req, reply) => {
    if (!req.user?.id) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const account = await repository.findByUserId(req.user.id);

    if (!account) {
      return reply.code(404).send({ error: 'No X account found' });
    }

    // Return account without sensitive credentials
    return reply.send({
      id: account.id,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    });
  });

  typedFastify.post(
    '/',
    {
      preHandler: authHandler,
      schema: {
        body: SaveXAccountSchema,
      },
    },
    async (req, reply) => {
      if (!req.user?.id) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

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
    }
  );

  typedFastify.delete('/', { preHandler: authHandler }, async (req, reply) => {
    if (!req.user?.id) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    await repository.delete(req.user.id);

    return reply.send({ success: true });
  });
};
