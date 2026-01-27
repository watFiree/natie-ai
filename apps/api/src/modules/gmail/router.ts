import crypto from 'node:crypto';
import { GmailOAuthService } from './service';
import { createOAuth2Client } from './clientFactory';
import type { FastifyInstance } from 'fastify';
import { scopes } from './consts';
import { GmailAccountRepository } from './repository';

export const GmailRouter = async (fastify: FastifyInstance) => {
  fastify.get('/auth/google', async (req, reply) => {
    const state = crypto.randomBytes(24).toString('hex');

    const oauth2Client = createOAuth2Client();
    const repository = new GmailAccountRepository(fastify.prisma);
    const svc = new GmailOAuthService(oauth2Client, repository);

    const url = svc.generateRedirectUrl({
      state,
      scopes,
      accessType: 'offline',
      prompt: 'consent',
    });

    return reply.redirect(url);
  });

  fastify.get('/oauth/google/callback', async (req, reply) => {
    const { code, state } = req.query as { code?: string; state?: string };

    if (!code || !state || !req.user?.id)
      return reply.redirect('/settings/integrations?google=failed');

    const oauth2Client = createOAuth2Client();
    const repository = new GmailAccountRepository(fastify.prisma);
    const svc = new GmailOAuthService(oauth2Client, repository);

    const tokens = await svc.exchangeCodeForTokens(code);
    const email = await svc.getEmailFromIdToken(tokens);
    if (!email) return reply.redirect('/settings/integrations?google=failed');

    await svc.saveAccount(req.user.id, email, tokens);
    return reply.redirect('/settings/integrations?google=success');
  });
};
