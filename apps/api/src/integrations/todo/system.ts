import todoPrompt from '../../prompts/todo.json' with { type: 'json' };

export function createSystemPrompt(): string {
  return [
    todoPrompt.role,
    todoPrompt.capabilities,
    todoPrompt.guidelines,
  ].join('\n\n');
}
