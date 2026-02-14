import { cookies } from 'next/headers';

import { getTelegramSettings } from '@/lib/client/default/default';

import { TelegramGatewayShell } from './components/telegram-gateway-shell';

async function getTelegramConfig() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');

  try {
    const response = await getTelegramSettings({
      cache: 'no-store',
      headers: {
        Cookie: cookieHeader,
      },
    });

    if (response.status === 200) {
      return {
        isConfigured: true,
        telegramUserId: response.data.telegramUserId,
      };
    }

    return { isConfigured: false };
  } catch {
    return { isConfigured: false };
  }
}

export default async function Page() {
  const config = await getTelegramConfig();

  return (
    <TelegramGatewayShell
      initialIsConfigured={config.isConfigured}
      initialTelegramUserId={config.telegramUserId}
    />
  );
}
