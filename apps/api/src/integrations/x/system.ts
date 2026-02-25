import xPrompt from '../../prompts/x.json' with { type: 'json' };

export function createSystemPrompt(): string {
  return [
    xPrompt.role,
    xPrompt.capabilities,
    xPrompt.guidelines,
    xPrompt.footer,
  ].join('\n\n');
}
