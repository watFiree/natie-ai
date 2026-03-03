'use client';

import { useMemo, useState } from 'react';
import { IconBrandGoogle } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { buildApiUrl } from '@/lib/api-url';
import { GetCalendarAccounts200ItemProvider } from '@/lib/api/models';

const PROVIDERS = [
  {
    value: GetCalendarAccounts200ItemProvider.google,
    label: 'Google Calendar',
  } as const,
];

type CalendarIntegrationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CalendarIntegrationModal({
  open,
  onOpenChange,
}: CalendarIntegrationModalProps) {
  const [selectedProvider, setSelectedProvider] =
    useState<GetCalendarAccounts200ItemProvider>(
      GetCalendarAccounts200ItemProvider.google
    );

  const providerOption = useMemo(
    () => PROVIDERS.find((provider) => provider.value === selectedProvider),
    [selectedProvider]
  );

  const redirectUrl =
    selectedProvider === GetCalendarAccounts200ItemProvider.google
      ? buildApiUrl('/oauth/google/calendar')
      : undefined;

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      setSelectedProvider(GetCalendarAccounts200ItemProvider.google);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Add calendar integration</SheetTitle>
          <SheetDescription>
            Select provider and continue to OAuth setup.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-6">
          <div className="space-y-2">
            <p className="text-sm font-medium">Provider</p>
            <Select
              value={selectedProvider}
              onValueChange={(value) => {
                if (value === GetCalendarAccounts200ItemProvider.google) {
                  setSelectedProvider(
                    GetCalendarAccounts200ItemProvider.google
                  );
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {PROVIDERS.map((provider) => (
                  <SelectItem key={provider.value} value={provider.value}>
                    {provider.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {providerOption && redirectUrl ? (
            <div className="space-y-2">
              <Button asChild className="w-full">
                <a href={redirectUrl}>
                  <IconBrandGoogle />
                  Connect {providerOption.label}
                </a>
              </Button>
              <p className="text-muted-foreground text-xs">
                You will be redirected to the provider authorization screen.
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              Select provider to show redirect button.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
