import { StructuredTool } from '@langchain/core/tools';
import { TickTickGetTasksTool } from './getTasks';
import { TickTickCreateTaskTool } from './createTask';
import { TickTickUpdateTaskTool } from './updateTask';
import { TickTickCompleteTaskTool } from './completeTask';
import { TickTickDeleteTaskTool } from './deleteTask';
import type { TokenProvider } from './consts';

export const createTools = (tokenProvider: TokenProvider): StructuredTool[] => [
  new TickTickGetTasksTool(tokenProvider),
  new TickTickCreateTaskTool(tokenProvider),
  new TickTickUpdateTaskTool(tokenProvider),
  new TickTickCompleteTaskTool(tokenProvider),
  new TickTickDeleteTaskTool(tokenProvider),
];
