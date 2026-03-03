import { createOAuth2Client } from '../google/clientFactory';
import { GmailAccountRepository } from './repository';
import { authHandler } from '../auth/handler';
import {
  DeleteGmailAccountQuerySchema,
  GmailAccountsResponseSchema,
  SuccessResponseSchema,
} from './schema';
import { ErrorResponseSchema } from '../../common/schema';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';

export const GmailRouter = async (fastify: FastifyInstance) => {
  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();
  const repository = new GmailAccountRepository(fastify.prisma);

  typedFastify.get(
    '/accounts',
    {
      preHandler: authHandler,
      schema: {
        response: {
          200: GmailAccountsResponseSchema,
          401: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      if (!req.user?.id) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      try {
        const accounts = await repository.findByUserId(req.user.id);
        return reply.send(
          accounts.map((account) => ({
            email: account.email,
            provider: 'gmail' satisfies 'gmail',
          }))
        );
      } catch (err) {
        req.log.error(err, 'Failed to get Gmail accounts');
        return reply.code(500).send({ error: 'Internal server error' });
      }
    }
  );

  /* TODO: update the OpenAPI spec and
  backend router to move the email out of query parameters and into the request
  body or a path segment (e.g., DELETE /gmail-accounts/{encodedEmail} or DELETE
  /gmail-accounts with {email} in JSON body)
  */
  typedFastify.delete(
    '/accounts',
    {
      preHandler: authHandler,
      schema: {
        querystring: DeleteGmailAccountQuerySchema,
        response: {
          200: SuccessResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      if (!req.user?.id) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      try {
        const account = await repository.findByUserAndEmail(
          req.user.id,
          req.query.email
        );
        if (!account) {
          return reply.code(404).send({ error: 'Account not found' });
        }

        const tokenToRevoke = account.refreshToken ?? account.accessToken;
        if (tokenToRevoke) {
          try {
            const oauth2Client = createOAuth2Client();
            await oauth2Client.revokeToken(tokenToRevoke);
          } catch (revokeErr) {
            req.log.warn(
              { err: revokeErr, email: req.query.email },
              'Failed to revoke Google token — continuing with account deletion'
            );
          }
        }

        await repository.delete(req.user.id, req.query.email);
        return reply.send({ success: true });
      } catch (err) {
        req.log.error(err, `Error deleting Gmail account ${req.query.email}`);
        return reply.code(500).send({ error: 'Internal server error' });
      }
    }
  );
};
