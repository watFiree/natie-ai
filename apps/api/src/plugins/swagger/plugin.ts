import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance } from 'fastify';
import { toJsonSchema } from './helpers';

async function swaggerPlugin(fastify: FastifyInstance) {
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'API',
        description: 'API documentation',
        version: '1.0.0',
      },
      servers: [
        {
          url: process.env.APP_BASE_URL || 'http://localhost:3000',
        },
      ],
    },
    transform: ({ schema, url }) => {
      if (!schema) return { schema, url };

      schema.body = toJsonSchema(schema.body);
      schema.querystring = toJsonSchema(schema.querystring);
      schema.params = toJsonSchema(schema.params);
      schema.headers = toJsonSchema(schema.headers);
      if (schema.response && typeof schema.response === 'object') {
        const response: Record<string, unknown> = {};
        Object.assign(response, schema.response);
        for (const key of Object.keys(response)) {
          const responseSchema = response[key];
          // Check if already wrapped in content (manual OpenAPI format)
          if (
            typeof responseSchema === 'object' &&
            responseSchema !== null &&
            'content' in responseSchema
          ) {
            // Already wrapped, just convert the inner schema
            const wrapped = responseSchema as {
              description?: string;
              content: Record<string, { schema: unknown }>;
            };
            for (const contentType of Object.keys(wrapped.content)) {
              wrapped.content[contentType].schema = toJsonSchema(
                wrapped.content[contentType].schema
              );
            }
            response[key] = wrapped;
          } else {
            // Wrap in OpenAPI response format with content
            response[key] = {
              description: 'Success',
              content: {
                'application/json': {
                  schema: toJsonSchema(responseSchema),
                },
              },
            };
          }
        }
        schema.response = response;
      }
      return { schema, url };
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });
}

export default fp(swaggerPlugin, { name: 'swagger' });
