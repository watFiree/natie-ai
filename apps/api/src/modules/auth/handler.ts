import { FastifyReply, FastifyRequest } from 'fastify';
import { workos } from './consts';

export async function authHandler(req: FastifyRequest, reply: FastifyReply) {
  const session = workos.userManagement.loadSealedSession({
    sessionData: req.cookies['wos-session'] ?? '',
    cookiePassword: process.env.WORKOS_COOKIE_PASSWORD!,
  });

  const authResult = await session.authenticate();

  if (authResult.authenticated) {
    req.user = await req.server.prisma.user.findUnique({
      where: { workosUserId: authResult.user.id },
    });
    return;
  }

  if (authResult.reason === 'no_session_cookie_provided') {
    return reply.code(401).send({ error: 'Not authenticated' });
  }

  try {
    const refreshed = await session.refresh();
    if (!refreshed.authenticated) {
      reply.clearCookie('wos-session', { path: '/' });
      return reply.code(401).send({ error: 'Session expired' });
    }

    reply.setCookie('wos-session', refreshed.sealedSession ?? '', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    req.user = await req.server.prisma.user.findUnique({
      where: { workosUserId: refreshed.user.id },
    });
    return;
  } catch {
    reply.clearCookie('wos-session', { path: '/' });
    return reply.code(401).send({ error: 'Not authenticated' });
  }
}
