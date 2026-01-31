import { TwitterClient, resolveCredentials } from '@steipete/bird';
import { XCredentials } from './const';

export async function createClient(credentials: XCredentials) {
  const { cookies, warnings } = await resolveCredentials({
    authToken: credentials?.authToken,
    ct0: credentials?.ct0,
  });

  if (warnings?.length) console.warn('[bird warnings]', warnings);

  return new TwitterClient({ cookies });
}
