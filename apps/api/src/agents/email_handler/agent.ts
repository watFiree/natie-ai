import { createAgent as createLangChainAgent } from 'langchain/dist/agents/index.cjs';
import { model } from './model';
import { StructuredTool } from 'langchain';

export function createAgent(systemPrompt: string, tools: StructuredTool[]) {
  return createLangChainAgent({
    model: model,
    systemPrompt: systemPrompt,
    tools: tools,
  });
}