'use client';

import { useState } from 'react';

import { TelegramSetupView } from './telegram-setup-view';

type TelegramGatewayShellProps = {
  initialIsConfigured: boolean;
  initialTelegramUserId?: string;
};

export function TelegramGatewayShell({
  initialIsConfigured,
  initialTelegramUserId,
}: TelegramGatewayShellProps) {
  const [isConfigured, setIsConfigured] = useState(initialIsConfigured);
  const [telegramUserId, setTelegramUserId] = useState(
    initialTelegramUserId
  );

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <h1 className="mb-2 text-2xl font-bold">Telegram Gateway</h1>
            <p className="text-muted-foreground">
              Connect your Telegram account to chat with Natie directly from
              Telegram.
            </p>
          </div>
          <div className="px-4 lg:px-6">
            <TelegramSetupView
              isConfigured={isConfigured}
              currentTelegramUserId={telegramUserId}
              onSettingsSaved={() => {
                setIsConfigured(true);
                // We don't have the new telegramUserId in this callback,
                // but the form has been reset with the new value.
                // For simplicity, trigger a page refresh behavior:
                setTelegramUserId(undefined);
              }}
              onSettingsDeleted={() => {
                setIsConfigured(false);
                setTelegramUserId(undefined);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
