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
          response[key] = toJsonSchema(responseSchema);
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
