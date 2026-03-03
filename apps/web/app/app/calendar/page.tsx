import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { getGoogleCalendarAccounts } from '@/lib/api/default/default';
import { CalendarIntegrationShell } from './components/calendar-integration-shell';
import { CalendarToastHandler } from './components/calendar-toast-handler';

async function getCalendarAccountsData() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');

  try {
    const response = await getGoogleCalendarAccounts({
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
  const initialAccounts = await getCalendarAccountsData();

  return (
    <>
      <Suspense>
        <CalendarToastHandler />
      </Suspense>
      <CalendarIntegrationShell initialAccounts={initialAccounts} />
    </>
  );
}
