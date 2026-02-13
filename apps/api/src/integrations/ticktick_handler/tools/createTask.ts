import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { TickTickTokenProvider } from './consts';
import { ticktickApiRequest } from '../../../modules/ticktick/service';

export class TickTickCreateTaskTool extends StructuredTool {
  name = 'ticktick_create_task';
  description =
    'Create a new task in TickTick. You can specify the title, content, project, due date, priority, and more.';

  schema = z.object({
    title: z.string().describe('The title of the task'),
    content: z.string().optional().describe('The description/content of the task'),
    projectId: z
      .string()
      .optional()
      .describe('The project ID to add the task to. If not specified, task goes to the inbox.'),
    dueDate: z
      .string()
      .optional()
      .describe(
        'The due date of the task in ISO 8601 format (e.g., 2026-02-14T10:00:00.000+0000)'
      ),
    startDate: z
      .string()
      .optional()
      .describe('The start date of the task in ISO 8601 format'),
    priority: z
      .number()
      .optional()
      .describe('Priority: 0 (none), 1 (low), 3 (medium), 5 (high)'),
    isAllDay: z
      .boolean()
      .optional()
      .describe('Whether the task is an all-day task'),
    timeZone: z
      .string()
      .optional()
      .describe('The timezone for the task (e.g., America/New_York)'),
  });

  constructor(private readonly tokenProvider: TickTickTokenProvider) {
    super();
  }

  async _call(input: {
    title: string;
    content?: string;
    projectId?: string;
    dueDate?: string;
    startDate?: string;
    priority?: number;
    isAllDay?: boolean;
    timeZone?: string;
  }) {
    const token = await this.tokenProvider();

    const body: Record<string, unknown> = {
      title: input.title,
    };

    if (input.content) body.content = input.content;
    if (input.projectId) body.projectId = input.projectId;
    if (input.dueDate) body.dueDate = input.dueDate;
    if (input.startDate) body.startDate = input.startDate;
    if (input.priority !== undefined) body.priority = input.priority;
    if (input.isAllDay !== undefined) body.isAllDay = input.isAllDay;
    if (input.timeZone) body.timeZone = input.timeZone;

    const response = await ticktickApiRequest(token, '/task', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return `Error creating task: ${response.status} ${errorBody}`;
    }

    const task = await response.json();
    return JSON.stringify(task, null, 2);
  }
}
