import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance } from 'fastify';
import { isZodSchema, toJsonSchema } from './helpers';

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
          url: process.env.PUBLIC_BASE_URL!,
        },
      ],
    },
    transform: ({ schema, url }) => {
      if (!schema) return { schema, url };

      if (isZodSchema(schema.body)) {
        schema.body = toJsonSchema(schema.body);
      }
      if (isZodSchema(schema.querystring)) {
        schema.querystring = toJsonSchema(schema.querystring);
      }
      if (isZodSchema(schema.params)) {
        schema.params = toJsonSchema(schema.params);
      }
      if (isZodSchema(schema.headers)) {
        schema.headers = toJsonSchema(schema.headers);
      }
      if (schema.response && typeof schema.response === 'object') {
        const response: Record<string, unknown> = {};
        Object.assign(response, schema.response);
        for (const key of Object.keys(response)) {
          const responseSchema = response[key];
          if (isZodSchema(responseSchema)) {
            response[key] = toJsonSchema(responseSchema);
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
