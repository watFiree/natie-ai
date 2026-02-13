import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { TickTickTokenProvider } from './consts';
import { ticktickApiRequest } from '../../../modules/ticktick/service';

export class TickTickUpdateTaskTool extends StructuredTool {
  name = 'ticktick_update_task';
  description =
    'Update an existing task in TickTick. You can update the title, content, due date, priority, and more. Requires the task ID and project ID.';

  schema = z.object({
    taskId: z.string().describe('The ID of the task to update'),
    projectId: z.string().describe('The project ID that the task belongs to'),
    title: z.string().optional().describe('The new title for the task'),
    content: z.string().optional().describe('The new description/content for the task'),
    dueDate: z
      .string()
      .optional()
      .describe('The new due date in ISO 8601 format'),
    startDate: z
      .string()
      .optional()
      .describe('The new start date in ISO 8601 format'),
    priority: z
      .number()
      .optional()
      .describe('Priority: 0 (none), 1 (low), 3 (medium), 5 (high)'),
    isAllDay: z
      .boolean()
      .optional()
      .describe('Whether the task is an all-day task'),
  });

  constructor(private readonly tokenProvider: TickTickTokenProvider) {
    super();
  }

  async _call(input: {
    taskId: string;
    projectId: string;
    title?: string;
    content?: string;
    dueDate?: string;
    startDate?: string;
    priority?: number;
    isAllDay?: boolean;
  }) {
    const token = await this.tokenProvider();

    const body: Record<string, unknown> = {
      id: input.taskId,
      projectId: input.projectId,
    };

    if (input.title) body.title = input.title;
    if (input.content) body.content = input.content;
    if (input.dueDate) body.dueDate = input.dueDate;
    if (input.startDate) body.startDate = input.startDate;
    if (input.priority !== undefined) body.priority = input.priority;
    if (input.isAllDay !== undefined) body.isAllDay = input.isAllDay;

    const response = await ticktickApiRequest(
      token,
      `/task/${input.taskId}`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      return `Error updating task: ${response.status} ${errorBody}`;
    }

    const task = await response.json();
    return JSON.stringify(task, null, 2);
  }
}
