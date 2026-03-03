import calendarPrompt from '../../prompts/google_calendar.json' with { type: 'json' };

export function createSystemPrompt(calendarAccounts: string[]): string {
  const calendarAccountsList = calendarAccounts
    .map((email) => `- ${email}`)
    .join('\n');

  return [
    calendarPrompt.role,
    `## Calendar Accounts\n${calendarAccountsList}\n- ${calendarPrompt.calendarAccountsRule}`,
    calendarPrompt.capabilities,
    calendarPrompt.guidelines,
  ].join('\n\n');
}
