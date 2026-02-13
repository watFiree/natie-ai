'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { buildApiUrl } from '@/lib/api-url';

import { EmailAccountsSheet } from './email-accounts-sheet';
import { EmailChatView } from './email-chat-view';
import { EmailIntegrationModal } from './email-integration-modal';
import { EmailSetupView } from './email-setup-view';
import type { EmailAccount } from '../types';

type EmailIntegrationShellProps = {
  initialAccounts: EmailAccount[];
};

async function deleteAccount(email: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const response = await fetch(
      buildApiUrl(`/gmail-accounts?email=${encodeURIComponent(email)}`),
      {
        method: 'DELETE',
        credentials: 'include',
      }
    );

    if (response.status === 200) {
      return { ok: true };
    }

    const body = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;

    return {
      ok: false,
      error: body?.error ?? 'Could not delete account. Please try again.',
    };
  } catch {
    return {
      ok: false,
      error: 'Could not delete account. Please try again.',
    };
  }
}

export function EmailIntegrationShell({
  initialAccounts,
}: EmailIntegrationShellProps) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState(false);
  const [isAccountsSheetOpen, setIsAccountsSheetOpen] = useState(false);
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const hasAccounts = accounts.length > 0;

  const handleDeleteAccount = async (email: string) => {
    setDeletingEmail(email);
    setDeleteError(null);

    const result = await deleteAccount(email);

    if (!result.ok) {
      setDeleteError(result.error ?? 'Could not delete account. Please try again.');
      setDeletingEmail(null);
      return;
    }

    setAccounts((currentAccounts) => {
      const nextAccounts = currentAccounts.filter(
        (account) => account.email !== email
      );

      if (nextAccounts.length === 0) {
        setIsAccountsSheetOpen(false);
      }

      return nextAccounts;
    });
    setDeletingEmail(null);
  };

  const openAddAccountModal = () => {
    setDeleteError(null);
    setIsIntegrationModalOpen(true);
  };

  const openAddAccountModalFromSheet = () => {
    setDeleteError(null);
    setIsAccountsSheetOpen(false);
    setIsIntegrationModalOpen(true);
  };

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
              <EmailSetupView onAddAccount={openAddAccountModal} />
            )}
          </div>
        </div>
      </div>

      <EmailAccountsSheet
        open={hasAccounts && isAccountsSheetOpen}
        onOpenChange={setIsAccountsSheetOpen}
        accounts={accounts}
        deletingEmail={deletingEmail}
        deleteError={deleteError}
        onDeleteAccount={handleDeleteAccount}
        onAddAccount={openAddAccountModalFromSheet}
      />

      <EmailIntegrationModal
        open={isIntegrationModalOpen}
        onOpenChange={setIsIntegrationModalOpen}
      />
    </div>
  );
}
