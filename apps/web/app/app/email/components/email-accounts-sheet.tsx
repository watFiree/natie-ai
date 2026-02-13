'use client';

import { IconBrandGoogle, IconCirclePlus } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import type { EmailAccount, EmailProvider } from '../types';

type EmailAccountsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: EmailAccount[];
  deletingEmail: string | null;
  deleteError: string | null;
  onDeleteAccount: (email: string) => void;
  onAddAccount: () => void;
};

function ProviderIcon({ provider }: { provider: EmailProvider }) {
  if (provider === 'gmail') {
    return <IconBrandGoogle className="text-muted-foreground size-5" />;
  }

  return null;
}

export function EmailAccountsSheet({
  open,
  onOpenChange,
  accounts,
  deletingEmail,
  deleteError,
  onDeleteAccount,
  onAddAccount,
}: EmailAccountsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Connected accounts</SheetTitle>
          <SheetDescription>
            Manage connected email accounts and add new ones.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-3 px-4 pb-6">
          {accounts.map((account) => {
            const isDeleting = deletingEmail === account.email;

            return (
              <Card key={account.email}>
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3">
                    <ProviderIcon provider={account.provider} />
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{account.email}</p>
                      <p className="text-muted-foreground text-xs capitalize">
                        {account.provider}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isDeleting}
                    onClick={() => onDeleteAccount(account.email)}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}

          <Card className="border-dashed">
            <CardContent className="p-2">
              <Button
                type="button"
                variant="ghost"
                className="h-auto w-full justify-start py-3"
                onClick={onAddAccount}
              >
                <IconCirclePlus />
                Add new
              </Button>
            </CardContent>
          </Card>

          {deleteError && (
            <p className="text-destructive text-sm" role="alert">
              {deleteError}
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
