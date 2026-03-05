import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { TokenProvider, createTickTickClient } from './consts';

export class TickTickCompleteTaskTool extends StructuredTool {
  name = 'ticktick_complete_task';
  description = 'Mark a task as complete in TickTick. Requires both projectId and taskId.';

  schema = z.object({
    projectId: z.string().describe('The project ID the task belongs to'),
    taskId: z.string().describe('The ID of the task to complete'),
  });

  constructor(private readonly tokenProvider: TokenProvider) {
    super();
  }

  async _call(input: { projectId: string; taskId: string }) {
    try {
      const token = await this.tokenProvider();
      const client = createTickTickClient(token);

      await client.post(
        `/project/${input.projectId}/task/${input.taskId}/complete`
      );

      return `Task ${input.taskId} marked as complete.`;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return `Failed to complete task: ${message}`;
    }
  }
}
