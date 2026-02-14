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
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <h1 className="mb-2 text-2xl font-bold">Email Integration</h1>
            <p className="text-muted-foreground">
              Connect your email accounts and chat with Natie about your
              messages.
            </p>
          </div>

          <div className="space-y-4 px-4 lg:px-6">
            {hasAccounts ? (
              <>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAccountsSheetOpen(true)}
                  >
                    Accounts
                  </Button>
                </div>
                <EmailChatView />
              </>
            ) : (
              <EmailSetupView
                onAddAccount={() => setIsIntegrationModalOpen(true)}
              />
            )}
          </div>
        </div>
      </div>

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
