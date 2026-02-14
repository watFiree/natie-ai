import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { getGmailAccounts } from '@/lib/api/default/default';
import { EmailIntegrationShell } from './components/email-integration-shell';
import { EmailToastHandler } from './components/email-toast-handler';

async function getEmailAccounts() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');

  try {
    const response = await getGmailAccounts({
      cache: 'no-store',
      headers: {
        Cookie: cookieHeader,
      },
    });

    if (response.status !== 200) {
      return [];
    }

    const data = response.data;

    return data;
  } catch {
    return [];
  }
}

export default async function Page() {
  const initialAccounts = await getEmailAccounts();

  return (
    <>
      <Suspense>
        <EmailToastHandler />
      </Suspense>
      <EmailIntegrationShell initialAccounts={initialAccounts} />
    </>
  );
}
