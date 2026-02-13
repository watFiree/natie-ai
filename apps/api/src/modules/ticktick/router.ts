import crypto from 'node:crypto';
import { TickTickOAuthService } from './service';
import type { FastifyInstance } from 'fastify';
import { TICKTICK_SCOPES } from './consts';
import { TickTickAccountRepository } from './repository';
import { authHandler } from '../auth/handler';

export const TickTickRouter = async (fastify: FastifyInstance) => {
  fastify.get(
    '/auth/ticktick',
    { preHandler: authHandler },
    async (req, reply) => {
      const state = crypto.randomBytes(24).toString('hex');
      const repository = new TickTickAccountRepository(fastify.prisma);
      const svc = new TickTickOAuthService(
        process.env.TICKTICK_CLIENT_ID!,
        process.env.TICKTICK_CLIENT_SECRET!,
        process.env.TICKTICK_REDIRECT_URI!,
        repository
      );

      const url = svc.generateRedirectUrl({
        state,
        scopes: TICKTICK_SCOPES,
      });

      return reply.redirect(url);
    }
  );

  fastify.get(
    '/oauth/ticktick/callback',
    { preHandler: authHandler },
    async (req, reply) => {
      const { code, state } = req.query as { code?: string; state?: string };
      if (!code || !state || !req.user?.id)
        return reply.redirect('/settings/integrations?ticktick=failed');

      const repository = new TickTickAccountRepository(fastify.prisma);
      const svc = new TickTickOAuthService(
        process.env.TICKTICK_CLIENT_ID!,
        process.env.TICKTICK_CLIENT_SECRET!,
        process.env.TICKTICK_REDIRECT_URI!,
        repository
      );

      try {
        const tokens = await svc.exchangeCodeForTokens(code);
        await svc.saveAccount(req.user.id, tokens);
        return reply.redirect('/settings/integrations?ticktick=success');
      } catch (error) {
        console.error('TickTick OAuth callback error:', error);
        return reply.redirect('/settings/integrations?ticktick=failed');
      }
    }
  );

  fastify.get(
    '/ticktick/account',
    { preHandler: authHandler },
    async (req, reply) => {
      if (!req.user?.id) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const repository = new TickTickAccountRepository(fastify.prisma);
      const account = await repository.findByUserId(req.user.id);

      if (!account) {
        return reply.code(404).send({ error: 'No TickTick account found' });
      }

      return reply.send({
        id: account.id,
        scope: account.scope,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      });
    }
  );

  fastify.delete(
    '/ticktick/account',
    { preHandler: authHandler },
    async (req, reply) => {
      if (!req.user?.id) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const repository = new TickTickAccountRepository(fastify.prisma);
      const account = await repository.findByUserId(req.user.id);

      if (!account) {
        return reply.code(404).send({ error: 'Not Found' });
      }

      await repository.delete(req.user.id);
      return reply.send({ success: true });
    }
  );
};
