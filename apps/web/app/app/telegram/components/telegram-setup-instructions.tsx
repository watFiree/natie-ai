export function TelegramSetupInstructions() {
  return (
    <ol className="list-decimal space-y-4 pl-4 text-sm leading-relaxed">
      <li>
        <strong>Open Telegram</strong> on your phone or desktop and search for{' '}
        <a
          href="https://t.me/NatieAi_bot"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          @NatieAi_bot
        </a>
        .
      </li>
      <li>
        <strong>Send any message</strong> to Natie. She will reply with your{' '}
        <strong>Telegram User ID</strong> (a numeric value like{' '}
        <code className="bg-muted rounded px-1">123456789</code>).
      </li>
      <li>
        <strong>Copy your User ID</strong> and paste it into the form on the
        right.
      </li>
      <li>
        Once your User ID is saved, you can{' '}
        <strong>chat with Natie directly from Telegram</strong> by sending
        messages to{' '}
        <a
          href="https://t.me/NatieAi_bot"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          @NatieAi_bot
        </a>
        .
      </li>
    </ol>
  );
}
