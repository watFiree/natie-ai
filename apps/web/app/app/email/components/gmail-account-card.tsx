'use client';

import { IconBrandGoogle } from '@tabler/icons-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  useDeleteGmailAccounts,
  useGetGmailAccounts,
} from '@/lib/client/default/default';
import {
  GetGmailAccounts200Item,
  GetGmailAccounts200ItemProvider,
} from '@/lib/client/model';

function ProviderIcon({
  provider,
}: {
  provider: GetGmailAccounts200ItemProvider;
}) {
  if (provider === 'gmail') {
    return <IconBrandGoogle className="text-muted-foreground size-5" />;
  }

  return null;
}

export function GmailAccountCard({
  account,
}: {
  account: GetGmailAccounts200Item;
}) {
  const { mutate } = useGetGmailAccounts();
  const { trigger, isMutating: isDeleting } = useDeleteGmailAccounts({
    email: account.email,
  });

  const handleDelete = async () => {
    try {
      const result = await trigger();

      if (result?.status === 200) {
        await mutate();
        toast.success('Account removed', {
          description: `${account.email} has been disconnected.`,
        });
      }
    } catch {
      toast.error('Deletion failed', {
        description: `Could not remove ${account.email}. Please try again.`,
      });
    }
  };

  return (
    <Card>
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
          onClick={handleDelete}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </CardContent>
    </Card>
  );
}
