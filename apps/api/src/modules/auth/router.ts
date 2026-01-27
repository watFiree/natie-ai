import { FastifyInstance } from 'fastify';
import { workos } from './consts';
import { authHandler } from './handler';

export const AuthRouter = async (fastify: FastifyInstance) => {
  fastify.get('/login', async (_req, reply) => {
    const authorizationUrl = workos.userManagement.getAuthorizationUrl({
      provider: 'authkit',
      redirectUri: process.env.WORKOS_REDIRECT_URI!,
      clientId: process.env.WORKOS_CLIENT_ID!,
    });

    return reply.redirect(authorizationUrl);
  });

  fastify.get<{
    Querystring: { code?: string };
  }>('/callback', async (req, reply) => {
    const code = req.query.code;
    if (!code) return reply.code(400).send({ error: 'Missing code' });

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
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return reply.redirect('/');
  });

  fastify.get('/status', { preHandler: authHandler }, async (req) => {
    return {
      user: req.user,
    };
  });

  fastify.get('/logout', async (req, reply) => {
    const session = workos.userManagement.loadSealedSession({
      sessionData: req.cookies['wos-session'] ?? '',
      cookiePassword: process.env.WORKOS_COOKIE_PASSWORD!,
    });

    const url = await session.getLogoutUrl();
    reply.clearCookie('wos-session', { path: '/' });
    return reply.redirect(url);
  });
};
