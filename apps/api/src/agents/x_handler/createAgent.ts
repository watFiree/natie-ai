import { createAgent as createLangChainAgent, StructuredTool } from 'langchain';
import { model } from './model';

export function createAgent(systemPrompt: string, tools: StructuredTool[]) {
  return createLangChainAgent({
    model: model,
    systemPrompt: systemPrompt,
    tools: tools,
  });
}
