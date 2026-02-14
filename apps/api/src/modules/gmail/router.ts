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
  OAuthCallbackQuerySchema,
  RedirectResponseSchema,
  SuccessResponseSchema,
} from './schema';

export const GmailRouter = async (fastify: FastifyInstance) => {
  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();
  const repository = new GmailAccountRepository(fastify.prisma);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const successRedirect = `${frontendUrl}/app/email?google=success`;
  const failedRedirect = `${frontendUrl}/app/email?google=failed`;
  const alreadyRegisteredRedirect = `${frontendUrl}/app/email?google=already_registered`;

  typedFastify.get(
    '/auth/google',
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
      const state = crypto.randomBytes(24).toString('hex');
      const oauth2Client = createOAuth2Client();
      const svc = new GmailOAuthService(oauth2Client, repository);

      const url = svc.generateRedirectUrl({
        state,
        scopes,
        accessType: 'offline',
        prompt: 'consent',
      });

      reply.setCookie('google_oauth_state', state, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 5 * 60, // 5 minutes (seconds in Fastify)
        signed: true,
        path: '/',
      });

      return reply.redirect(url);
    }
  );

  typedFastify.get(
    '/oauth/google/callback',
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
      if (!code || !state || !req.user?.id)
        return reply.redirect(failedRedirect);

      // Verify the OAuth state parameter against the signed cookie
      const stateCookie = req.cookies.google_oauth_state;
      if (!stateCookie) return reply.redirect(failedRedirect);

      const unsignResult = req.unsignCookie(stateCookie);
      if (!unsignResult.valid || unsignResult.value !== state)
        return reply.redirect(failedRedirect);

      // Clear the state cookie to prevent reuse
      reply.clearCookie('google_oauth_state', { path: '/' });

      try {
        const oauth2Client = createOAuth2Client();
        const svc = new GmailOAuthService(oauth2Client, repository);

        const tokens = await svc.exchangeCodeForTokens(code);
        const email = await svc.getEmailFromIdToken(tokens);
        if (!email) return reply.redirect(failedRedirect);

        const existing = await repository.findByUserAndEmail(
          req.user.id,
          email
        );
        if (existing) return reply.redirect(alreadyRegisteredRedirect);

        await svc.saveAccount(req.user.id, email, tokens);
        return reply.redirect(successRedirect);
      } catch (err) {
        req.log.error(err, 'Google OAuth callback failed');
        return reply.redirect(failedRedirect);
      }
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

      const account = await repository.findByUserAndEmail(
        req.user.id,
        req.query.email
      );
      if (!account) {
        return reply.code(404).send({ error: 'Account not found' });
      }

      await repository.delete(req.user.id, req.query.email);
      return reply.send({ success: true });
    }
  );
};
