import crypto from 'node:crypto';
import { TodoAppAccountRepository } from '../todo_app/repository';
import { TickTickOAuthService } from '../ticktick/service';
import { authHandler } from '../auth/handler';
import { OAuthCallbackQuerySchema, RedirectResponseSchema } from './schema';
import { ErrorResponseSchema } from '../../common/schema';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';

export const TickTickRouter = async (fastify: FastifyInstance) => {
  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();
  const repository = new TodoAppAccountRepository(fastify.prisma);
  const tickTickService = new TickTickOAuthService();
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  // GET /auth — Generate OAuth redirect
  typedFastify.get(
    '/auth',
    {
      preHandler: authHandler,
      schema: {
        response: {
          302: RedirectResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      if (!req.user?.id) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const nonce = crypto.randomBytes(24).toString('hex');
      const url = tickTickService.generateRedirectUrl(nonce);

      reply.setCookie('todo_oauth_state', nonce, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 5 * 60,
        signed: true,
        path: '/',
      });

      return reply.redirect(url);
    }
  );

  // GET /callback — Exchange code for tokens
  typedFastify.get(
    '/callback',
    {
      preHandler: authHandler,
      schema: {
        querystring: OAuthCallbackQuerySchema,
        response: {
          302: RedirectResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      const { code, state } = req.query;
      const failedUrl = `${frontendUrl}/settings?todo=failed`;

      if (!code || !state || !req.user?.id) {
        return reply.redirect(failedUrl);
      }

      const stateCookie = req.cookies.todo_oauth_state;
      if (!stateCookie) {
        return reply.redirect(failedUrl);
      }

      const unsignResult = req.unsignCookie(stateCookie);
      if (!unsignResult.valid || unsignResult.value !== state) {
        return reply.redirect(failedUrl);
      }

      reply.clearCookie('todo_oauth_state', { path: '/' });

      try {
        const tokens = await tickTickService.exchangeCodeForTokens(code);
        await repository.upsert({ userId: req.user.id, tokens });
        return reply.redirect(`${frontendUrl}/settings?todo=success`);
      } catch (err) {
        req.log.error(err, 'TickTick OAuth callback failed');
        return reply.redirect(failedUrl);
      }
    }
  );
};
