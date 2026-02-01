import { createAgent as createLangChainAgent } from 'langchain';
import { model } from './model';
import { createSystemPrompt } from './system';

export function createAgent() {
  return createLangChainAgent({
    model: model,
    systemPrompt: createSystemPrompt(),
  });
}
