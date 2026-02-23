import { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { Readable } from 'stream';
import {
  MessageSchema,
  MessagesListSchema,
  ErrorResponseSchema,
} from '../../common/schema';
import { authHandler } from '../auth/handler';
import { ChatRepository } from './repository';
import { MessageRepository } from '../messages/repository';
import { ChatRequestSchema, ChatMessageRequestSchema } from './schema';
import { AgentRunner } from '../../integrations/common/runner';
import { NatieService } from '../natie/service';
import { XAgentService } from '../x_account/service';
import { GmailAgentService } from '../gmail/agentService';
import { GmailOAuthService } from '../gmail/service';
import { GmailAccountRepository } from '../gmail/repository';
import { XAccountRepository } from '../x_account/repository';
import { ChatType } from '../../../prisma/generated/prisma/client';
import { ReactAgent } from 'langchain';
import { z } from 'zod';

const ACTIVE_CONVERSATION_ERROR_MESSAGE =
  'Another conversation is in progress. Please wait for it to complete.';

export const ChatRouter = async (fastify: FastifyInstance) => {
  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();

  // Repositories
  const chatRepo = new ChatRepository(fastify.prisma);
  const messageRepo = new MessageRepository(fastify.prisma);
  const gmailAccountRepo = new GmailAccountRepository(fastify.prisma);
  const xAccountRepo = new XAccountRepository(fastify.prisma);

  // Services
  const gmailService = new GmailOAuthService(gmailAccountRepo);
  const agentRunner = new AgentRunner({ prisma: fastify.prisma, messageRepo });

  // Agent services
  const natieService = new NatieService(
    fastify.prisma,
    gmailService,
    gmailAccountRepo,
    xAccountRepo
  );
  const xAgentService = new XAgentService(xAccountRepo);
  const gmailAgentService = new GmailAgentService(
    fastify.prisma,
    gmailService,
    gmailAccountRepo
  );

  const createAgent = async (
    chatType: ChatType,
    userId: string
  ): Promise<ReactAgent | null> => {
    switch (chatType) {
      case 'natie': {
        const agent = await natieService.createMainAgent(userId);
        return agent;
      }
      case 'x': {
        const agent = await xAgentService.createAgent(userId);
        return agent;
      }
      case 'email': {
        const agent = await gmailAgentService.createAgent(userId);
        return agent;
      }
      default:
        return null;
    }
  };

  // GET /messages - Get messages for a specific chat type
  typedFastify.get(
    '/messages',
    {
      preHandler: authHandler,
      schema: {
        querystring: ChatRequestSchema,
        response: {
          200: MessagesListSchema,
          401: ErrorResponseSchema,
          400: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      if (!req.user?.id) return reply.code(401).send({ error: 'Unauthorized' });

      const { chatType } = req.query;

      try {
        const conversation = await chatRepo.getOrCreate(req.user.id, chatType);
        const messages = await messageRepo.findByConversationId(
          conversation.id,
          30
        );
        const formattedMessages = messages.map((message) =>
          MessageSchema.parse({
            ...message,
            createdAt: message.createdAt.toISOString(),
          })
        );

        return reply.send({ messages: formattedMessages });
      } catch (error) {
        return reply.code(500).send({ error: 'Internal server error' });
      }
    }
  );

  // POST /chat - Invoke mode (returns JSON)
  typedFastify.post(
    '/chat',
    {
      preHandler: authHandler,
      schema: {
        body: ChatMessageRequestSchema,
        response: {
          200: MessagesListSchema,
          401: ErrorResponseSchema,
          400: ErrorResponseSchema,
          429: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      if (!req.user?.id) return reply.code(401).send({ error: 'Unauthorized' });
      const userId = req.user.id;

      const { message, chatType } = req.body;

      if (chatType === 'telegram') {
        return reply
          .code(400)
          .send({ error: 'Telegram chat is not supported yet' });
      }

      if (chatType === 'natie') {
        const isLockAcquired = await fastify.agentLockService.acquire(
          userId,
          'web'
        );
        if (!isLockAcquired) {
          return reply
            .code(429)
            .send({ error: ACTIVE_CONVERSATION_ERROR_MESSAGE });
        }
      }

      try {
        const agent = await createAgent(chatType, userId);

        if (!agent) {
          return reply.code(400).send({
            error: `No connected account found for ${chatType}. Please connect your account first.`,
          });
        }

        const conversation = await chatRepo.getOrCreate(userId, chatType);

        const abortController = new AbortController();
        req.raw.on('close', () => abortController.abort());

        const result = await agentRunner.invoke(agent, {
          conversationId: conversation.id,
          message,
          abortController,
          channel: 'web',
        });

        const formattedMessages = result.messages.map((message) =>
          MessageSchema.parse({
            ...message,
            createdAt: message.createdAt.toISOString(),
          })
        );
        return reply.send({ messages: formattedMessages });
      } finally {
        if (chatType === 'natie') {
          await fastify.agentLockService.release(userId);
        }
      }
    }
  );

  // POST /chat/stream - Stream mode (returns SSE)
  typedFastify.post(
    '/chat/stream',
    {
      preHandler: authHandler,
      schema: {
        body: ChatMessageRequestSchema,
        response: {
          200: z.any(),
          401: ErrorResponseSchema,
          400: ErrorResponseSchema,
          429: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      if (!req.user?.id) return reply.code(401).send({ error: 'Unauthorized' });
      const userId = req.user.id;

      const { message, chatType } = req.body;

      if (chatType === 'telegram') {
        return reply
          .code(400)
          .send({ error: 'Telegram chat is not supported yet' });
      }

      if (chatType === 'natie') {
        const isLockAcquired = await fastify.agentLockService.acquire(
          userId,
          'web'
        );
        if (!isLockAcquired) {
          return reply
            .code(429)
            .send({ error: ACTIVE_CONVERSATION_ERROR_MESSAGE });
        }
      }

      let shouldReleaseLockInFinally = chatType === 'natie';

      try {
        const agent = await createAgent(chatType, userId);

        if (!agent) {
          return reply.code(400).send({
            error: `No connected account found for ${chatType}. Please connect your account first.`,
          });
        }

        const conversation = await chatRepo.getOrCreate(userId, chatType);

        const abortController = new AbortController();
        req.raw.on('close', () => abortController.abort());

        const result = await agentRunner.stream(agent, {
          conversationId: conversation.id,
          message,
          abortController,
          channel: 'web',
        });

        if (chatType === 'natie') {
          let isStreamLockReleased = false;
          const releaseLock = async (): Promise<void> => {
            if (isStreamLockReleased) return;
            isStreamLockReleased = true;
            await fastify.agentLockService.release(userId);
          };

          const safeRelease = () => {
            releaseLock().catch((err) => {
              fastify.log.error(err, 'Failed to release agent lock for user %s', userId);
            });
          };

          const streamResult: Readable = result;
          streamResult.once('end', safeRelease);
          streamResult.once('close', safeRelease);
          streamResult.once('error', safeRelease);
          shouldReleaseLockInFinally = false;
        }

        reply
          .header('Content-Type', 'text/event-stream; charset=utf-8')
          .header('Cache-Control', 'no-cache, no-transform')
          .header('Connection', 'keep-alive')
          .header('X-Accel-Buffering', 'no');

        return reply.send(result);
      } finally {
        if (shouldReleaseLockInFinally) {
          await fastify.agentLockService.release(userId);
        }
      }
    }
  );
};
