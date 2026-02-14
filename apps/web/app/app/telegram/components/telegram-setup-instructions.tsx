'use client';

export function TelegramSetupInstructions() {
  return (
    <ol className="list-decimal space-y-4 pl-4 text-sm leading-relaxed">
      <li>
        <strong>Open Telegram</strong> on your phone or desktop and start a
        conversation with{' '}
        <a
          href="https://t.me/userinfobot"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          @userinfobot
        </a>{' '}
        (or any bot that returns your user ID).
      </li>
      <li>
        <strong>Send any message</strong> to the bot. It will reply with your
        Telegram account information, including your <strong>User ID</strong>{' '}
        (a numeric value like <code className="bg-muted rounded px-1">123456789</code>).
      </li>
      <li>
        <strong>Copy your User ID</strong> and paste it into the form on the
        right.
      </li>
      <li>
        <strong>Find the Natie bot</strong> on Telegram and start a conversation.
        Once your User ID is saved here, you can send messages to the bot
        directly from Telegram.
      </li>
    </ol>
  );
}
