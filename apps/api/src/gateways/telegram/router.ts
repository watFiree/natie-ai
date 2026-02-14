import { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { TelegramSettingsRepository } from './repository';
import { authHandler } from '../../modules/auth/handler';
import { SaveTelegramSettingsSchema } from './schema';

export const TelegramSettingsRouter = async (fastify: FastifyInstance) => {
  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();
  const repository = new TelegramSettingsRepository(fastify.prisma);

  typedFastify.get('/', { preHandler: authHandler }, async (req, reply) => {
    if (!req.user?.id) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const settings = await repository.findByUserId(req.user.id);

    if (!settings) {
      return reply.code(404).send({ error: 'No Telegram settings found' });
    }

    return reply.send({
      id: settings.id,
      telegramUserId: settings.telegramUserId,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    });
  });

  typedFastify.post(
    '/',
    {
      preHandler: authHandler,
      schema: {
        body: SaveTelegramSettingsSchema,
      },
    },
    async (req, reply) => {
      if (!req.user?.id) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { telegramUserId } = req.body;

      const settings = await repository.upsert({
        userId: req.user.id,
        telegramUserId,
      });

      return reply.send({
        id: settings.id,
        telegramUserId: settings.telegramUserId,
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt,
      });
    }
  );

  typedFastify.delete('/', { preHandler: authHandler }, async (req, reply) => {
    if (!req.user?.id) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const settings = await repository.findByUserId(req.user.id);
    if (!settings) {
      return reply.code(404).send({ error: 'Not Found' });
    }

    await repository.delete(req.user.id);

    return reply.send({ success: true });
  });
};
