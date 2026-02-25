import { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { ErrorResponseSchema } from '../../common/schema';
import { authHandler } from '../auth/handler';
import { TokenUsageRepository } from './repository';
import { TokenUsageSummaryResponseSchema } from './schema';

export const TokenUsageRouter = async (fastify: FastifyInstance) => {
  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();

  const tokenUsageRepo = new TokenUsageRepository(fastify.prisma);

  typedFastify.get(
    '/summary',
    {
      preHandler: authHandler,
      schema: {
        tags: ['token-usage'],
        response: {
          200: TokenUsageSummaryResponseSchema,
          401: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      if (!req.user?.id) return reply.code(401).send({ error: 'Unauthorized' });

      try {
        const records = await tokenUsageRepo.getSummaryByUser(req.user.id);

        const usage = records.map((record) => {
          const inputCost = record.modelPricing.inputPricePerToken.mul(
            record.promptTokens
          );
          const outputCost = record.modelPricing.outputPricePerToken.mul(
            record.completionTokens
          );
          const estimatedCost = inputCost.add(outputCost);

          return {
            id: record.id,
            modelName: record.modelPricing.modelName,
            modelProvider: record.modelPricing.modelProvider,
            promptTokens: record.promptTokens,
            completionTokens: record.completionTokens,
            totalTokens: record.totalTokens,
            cachedTokens: record.cachedTokens,
            reasoningTokens: record.reasoningTokens,
            inputPricePerToken:
              record.modelPricing.inputPricePerToken.toString(),
            outputPricePerToken:
              record.modelPricing.outputPricePerToken.toString(),
            estimatedCost: estimatedCost.toString(),
          };
        });

        return reply.send({ usage });
      } catch (err) {
        req.log.error(err, 'Failed to fetch token usage summary');
        return reply.code(500).send({ error: 'Internal server error' });
      }
    }
  );
};
