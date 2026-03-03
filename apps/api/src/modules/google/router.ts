import crypto from 'node:crypto';
import { GoogleOAuthService } from './service';
import { integrationConfig, IntegrationType } from './consts';
import { GmailAccountRepository } from '../gmail/repository';
import { CalendarAccountRepository } from '../google_calendar/repository';
import { authHandler } from '../auth/handler';
import {
  OAuthCallbackQuerySchema,
  RedirectResponseSchema,
} from '../gmail/schema';
import { ErrorResponseSchema } from '../../common/schema';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { buildOAuthRoute, isOAuthState, redirectUrls } from './helpers';

export const GoogleRouter = async (fastify: FastifyInstance) => {
  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();
  const gmailRepository = new GmailAccountRepository(fastify.prisma);
  const calendarRepository = new CalendarAccountRepository(fastify.prisma);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  function registerAuthRoute(integration: IntegrationType, path: string) {
    typedFastify.get(
      path,
      {
        preHandler: authHandler,
        schema: {
          response: {
            302: RedirectResponseSchema,
            401: ErrorResponseSchema,
          },
        },
      },
      async (_req, reply) => {
        const nonce = crypto.randomBytes(24).toString('hex');
        const { state, scopes } = buildOAuthRoute(integration);
        const stateValue = state(nonce);
        const svc = new GoogleOAuthService();

        const url = svc.generateRedirectUrl({
          state: stateValue,
          scopes,
          accessType: 'offline',
          prompt: 'consent',
        });

        reply.setCookie('google_oauth_state', stateValue, {
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
  }

  registerAuthRoute('gmail', '/gmail');
  registerAuthRoute('calendar', '/calendar');

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
      const gmailRedirects = redirectUrls('gmail', frontendUrl);
      if (!code || !state || !req.user?.id)
        return reply.redirect(gmailRedirects.failed);

      const stateCookie = req.cookies.google_oauth_state;
      if (!stateCookie) return reply.redirect(gmailRedirects.failed);

      const unsignResult = req.unsignCookie(stateCookie);
      if (!unsignResult.valid || unsignResult.value !== state)
        return reply.redirect(gmailRedirects.failed);

      reply.clearCookie('google_oauth_state', { path: '/' });

      let parsedState: unknown;
      try {
        parsedState = JSON.parse(state);
      } catch {
        return reply.redirect(gmailRedirects.failed);
      }

      if (!isOAuthState(parsedState))
        return reply.redirect(gmailRedirects.failed);

      const integration = parsedState.integration;
      const redirects = redirectUrls(integration, frontendUrl);

      try {
        const svc = new GoogleOAuthService();
        const tokens = await svc.exchangeCodeForTokens(code);
        const email = await svc.getEmailFromIdToken(tokens);
        if (!email) return reply.redirect(redirects.failed);

        if (integration === 'gmail') {
          const existing = await gmailRepository.findByUserAndEmail(
            req.user.id,
            email
          );
          if (existing) return reply.redirect(redirects.alreadyRegistered);

          await gmailRepository.upsert({
            userId: req.user.id,
            email,
            tokens,
          });
        } else {
          const existing = await calendarRepository.findByUserAndEmail(
            req.user.id,
            email
          );
          if (existing) return reply.redirect(redirects.alreadyRegistered);

          await calendarRepository.upsert({
            userId: req.user.id,
            email,
            tokens,
          });
        }

        return reply.redirect(redirects.success);
      } catch (err) {
        req.log.error(err, 'Google OAuth callback failed');
        return reply.redirect(redirects.failed);
      }
    }
  );
};
