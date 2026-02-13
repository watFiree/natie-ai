import { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { AgentRequestSchema } from './schema';
import { authHandler } from '../../modules/auth/handler';
import { createAgent } from './createAgent';
import { createSystemPrompt } from './system';
import { createTools } from './tools';
import { AgentRunner } from '../common/runner';
import { TickTickOAuthService } from '../../modules/ticktick/service';
import { TickTickAccountRepository } from '../../modules/ticktick/repository';
import { MessageRepository } from '../../modules/messages/repository';
import { ChatRepository } from '../../modules/chat/repository';

export const TickTickAgentRouter = async (fastify: FastifyInstance) => {
  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();
  const messageRepo = new MessageRepository(fastify.prisma);
  const ticktickRepo = new TickTickAccountRepository(fastify.prisma);
  const ticktickService = new TickTickOAuthService(
    process.env.TICKTICK_CLIENT_ID!,
    process.env.TICKTICK_CLIENT_SECRET!,
    process.env.TICKTICK_REDIRECT_URI!,
    ticktickRepo
  );
  const chatRepo = new ChatRepository(fastify.prisma);
  const agentRunner = new AgentRunner({ prisma: fastify.prisma, messageRepo });

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

      const conversation = await chatRepo.getOrCreate(req.user.id, 'ticktick');

      const ticktickAccount = await ticktickRepo.findByUserId(req.user.id);

      if (!ticktickAccount) {
        return reply.code(400).send({ error: 'TickTick account not linked' });
      }

      const systemPrompt = createSystemPrompt();
      const tokenProvider = () =>
        ticktickService.getEnsuredAccessToken(req.user!.id);
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
