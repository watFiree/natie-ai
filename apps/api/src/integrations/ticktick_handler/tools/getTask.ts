import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { TickTickTokenProvider } from './consts';
import { ticktickApiRequest } from '../../../modules/ticktick/service';

export class TickTickGetTaskTool extends StructuredTool {
  name = 'ticktick_get_task';
  description =
    'Get details of a specific task from TickTick. Requires the task ID and project ID.';

  schema = z.object({
    taskId: z.string().describe('The ID of the task to retrieve'),
    projectId: z.string().describe('The project ID that the task belongs to'),
  });

  constructor(private readonly tokenProvider: TickTickTokenProvider) {
    super();
  }

  async _call(input: { taskId: string; projectId: string }) {
    const token = await this.tokenProvider();

    const response = await ticktickApiRequest(
      token,
      `/project/${input.projectId}/task/${input.taskId}`
    );

    if (!response.ok) {
      const errorBody = await response.text();
      return `Error fetching task: ${response.status} ${errorBody}`;
    }

    const task = await response.json();
    return JSON.stringify(task, null, 2);
  }
}
