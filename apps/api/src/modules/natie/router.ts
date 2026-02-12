import { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { NatieChatRequestSchema, CreateNatieConversationSchema } from './schema';
import { authHandler } from '../auth/handler';
import { NatieService } from './service';
import { GmailOAuthService } from '../gmail/service';
import { createOAuth2Client } from '../gmail/clientFactory';
import { GmailAccountRepository } from '../gmail/repository';
import { XAccountRepository } from '../x_account/repository';
import { MessageRepository } from '../messages/repository';
import { AgentRunner } from '../../integrations/common/runner';

export const NatieRouter = async (fastify: FastifyInstance) => {
  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();
  const messageRepo = new MessageRepository(fastify.prisma);
  const gmailAccountRepo = new GmailAccountRepository(fastify.prisma);
  const gmailService = new GmailOAuthService(
    createOAuth2Client(),
    gmailAccountRepo
  );
  const xAccountRepo = new XAccountRepository(fastify.prisma);
  const agentRunner = new AgentRunner({ prisma: fastify.prisma, messageRepo });
  const natieService = new NatieService(
    fastify.prisma,
    gmailService,
    gmailAccountRepo,
    xAccountRepo
  );

  typedFastify.post(
    '/create',
    {
      preHandler: authHandler,
      schema: {
        body: CreateNatieConversationSchema,
      },
    },
    async (req, reply) => {
      if (!req.user?.id) return reply.code(401).send({ error: 'Unauthorized' });

      const { userAgentId } = req.body;

      const userAgent = await fastify.prisma.userAgent.findUnique({
        where: { id: userAgentId, userId: req.user.id },
      });
      if (!userAgent) {
        return reply.code(404).send({ error: 'User Agent not found' });
      }

      const conversation = await fastify.prisma.userAgentConversation.create({
        data: {
          userAgentId: userAgent.id,
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
        body: NatieChatRequestSchema,
      },
    },
    async (req, reply) => {
      if (!req.user?.id) return reply.code(401).send({ error: 'Unauthorized' });

      const { message, type, agentConversationId } = req.body;

      const conversation =
        await fastify.prisma.userAgentConversation.findUnique({
          where: {
            id: agentConversationId,
            userAgent: { userId: req.user.id },
          },
        });
      if (!conversation) {
        return reply.code(404).send({ error: 'Conversation not found' });
      }

      const mainAgent = await natieService.createMainAgent(req.user.id);

      const abortController = new AbortController();
      req.raw.on('close', () => abortController.abort());

      const result = await agentRunner.run(mainAgent, {
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
