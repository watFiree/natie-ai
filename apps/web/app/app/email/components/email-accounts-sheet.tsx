'use client';

import { IconCirclePlus } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { GetGmailAccounts200Item } from '@/lib/client/model';

import { GmailAccountCard } from './gmail-account-card';

type EmailAccountsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: GetGmailAccounts200Item[];
  onAddAccount: () => void;
};

export function EmailAccountsSheet({
  open,
  onOpenChange,
  accounts,
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
          {accounts.map((account) => (
            <GmailAccountCard key={account.email} account={account} />
          ))}

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
        </div>
      </SheetContent>
    </Sheet>
  );
}
