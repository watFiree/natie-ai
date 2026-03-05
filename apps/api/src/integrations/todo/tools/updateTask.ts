import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { TokenProvider, createTickTickClient } from './consts';

export class TickTickUpdateTaskTool extends StructuredTool {
  name = 'ticktick_update_task';
  description = 'Update an existing task in TickTick. Requires both taskId and projectId.';

  schema = z.object({
    taskId: z.string().describe('The ID of the task to update'),
    projectId: z.string().describe('The project ID the task belongs to'),
    title: z.string().optional().describe('New title for the task'),
    content: z
      .string()
      .optional()
      .describe('New description/content for the task'),
    dueDate: z
      .string()
      .optional()
      .describe('New due date in ISO 8601 format (e.g. 2026-03-05T10:00:00+0000)'),
    priority: z
      .number()
      .optional()
      .describe('New priority: 0 (none), 1 (low), 3 (medium), 5 (high)'),
    tags: z
      .array(z.string())
      .optional()
      .describe('New tags for the task'),
  });

  constructor(private readonly tokenProvider: TokenProvider) {
    super();
  }

  async _call(input: {
    taskId: string;
    projectId: string;
    title?: string;
    content?: string;
    dueDate?: string;
    priority?: number;
    tags?: string[];
  }) {
    try {
      const token = await this.tokenProvider();
      const client = createTickTickClient(token);

      const body: Record<string, unknown> = {
        id: input.taskId,
        projectId: input.projectId,
      };
      if (input.title !== undefined) body.title = input.title;
      if (input.content !== undefined) body.content = input.content;
      if (input.dueDate !== undefined) body.dueDate = input.dueDate;
      if (input.priority !== undefined) body.priority = input.priority;
      if (input.tags !== undefined) body.tags = input.tags;

      await client.post(`/task/${input.taskId}`, body);

      return `Task ${input.taskId} updated successfully.`;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return `Failed to update task: ${message}`;
    }
  }
}
