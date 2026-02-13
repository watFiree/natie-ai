import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { TickTickTokenProvider } from './consts';
import { ticktickApiRequest } from '../../../modules/ticktick/service';

export class TickTickCompleteTaskTool extends StructuredTool {
  name = 'ticktick_complete_task';
  description =
    'Mark a task as complete in TickTick. Requires the task ID and project ID.';

  schema = z.object({
    taskId: z.string().describe('The ID of the task to complete'),
    projectId: z.string().describe('The project ID that the task belongs to'),
  });

  constructor(private readonly tokenProvider: TickTickTokenProvider) {
    super();
  }

  async _call(input: { taskId: string; projectId: string }) {
    const token = await this.tokenProvider();

    const response = await ticktickApiRequest(
      token,
      `/project/${input.projectId}/task/${input.taskId}/complete`,
      {
        method: 'POST',
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      return `Error completing task: ${response.status} ${errorBody}`;
    }

    return 'Task completed successfully.';
  }
}
