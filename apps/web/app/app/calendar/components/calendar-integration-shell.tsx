'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useGetGoogleCalendarAccounts } from '@/lib/client/default/default';
import { GetGoogleCalendarAccounts200Item } from '@/lib/api/models';

import { CalendarAccountsSheet } from './calendar-accounts-sheet';
import { CalendarChatView } from './calendar-chat-view';
import { CalendarIntegrationModal } from './calendar-integration-modal';
import { CalendarSetupView } from './calendar-setup-view';

type CalendarIntegrationShellProps = {
  initialAccounts: GetGoogleCalendarAccounts200Item[];
};

export function CalendarIntegrationShell({
  initialAccounts,
}: CalendarIntegrationShellProps) {
  const { data: response } = useGetGoogleCalendarAccounts();
  const accounts = response
    ? response.status === 200
      ? response.data
      : []
    : initialAccounts;

  const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState(false);
  const [isAccountsSheetOpen, setIsAccountsSheetOpen] = useState(false);

  const hasAccounts = accounts.length > 0;

  return (
    <div className="flex flex-col h-full max-h-[calc(100dvh-(var(--header-height))-(var(--spacing)*4))] overflow-hidden">
      <div className="flex shrink-0 w-full items-center px-4 py-2 justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsAccountsSheetOpen(true)}
          className="ml-auto"
        >
          Your accounts
        </Button>
      </div>
      {hasAccounts ? (
        <CalendarChatView className="flex-1 min-h-0" />
      ) : (
        <CalendarSetupView
          onAddAccount={() => setIsIntegrationModalOpen(true)}
        />
      )}

      <CalendarAccountsSheet
        open={hasAccounts && isAccountsSheetOpen}
        onOpenChange={setIsAccountsSheetOpen}
        accounts={accounts}
        onAddAccount={() => {
          setIsIntegrationModalOpen(true);
        }}
      />

      <CalendarIntegrationModal
        open={isIntegrationModalOpen}
        onOpenChange={setIsIntegrationModalOpen}
      />
    </div>
  );
}
