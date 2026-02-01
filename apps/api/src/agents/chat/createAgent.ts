import { createAgent as createLangChainAgent } from 'langchain';
import { model } from './model';
import { createSystemPrompt } from './system';

/**
 * Create and return a LangChain agent configured for chat use.
 *
 * The agent is constructed using the module's imported `model` and the result of `createSystemPrompt()`.
 *
 * @returns The configured LangChain agent instance
 */
export function createAgent() {
  return createLangChainAgent({
    model: model,
    systemPrompt: createSystemPrompt(),
  });
}