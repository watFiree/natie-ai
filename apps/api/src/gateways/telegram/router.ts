import { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { Prisma } from '../../../prisma/generated/prisma/client';
import { TelegramSettingsRepository } from './repository';
import { authHandler } from '../../modules/auth/handler';
import {
  SaveTelegramSettingsSchema,
  TelegramSettingsResponseSchema,
  SuccessResponseSchema,
  ErrorResponseSchema,
} from './schema';

export const TelegramSettingsRouter = async (fastify: FastifyInstance) => {
  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();
  const repository = new TelegramSettingsRepository(fastify.prisma);

  typedFastify.get(
    '/',
    {
      preHandler: authHandler,
      schema: {
        response: {
          200: TelegramSettingsResponseSchema,
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
        const settings = await repository.findByUserId(req.user.id);

        if (!settings) {
          return reply.code(404).send({ error: 'No Telegram settings found' });
        }

        return reply.send({
          id: settings.id,
          telegramUserId: settings.telegramUserId,
          createdAt: settings.createdAt.toISOString(),
          updatedAt: settings.updatedAt.toISOString(),
        });
      } catch (err) {
        req.log.error(err, 'Failed to get Telegram settings');
        return reply.code(500).send({ error: 'Internal server error' });
      }
    }
  );

  typedFastify.post(
    '/',
    {
      preHandler: authHandler,
      schema: {
        body: SaveTelegramSettingsSchema,
        response: {
          200: TelegramSettingsResponseSchema,
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
        const { telegramUserId } = req.body;

        const settings = await repository.upsert({
          userId: req.user.id,
          telegramUserId,
        });

        return reply.send({
          id: settings.id,
          telegramUserId: settings.telegramUserId,
          createdAt: settings.createdAt.toISOString(),
          updatedAt: settings.updatedAt.toISOString(),
        });
      } catch (err) {
        req.log.error(err, 'Failed to save Telegram settings');
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
        await repository.delete(req.user.id);

        return reply.send({ success: true });
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2025'
        ) {
          return reply.code(404).send({ error: 'Not Found' });
        }

        req.log.error(err, 'Failed to delete Telegram settings');
        return reply.code(500).send({ error: 'Internal server error' });
      }
    }
  );
};
