import { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  NatieChatRequestSchema,
  CreateNatieConversationSchema,
} from './schema';
import { authHandler } from '../auth/handler';
import { NatieService } from './service';
import { GmailOAuthService } from '../gmail/service';
import { createOAuth2Client } from '../gmail/clientFactory';
import { GmailAccountRepository } from '../gmail/repository';
import { XAccountRepository } from '../x_account/repository';
import { MessageRepository } from '../messages/repository';
import { ChatRepository } from '../chat/repository';
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
  const chatRepo = new ChatRepository(fastify.prisma);
  const agentRunner = new AgentRunner({ prisma: fastify.prisma, messageRepo });
  const natieService = new NatieService(
    fastify.prisma,
    gmailService,
    gmailAccountRepo,
    xAccountRepo
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

      const { message, type } = req.body;

      const conversation = await chatRepo.getOrCreate(req.user.id, 'natie');

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
