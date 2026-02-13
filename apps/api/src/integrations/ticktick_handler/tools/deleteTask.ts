import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { TickTickTokenProvider } from './consts';
import { ticktickApiRequest } from '../../../modules/ticktick/service';

export class TickTickDeleteTaskTool extends StructuredTool {
  name = 'ticktick_delete_task';
  description =
    'Delete a task from TickTick. Requires the task ID and project ID.';

  schema = z.object({
    taskId: z.string().describe('The ID of the task to delete'),
    projectId: z.string().describe('The project ID that the task belongs to'),
  });

  constructor(private readonly tokenProvider: TickTickTokenProvider) {
    super();
  }

  async _call(input: { taskId: string; projectId: string }) {
    const token = await this.tokenProvider();

    const response = await ticktickApiRequest(
      token,
      `/project/${input.projectId}/task/${input.taskId}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      return `Error deleting task: ${response.status} ${errorBody}`;
    }

    return 'Task deleted successfully.';
  }
}
