import { ChatOpenAI } from '@langchain/openai';

export const model = new ChatOpenAI({
  model: 'gpt-4o',
  temperature: 0.1,
  maxTokens: 1000,
  timeout: 30,
});
