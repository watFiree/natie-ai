import { StructuredTool } from '@langchain/core/tools';
import { TickTickTokenProvider } from './consts';
import { TickTickGetProjectsTool } from './getProjects';
import { TickTickGetProjectDataTool } from './getProjectData';
import { TickTickCreateTaskTool } from './createTask';
import { TickTickUpdateTaskTool } from './updateTask';
import { TickTickCompleteTaskTool } from './completeTask';
import { TickTickDeleteTaskTool } from './deleteTask';
import { TickTickGetTaskTool } from './getTask';

export const createTools = (
  tokenProvider: TickTickTokenProvider
): StructuredTool[] => [
  new TickTickGetProjectsTool(tokenProvider),
  new TickTickGetProjectDataTool(tokenProvider),
  new TickTickCreateTaskTool(tokenProvider),
  new TickTickUpdateTaskTool(tokenProvider),
  new TickTickCompleteTaskTool(tokenProvider),
  new TickTickDeleteTaskTool(tokenProvider),
  new TickTickGetTaskTool(tokenProvider),
];
