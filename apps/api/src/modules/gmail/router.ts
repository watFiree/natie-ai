import crypto from 'node:crypto';
import { GmailOAuthService } from './service';
import { createOAuth2Client } from './clientFactory';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { scopes } from './consts';
import { GmailAccountRepository } from './repository';
import { authHandler } from '../auth/handler';
import {
  DeleteGmailAccountQuerySchema,
  ErrorResponseSchema,
  GmailAccountsResponseSchema,
  SuccessResponseSchema,
} from './schema';

export const GmailRouter = async (fastify: FastifyInstance) => {
  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();
  const repository = new GmailAccountRepository(fastify.prisma);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const successRedirect = `${frontendUrl}/app/email?google=success`;
  const failedRedirect = `${frontendUrl}/app/email?google=failed`;

  typedFastify.get(
    '/auth/google',
    { preHandler: authHandler },
    async (req, reply) => {
      const state = crypto.randomBytes(24).toString('hex');
      const oauth2Client = createOAuth2Client();
      const svc = new GmailOAuthService(oauth2Client, repository);

      const url = svc.generateRedirectUrl({
        state,
        scopes,
        accessType: 'offline',
        prompt: 'consent',
      });

      return reply.redirect(url);
    }
  );

  typedFastify.get(
    '/oauth/google/callback',
    { preHandler: authHandler },
    async (req, reply) => {
      const { code, state } = req.query as { code?: string; state?: string };
      if (!code || !state || !req.user?.id)
        return reply.redirect(failedRedirect);

      const oauth2Client = createOAuth2Client();
      const svc = new GmailOAuthService(oauth2Client, repository);

      const tokens = await svc.exchangeCodeForTokens(code);
      const email = await svc.getEmailFromIdToken(tokens);
      if (!email) return reply.redirect(failedRedirect);

      await svc.saveAccount(req.user.id, email, tokens);
      return reply.redirect(successRedirect);
    }
  );

  typedFastify.get(
    '/gmail-accounts',
    {
      preHandler: authHandler,
      schema: {
        response: {
          200: GmailAccountsResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      if (!req.user?.id) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const accounts = await repository.findByUserId(req.user.id);
      return reply.send(
        accounts.map((account) => ({
          email: account.email,
          provider: 'gmail' as const,
        }))
      );
    }
  );

  typedFastify.delete(
    '/gmail-accounts',
    {
      preHandler: authHandler,
      schema: {
        querystring: DeleteGmailAccountQuerySchema,
        response: {
          200: SuccessResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      if (!req.user?.id) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const account = await repository.findByEmail(req.query.email);
      if (!account || account.userId !== req.user.id) {
        return reply.code(404).send({ error: 'Account not found' });
      }

      await repository.delete(req.query.email);
      return reply.send({ success: true });
    }
  );
};
