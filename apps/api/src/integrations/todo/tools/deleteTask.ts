import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { TokenProvider, createTickTickClient } from './consts';

export class TickTickDeleteTaskTool extends StructuredTool {
  name = 'ticktick_delete_task';
  description = 'Delete a task from TickTick. Requires both projectId and taskId.';

  schema = z.object({
    projectId: z.string().describe('The project ID the task belongs to'),
    taskId: z.string().describe('The ID of the task to delete'),
  });

  constructor(private readonly tokenProvider: TokenProvider) {
    super();
  }

  async _call(input: { projectId: string; taskId: string }) {
    try {
      const token = await this.tokenProvider();
      const client = createTickTickClient(token);

      await client.delete(
        `/project/${input.projectId}/task/${input.taskId}`
      );

      return `Task ${input.taskId} has been deleted successfully.`;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return `Failed to delete task: ${message}`;
    }
  }
}
