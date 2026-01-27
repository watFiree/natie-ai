import { createAgent } from 'langchain/dist/agents/index.cjs';
import { model } from './model';
import { tools } from './tools/gmail';

export const agent = createAgent({
  model: model,
  description:
    'Email Handler is a agent that handles emails. It can read emails, send emails, organize emails and delete emails.',
  tools: tools,
});
