import { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { AgentRequestSchema } from './schema';
import { authHandler } from '../../modules/auth/handler';
import { createAgent } from '../common/createAgent';
import { createSystemPrompt } from './system';
import { GmailOAuthService } from '../../modules/gmail/service';
import { createOAuth2Client } from '../../modules/gmail/clientFactory';
import { GmailAccountRepository } from '../../modules/gmail/repository';
import { createTools } from './tools';
import { MessageRepository } from '../../modules/messages/repository';
import { AgentRunner } from '../common/runner';

export const EmailAgentRouter = async (fastify: FastifyInstance) => {
  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();
  const messageRepo = new MessageRepository(fastify.prisma);
  const gmailAccountRepo = new GmailAccountRepository(fastify.prisma);
  const gmailService = new GmailOAuthService(
    createOAuth2Client(),
    gmailAccountRepo
  );
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

      const settings = await fastify.prisma.emailAgentSettings.findFirst({
        where: { userId: req.user.id },
      });
      const emailAccounts = await gmailAccountRepo.findByUserId(req.user.id);

      const systemPrompt = createSystemPrompt(
        settings?.labels ?? [],
        emailAccounts.map((account) => account.email)
      );
      const tokenProvider = (email: string) =>
        gmailService.getEnsuredAccessToken(req.user!.id, email);
      const tools = createTools(tokenProvider);

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
