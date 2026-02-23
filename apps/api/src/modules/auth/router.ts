import { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { workos } from './consts';
import { authHandler } from './handler';
import { ErrorResponseSchema } from '../../common/schema';
import {
  CallbackQuerySchema,
  RedirectResponseSchema,
  StatusResponseSchema,
} from './schema';

export const AuthRouter = async (fastify: FastifyInstance) => {
  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();

  typedFastify.get(
    '/login',
    {
      schema: {
        response: {
          302: RedirectResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    async (_req, reply) => {
      try {
        const authorizationUrl = workos.userManagement.getAuthorizationUrl({
          provider: 'authkit',
          redirectUri: process.env.WORKOS_REDIRECT_URI!,
          clientId: process.env.WORKOS_CLIENT_ID!,
        });

        return reply.redirect(authorizationUrl);
      } catch (err) {
        _req.log.error(err, 'Failed to generate login URL');
        return reply.code(500).send({ error: 'Internal server error' });
      }
    }
  );

  typedFastify.get(
    '/callback',
    {
      schema: {
        querystring: CallbackQuerySchema,
        response: {
          302: RedirectResponseSchema,
          400: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      const code = req.query.code;
      if (!code) return reply.code(400).send({ error: 'Missing code' });

      try {
        const { user, sealedSession } =
          await workos.userManagement.authenticateWithCode({
            clientId: process.env.WORKOS_CLIENT_ID!,
            code,
            session: {
              sealSession: true,
              cookiePassword: process.env.WORKOS_COOKIE_PASSWORD!,
            },
          });

        await fastify.prisma.user.upsert({
          where: { workosUserId: user.id },
          update: {
            email: user.email,
          },
          create: {
            workosUserId: user.id,
            email: user.email,
          },
        });

        reply.setCookie('wos-session', sealedSession ?? '', {
          path: '/',
          httpOnly: true,
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          secure: process.env.NODE_ENV === 'production',
        });

        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return reply.redirect(`${baseUrl}/app`);
      } catch (err) {
        req.log.error(err, 'OAuth callback failed');
        return reply.code(500).send({ error: 'Internal server error' });
      }
    }
  );

  typedFastify.get(
    '/status',
    {
      preHandler: authHandler,
      schema: {
        response: {
          200: StatusResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      if (!req.user?.id) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      return {
        user: {
          ...req.user,
          createdAt: req.user.createdAt.toISOString(),
          updatedAt: req.user.updatedAt.toISOString(),
        },
      };
    }
  );

  typedFastify.get(
    '/logout',
    {
      schema: {
        response: {
          302: RedirectResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      try {
        const session = workos.userManagement.loadSealedSession({
          sessionData: req.cookies['wos-session'] ?? '',
          cookiePassword: process.env.WORKOS_COOKIE_PASSWORD!,
        });

        const url = await session.getLogoutUrl();
        reply.clearCookie('wos-session', { path: '/' });
        return reply.redirect(url);
      } catch (err) {
        req.log.error(err, 'Logout failed');
        return reply.code(500).send({ error: 'Internal server error' });
      }
    }
  );
};
