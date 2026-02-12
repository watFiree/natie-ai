import { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { AgentRequestSchema, CreateXAgentSchema } from './schema';
import { authHandler } from '../../modules/auth/handler';
import { createAgent } from './createAgent';
import { createSystemPrompt } from './system';
import { createTools } from './tools';
import { AgentRunner } from '../common/runner';
import { createClient } from './clientFactory';
import { XAccountRepository } from '../../modules/x_account/repository';
import { MessageRepository } from '../../modules/messages/repository';

export const XAgentRouter = async (fastify: FastifyInstance) => {
  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();
  const messageRepo = new MessageRepository(fastify.prisma);
  const xAccountRepo = new XAccountRepository(fastify.prisma);
  const agentRunner = new AgentRunner({ prisma: fastify.prisma, messageRepo });

  typedFastify.post(
    '/create',
    {
      preHandler: authHandler,
      schema: {
        body: CreateXAgentSchema,
      },
    },
    async (req, reply) => {
      if (!req.user?.id) return reply.code(401).send({ error: 'Unauthorized' });

      const { userAgentId } = req.body;

      const userIntegration = await fastify.prisma.userIntegration.findUnique({
        where: { id: userAgentId, userId: req.user.id },
      });
      if (!userIntegration) {
        return reply.code(404).send({ error: 'User Agent not found' });
      }

      const conversation = await fastify.prisma.userChat.create({
        data: {
          userId: req.user.id,
          type: 'x',
          userIntegrationId: userIntegration.id,
        },
      });

      return reply.send(conversation);
    }
  );

  typedFastify.post(
    '/chat',
    {
      preHandler: authHandler,
      schema: {
        body: AgentRequestSchema,
      },
    },
    async (req, reply) => {
      if (!req.user?.id) return reply.code(401).send({ error: 'Unauthorized' });

      const { message, type } = req.body;

      const conversation =
        await fastify.prisma.userChat.findFirst({
          where: {
            userId: req.user.id,
            type: 'x',
          },
        });
      if (!conversation) {
        return reply.code(404).send({ error: 'Conversation not found' });
      }

      const xAccount = await xAccountRepo.findByUserId(req.user.id);

      if (!xAccount) {
        return reply.code(400).send({ error: 'X account not linked' });
      }

      const systemPrompt = createSystemPrompt();
      const clientProvider = () =>
        createClient({
          authToken: xAccount.authToken,
          ct0: xAccount.ct0,
        });
      const tools = createTools(clientProvider);

      const agent = createAgent(systemPrompt, tools);

      const abortController = new AbortController();
      req.raw.on('close', () => abortController.abort());

      const result = await agentRunner.run(agent, {
        conversationId: conversation.id,
        message,
        type,
        abortController,
      });

      if (type === 'invoke') {
        return reply.send(result);
      } else {
        reply
          .header('Content-Type', 'text/event-stream; charset=utf-8')
          .header('Cache-Control', 'no-cache, no-transform')
          .header('Connection', 'keep-alive')
          .header('X-Accel-Buffering', 'no');

        return reply.send(result);
      }
    }
  );
};
