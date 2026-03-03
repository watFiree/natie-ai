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
import { GetGoogleCalendarAccounts200Item } from '@/lib/api/models';

import { CalendarAccountCard } from './calendar-account-card';

type CalendarAccountsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: GetGoogleCalendarAccounts200Item[];
  onAddAccount: () => void;
};

export function CalendarAccountsSheet({
  open,
  onOpenChange,
  accounts,
  onAddAccount,
}: CalendarAccountsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Connected accounts</SheetTitle>
          <SheetDescription>
            Manage connected calendar accounts and add new ones.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-3 px-4 pb-6">
          {accounts.map((account) => (
            <CalendarAccountCard key={account.email} account={account} />
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
