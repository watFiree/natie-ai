import 'dotenv/config';
import fastify from 'fastify';
import cookie from '@fastify/cookie';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import { GmailRouter } from './modules/gmail/router';
import { dbPlugin } from './modules/db/plugin';
import { AuthRouter } from './modules/auth/router';

const app = fastify({ logger: true });
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.withTypeProvider<ZodTypeProvider>();

app.register(cookie, {
  secret: process.env.WORKOS_COOKIE_PASSWORD,
});

app.register(dbPlugin);
app.register(AuthRouter, { prefix: '/auth' });
app.register(GmailRouter);

app.listen({ port: 3000 }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`
  🚀 Server ready at: http://localhost:3000
  ⭐️ See sample requests: https://github.com/prisma/prisma-examples/blob/latest/orm/fastify/README.md#using-the-rest-api`);
});
