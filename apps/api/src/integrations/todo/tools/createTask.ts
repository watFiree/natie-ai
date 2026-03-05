import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { TokenProvider, createTickTickClient } from './consts';

export class TickTickCreateTaskTool extends StructuredTool {
  name = 'ticktick_create_task';
  description = 'Create a new task in TickTick';

  schema = z.object({
    title: z.string().describe('Title of the task'),
    content: z.string().optional().describe('Description/content of the task'),
    dueDate: z
      .string()
      .optional()
      .describe('Due date in ISO 8601 format (e.g. 2026-03-05T10:00:00+0000)'),
    priority: z
      .number()
      .optional()
      .describe('Priority: 0 (none), 1 (low), 3 (medium), 5 (high)'),
    projectId: z
      .string()
      .optional()
      .describe('Project ID to add the task to'),
    tags: z
      .array(z.string())
      .optional()
      .describe('Tags to add to the task'),
  });

  constructor(private readonly tokenProvider: TokenProvider) {
    super();
  }

  async _call(input: {
    title: string;
    content?: string;
    dueDate?: string;
    priority?: number;
    projectId?: string;
    tags?: string[];
  }) {
    try {
      const token = await this.tokenProvider();
      const client = createTickTickClient(token);

      const body: Record<string, unknown> = {
        title: input.title,
      };
      if (input.content !== undefined) body.content = input.content;
      if (input.dueDate !== undefined) body.dueDate = input.dueDate;
      if (input.priority !== undefined) body.priority = input.priority;
      if (input.projectId !== undefined) body.projectId = input.projectId;
      if (input.tags !== undefined) body.tags = input.tags;

      const result = await client.post('/task', body);

      if (typeof result === 'object' && result !== null && 'id' in result) {
        const task = result;
        const id = 'id' in task ? task.id : 'unknown';
        const title = 'title' in task ? task.title : input.title;
        return `Task created successfully.\n  ID: ${String(id)}\n  Title: ${String(title)}`;
      }

      return 'Task created successfully.';
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return `Failed to create task: ${message}`;
    }
  }
}
