import 'dotenv/config';
import fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import swaggerPlugin from './plugins/swagger/plugin';
import { GmailRouter } from './modules/gmail/router';
import { XAccountRouter } from './modules/x_account/router';
import { dbPlugin } from './modules/db/plugin';
import { AuthRouter } from './modules/auth/router';
import { EmailAgentRouter } from './integrations/email_handler/router';
import { XAgentRouter } from './integrations/x_handler/router';
import { NatieRouter } from './modules/natie/router';
import { TelegramGateway } from './gateways/telegram/gateway';
import { TelegramSettingsRouter } from './gateways/telegram/router';
import { InMemoryAgentLockService } from './modules/agent_lock/service';

const app = fastify({ logger: true });
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.withTypeProvider<ZodTypeProvider>();
app.decorate('agentLockService', new InMemoryAgentLockService());

await app.register(swaggerPlugin);
await app.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
});

app.register(cookie, {
  secret: process.env.WORKOS_COOKIE_PASSWORD,
});

app.register(dbPlugin);
app.register(AuthRouter, { prefix: '/auth' });
app.register(GmailRouter);
app.register(XAccountRouter, { prefix: '/x-account' });
app.register(EmailAgentRouter, { prefix: '/email' });
app.register(XAgentRouter, { prefix: '/x' });
app.register(NatieRouter, { prefix: '/natie' });
app.register(TelegramSettingsRouter, { prefix: '/telegram' });

app.listen({ port: 3000, host: process.env.HOST || '0.0.0.0' }, async (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`🚀 Server ready at: http://localhost:3000`);

  if (process.env.TELEGRAM_TOKEN) {
    try {
      const gateway = new TelegramGateway(app, app.agentLockService);
      gateway.start();
    } catch (error) {
      console.error('Failed to start Telegram gateway:', error);
    }
  } else {
    console.log(
      '⚠️  TELEGRAM_TOKEN not set, skipping Telegram bot initialization'
    );
  }
});
