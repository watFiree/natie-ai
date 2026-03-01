'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useGetGmailAccounts } from '@/lib/client/default/default';
import { GetGmailAccounts200Item } from '@/lib/api/models';

import { EmailAccountsSheet } from './email-accounts-sheet';
import { EmailChatView } from './email-chat-view';
import { EmailIntegrationModal } from './email-integration-modal';
import { EmailSetupView } from './email-setup-view';

type EmailIntegrationShellProps = {
  initialAccounts: GetGmailAccounts200Item[];
};

export function EmailIntegrationShell({
  initialAccounts,
}: EmailIntegrationShellProps) {
  const { data: response } = useGetGmailAccounts();
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
        <EmailChatView className="flex-1 min-h-0" />
      ) : (
        <EmailSetupView onAddAccount={() => setIsIntegrationModalOpen(true)} />
      )}

      <EmailAccountsSheet
        open={hasAccounts && isAccountsSheetOpen}
        onOpenChange={setIsAccountsSheetOpen}
        accounts={accounts}
        onAddAccount={() => {
          setIsIntegrationModalOpen(true);
        }}
      />

      <EmailIntegrationModal
        open={isIntegrationModalOpen}
        onOpenChange={setIsIntegrationModalOpen}
      />
    </div>
  );
}
