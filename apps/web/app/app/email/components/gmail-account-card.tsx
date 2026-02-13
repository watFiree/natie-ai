'use client';

import { IconBrandGoogle } from '@tabler/icons-react';

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
  const {
    trigger,
    isMutating: isDeleting,
    error: deleteError,
  } = useDeleteGmailAccounts({ email: account.email });

  const handleDelete = async () => {
    const result = await trigger();

    if (result?.status === 200) {
      await mutate();
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

      {deleteError && (
        <p className="text-destructive px-4 pb-3 text-sm" role="alert">
          {deleteError.error}
        </p>
      )}
    </Card>
  );
}
