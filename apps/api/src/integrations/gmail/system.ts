import gmailPrompt from '../../prompts/gmail.json' with { type: 'json' };

export function createSystemPrompt(
  labels: string[],
  emailAccounts: string[]
): string {
  const labelsSection =
    labels.length > 0
      ? `Available email labels for organizing:\n${labels.map((l) => `- ${l}`).join('\n')}`
      : 'No specific labels are configured for this user.';

  const emailAccountsList = emailAccounts
    .map((email) => `- ${email}`)
    .join('\n');

  return [
    gmailPrompt.role,
    `## Email Accounts\n${emailAccountsList}\n- ${gmailPrompt.emailAccountsRule}`,
    gmailPrompt.capabilities,
    gmailPrompt.guidelines,
    `## ${labelsSection}`,
    gmailPrompt.labelsFooter,
  ].join('\n\n');
}
