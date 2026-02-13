import { cookies } from 'next/headers';

import { buildApiUrl } from '@/lib/api-url';

import { EmailIntegrationShell } from './components/email-integration-shell';
import type { EmailAccount } from './types';

async function getEmailAccounts(): Promise<EmailAccount[]> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');

  try {
    const response = await fetch(buildApiUrl('/gmail-accounts'), {
      cache: 'no-store',
      headers: {
        Cookie: cookieHeader,
      },
    });

    if (response.status !== 200) {
      return [];
    }

    const data = (await response.json()) as unknown;
    if (!Array.isArray(data)) {
      return [];
    }

    return data.flatMap((item) => {
      if (
        typeof item === 'object' &&
        item !== null &&
        'email' in item &&
        'provider' in item &&
        typeof item.email === 'string' &&
        item.provider === 'gmail'
      ) {
        return [
          {
            email: item.email,
            provider: 'gmail' as const,
          },
        ];
      }

      return [];
    });
  } catch {
    return [];
  }
}

export default async function Page() {
  const initialAccounts = await getEmailAccounts();

  return <EmailIntegrationShell initialAccounts={initialAccounts} />;
}
