import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { TickTickTokenProvider } from './consts';
import { ticktickApiRequest } from '../../../modules/ticktick/service';

export class TickTickGetProjectDataTool extends StructuredTool {
  name = 'ticktick_get_project_data';
  description =
    'Get detailed data for a specific project, including all its tasks. Requires the project ID.';

  schema = z.object({
    projectId: z.string().describe('The ID of the project to retrieve data for'),
  });

  constructor(private readonly tokenProvider: TickTickTokenProvider) {
    super();
  }

  async _call(input: { projectId: string }) {
    const token = await this.tokenProvider();

    const response = await ticktickApiRequest(
      token,
      `/project/${input.projectId}/data`
    );

    if (!response.ok) {
      const errorBody = await response.text();
      return `Error fetching project data: ${response.status} ${errorBody}`;
    }

    const projectData = await response.json();
    return JSON.stringify(projectData, null, 2);
  }
}
