import natiePrompt from '../../prompts/natie.json' with { type: 'json' };

export function createSystemPrompt(): string {
  return [
    natiePrompt.role,
    natiePrompt.subagents,
    natiePrompt.guidelines,
  ].join('\n\n');
}
