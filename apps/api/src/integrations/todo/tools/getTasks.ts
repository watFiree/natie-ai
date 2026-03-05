import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { TokenProvider, createTickTickClient } from './consts';

interface TickTickTask {
  id?: string;
  title?: string;
  content?: string;
  projectId?: string;
  dueDate?: string;
  priority?: number;
  status?: number;
  tags?: string[];
}

function isTickTickTaskArray(value: unknown): value is TickTickTask[] {
  return Array.isArray(value);
}

export class TickTickGetTasksTool extends StructuredTool {
  name = 'ticktick_get_tasks';
  description = 'List tasks from TickTick. Returns all tasks or tasks from a specific project.';

  schema = z.object({
    projectId: z
      .string()
      .optional()
      .describe('Optional project ID to filter tasks by project'),
  });

  constructor(private readonly tokenProvider: TokenProvider) {
    super();
  }

  async _call(input: { projectId?: string }) {
    try {
      const token = await this.tokenProvider();
      const client = createTickTickClient(token);

      const path = input.projectId
        ? `/project/${input.projectId}/data`
        : '/task';

      const data = await client.get(path);

      let tasks: TickTickTask[];
      if (input.projectId && typeof data === 'object' && data !== null && 'tasks' in data) {
        const projectData = data;
        if (
          typeof projectData === 'object' &&
          projectData !== null &&
          'tasks' in projectData &&
          isTickTickTaskArray(projectData.tasks)
        ) {
          tasks = projectData.tasks;
        } else {
          tasks = [];
        }
      } else if (isTickTickTaskArray(data)) {
        tasks = data;
      } else {
        tasks = [];
      }

      if (tasks.length === 0) {
        return 'No tasks found.';
      }

      return tasks
        .map((task) => {
          const priorityLabels: Record<number, string> = {
            0: 'None',
            1: 'Low',
            3: 'Medium',
            5: 'High',
          };
          const priority =
            task.priority !== undefined
              ? priorityLabels[task.priority] ?? String(task.priority)
              : 'None';

          return [
            `Task: ${task.title ?? '(no title)'}`,
            `  ID: ${task.id ?? 'unknown'}`,
            `  Project ID: ${task.projectId ?? 'unknown'}`,
            task.content ? `  Content: ${task.content}` : null,
            task.dueDate ? `  Due: ${task.dueDate}` : null,
            `  Priority: ${priority}`,
            task.tags && task.tags.length > 0
              ? `  Tags: ${task.tags.join(', ')}`
              : null,
            `  Status: ${task.status === 2 ? 'Completed' : 'Active'}`,
          ]
            .filter(Boolean)
            .join('\n');
        })
        .join('\n\n');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return `Failed to list tasks: ${message}`;
    }
  }
}
