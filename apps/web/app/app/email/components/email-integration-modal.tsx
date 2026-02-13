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

import type { EmailProvider } from '../types';

type ProviderOption = {
  value: EmailProvider;
  label: string;
};

const PROVIDERS: ProviderOption[] = [
  {
    value: 'gmail',
    label: 'Gmail',
  },
];

type EmailIntegrationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EmailIntegrationModal({
  open,
  onOpenChange,
}: EmailIntegrationModalProps) {
  const [selectedProvider, setSelectedProvider] = useState<EmailProvider | ''>(
    ''
  );

  const providerOption = useMemo(
    () => PROVIDERS.find((provider) => provider.value === selectedProvider),
    [selectedProvider]
  );

  const redirectUrl =
    selectedProvider === 'gmail' ? buildApiUrl('/auth/google') : null;

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      setSelectedProvider('');
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add email integration</SheetTitle>
          <SheetDescription>
            Select provider and continue to OAuth setup.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-6">
          <div className="space-y-2">
            <p className="text-sm font-medium">Provider</p>
            <Select
              value={selectedProvider}
              onValueChange={(value) =>
                setSelectedProvider(value as EmailProvider)
              }
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
