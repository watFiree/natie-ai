import { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { AgentRequestSchema } from './schema';
import { authHandler } from '../../modules/auth/handler';
import { createAgent } from './createAgent';
import { createSystemPrompt } from './system';
import { createTools } from './tools';
import { AgentRunner } from '../common/runner';
import { createClient } from './clientFactory';
import { XCredentials } from './const';
import { XAccountRepository } from '../../modules/x_account/repository';

export const XAgentRouter = async (fastify: FastifyInstance) => {
  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();
  const messageRepo = new (
    await import('../../modules/messages/repository')
  ).MessageRepository(fastify.prisma);
  const xAccountRepo = new XAccountRepository(fastify.prisma);
  const agentRunner = new AgentRunner({ prisma: fastify.prisma, messageRepo });

  typedFastify.post(
    '/create',
    {
      preHandler: authHandler,
    },
    async (req, reply) => {
      if (!req.user?.id) return reply.code(401).send({ error: 'Unauthorized' });

      const conversation = await fastify.prisma.userAgentConversation.create({
        data: {
          userAgent: {
            connect: {
              userId_agentId: { userId: req.user.id, agentId: req.user.id },
            },
          },
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

      const { message, type, agentConversationId } = req.body;

      const conversation =
        await fastify.prisma.userAgentConversation.findUnique({
          where: { id: agentConversationId },
        });
      if (!conversation) {
        return reply.code(404).send({ error: 'Conversation not found' });
      }

      const xAccount = await xAccountRepo.findByUserId(req.user.id);

      const systemPrompt = createSystemPrompt();
      const clientProvider = () =>
        createClient({
          authToken: xAccount?.authToken ?? '',
          ct0: xAccount?.ct0 ?? '',
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
