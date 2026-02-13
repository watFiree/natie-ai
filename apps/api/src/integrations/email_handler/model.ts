import { ChatOpenAI } from '@langchain/openai';

export const MODEL_NAME = 'gpt-4.1-mini';

export const model = new ChatOpenAI({
  model: MODEL_NAME,
  temperature: 0.6,
});
