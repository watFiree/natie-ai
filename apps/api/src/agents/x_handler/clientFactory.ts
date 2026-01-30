import { TwitterClient, resolveCredentials } from '@steipete/bird';

export async function createClient() {
  const { cookies, warnings } = await resolveCredentials({
    authToken: process.env.AUTH_TOKEN,
    ct0: process.env.CT0,
  });

  if (warnings?.length) console.warn('[bird warnings]', warnings);

  return new TwitterClient({ cookies });
}
