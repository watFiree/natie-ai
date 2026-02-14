import { TelegramSetupView } from './telegram-setup-view';

type TelegramGatewayShellProps = {
  initialIsConfigured: boolean;
  initialTelegramUserId?: string;
};

export function TelegramGatewayShell({
  initialIsConfigured,
  initialTelegramUserId,
}: TelegramGatewayShellProps) {
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
              initialIsConfigured={initialIsConfigured}
              initialTelegramUserId={initialTelegramUserId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
