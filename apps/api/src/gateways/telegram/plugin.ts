import fp from 'fastify-plugin';
import { TelegramGateway } from './gateway';

export default fp(async function telegramPlugin(app) {
  const gateway = new TelegramGateway(app, app.agentLockService);

  app.decorate('telegramGateway', gateway);

  app.addHook('onReady', async () => {
    gateway.start();
  });

  app.addHook('onClose', async () => {
    gateway.stop();
  });
});
