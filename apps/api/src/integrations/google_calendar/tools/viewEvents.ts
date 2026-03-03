import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { TokenProvider, createCalendarClient } from './consts';

export class GoogleCalendarViewEventsTool extends StructuredTool {
  name = 'google_calendar_view_events';
  description =
    'List Google Calendar events for a selected account within a time range';

  schema = z.object({
    accountEmail: z.email(),
    timeMin: z
      .string()
      .describe(
        'Start of time range in ISO 8601 format (e.g. 2026-03-03T00:00:00Z)'
      ),
    timeMax: z
      .string()
      .describe(
        'End of time range in ISO 8601 format (e.g. 2026-03-10T00:00:00Z)'
      ),
    query: z
      .string()
      .optional()
      .describe('Free-text search term to filter events'),
    maxResults: z
      .number()
      .optional()
      .describe('Maximum number of events to return (default 10)'),
  });

  constructor(private readonly tokenProvider: TokenProvider) {
    super();
  }

  async _call(input: {
    accountEmail: string;
    timeMin: string;
    timeMax: string;
    query?: string;
    maxResults?: number;
  }) {
    try {
      const token = await this.tokenProvider(input.accountEmail);
      const calendar = createCalendarClient(token);

      const response = await calendar.events.list({
        calendarId: input.accountEmail,
        timeMin: input.timeMin,
        timeMax: input.timeMax,
        q: input.query,
        maxResults: input.maxResults ?? 10,
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = response.data.items ?? [];

      if (events.length === 0) {
        return 'No events found in the specified time range.';
      }

      return events
        .map((event) => {
          const start = event.start?.dateTime ?? event.start?.date ?? 'unknown';
          const end = event.end?.dateTime ?? event.end?.date ?? 'unknown';
          const attendees = event.attendees?.map((a) => a.email).join(', ');

          return [
            `Event: ${event.summary ?? '(no title)'}`,
            `  ID: ${event.id}`,
            `  Start: ${start}`,
            `  End: ${end}`,
            event.location ? `  Location: ${event.location}` : null,
            event.description ? `  Description: ${event.description}` : null,
            attendees ? `  Attendees: ${attendees}` : null,
            event.status ? `  Status: ${event.status}` : null,
          ]
            .filter(Boolean)
            .join('\n');
        })
        .join('\n\n');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return `Failed to list calendar events: ${message}`;
    }
  }
}
