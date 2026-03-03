import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { TokenProvider, createCalendarClient } from './consts';

export class GoogleCalendarDeleteEventTool extends StructuredTool {
  name = 'google_calendar_delete_event';
  description =
    'Delete a Google Calendar event by its event ID for a selected account';

  schema = z.object({
    accountEmail: z.email(),
    eventId: z.string().describe('The ID of the event to delete'),
  });

  constructor(private readonly tokenProvider: TokenProvider) {
    super();
  }

  async _call(input: { accountEmail: string; eventId: string }) {
    try {
      const token = await this.tokenProvider(input.accountEmail);
      const calendar = createCalendarClient(token);

      await calendar.events.delete({
        calendarId: input.accountEmail,
        eventId: input.eventId,
      });

      return `Event ${input.eventId} has been deleted successfully.`;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return `Failed to delete calendar event: ${message}`;
    }
  }
}
