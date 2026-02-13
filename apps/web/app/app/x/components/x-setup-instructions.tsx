import { IconExternalLink } from '@tabler/icons-react';

const X_COOKIE_VIDEO_EMBED_URL =
  'https://www.youtube.com/embed?listType=search&list=how+to+extract+auth_token+ct0+cookie+x.com';
const X_COOKIE_VIDEO_RESULTS_URL =
  'https://www.youtube.com/results?search_query=how+to+extract+auth_token+ct0+cookie+x.com';

const SETUP_STEPS = [
  'Log in to x.com in your desktop browser.',
  'Open Developer Tools, then go to Application (or Storage) > Cookies > https://x.com.',
  'Copy the value of the auth_token cookie and paste it into the auth_token field.',
  'Copy the value of the ct0 cookie and paste it into the ct0 field.',
  'Save credentials and chat with Natie about X.',
];

export function XSetupInstructions() {
  return (
    <div className="space-y-5 text-sm">
      <p className="text-muted-foreground">
        X integration requires two cookie values from your active{' '}
        <a
          href="https://x.com"
          target="_blank"
          rel="noreferrer"
          className="text-primary inline-flex items-center gap-1 hover:underline"
        >
          x.com session
          <IconExternalLink className="size-3.5" />
        </a>
        .
      </p>

      <ol className="text-muted-foreground list-decimal space-y-2 pl-5">
        {SETUP_STEPS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      <div className="rounded-md border p-3 text-xs leading-relaxed">
        Treat these cookie values as secrets. Do not share them in screenshots,
        commits, or public messages.
      </div>

      <div className="space-y-2">
        <p className="font-medium">Video walkthrough</p>
        <div className="overflow-hidden rounded-md border bg-black">
          <div className="aspect-video w-full">
            <iframe
              title="How to extract auth_token and ct0 cookies from x.com"
              src={X_COOKIE_VIDEO_EMBED_URL}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
        <a
          href={X_COOKIE_VIDEO_RESULTS_URL}
          target="_blank"
          rel="noreferrer"
          className="text-primary inline-flex items-center gap-1 text-xs hover:underline"
        >
          Open tutorial search in a new tab
          <IconExternalLink className="size-3" />
        </a>
      </div>
    </div>
  );
}
