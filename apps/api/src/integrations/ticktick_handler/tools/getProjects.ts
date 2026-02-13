import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { TickTickTokenProvider } from './consts';
import { ticktickApiRequest } from '../../../modules/ticktick/service';

export class TickTickGetProjectsTool extends StructuredTool {
  name = 'ticktick_get_projects';
  description =
    'Get all projects (task lists) from the TickTick account. Returns a list of projects with their IDs and names.';

  schema = z.object({});

  constructor(private readonly tokenProvider: TickTickTokenProvider) {
    super();
  }

  async _call() {
    const token = await this.tokenProvider();

    const response = await ticktickApiRequest(token, '/project');

    if (!response.ok) {
      const errorBody = await response.text();
      return `Error fetching projects: ${response.status} ${errorBody}`;
    }

    const projects = await response.json();
    return JSON.stringify(projects, null, 2);
  }
}
