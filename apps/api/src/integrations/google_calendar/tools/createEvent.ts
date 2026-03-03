import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { TokenProvider, createCalendarClient } from './consts';

export class GoogleCalendarCreateEventTool extends StructuredTool {
  name = 'google_calendar_create_event';
  description = 'Create a Google Calendar event for a selected account';

  schema = z.object({
    accountEmail: z.email(),
    summary: z.string().describe('Title of the event'),
    startDateTime: z
      .string()
      .describe(
        'Start date/time in ISO 8601 format (e.g. 2026-03-05T10:00:00Z)'
      ),
    endDateTime: z
      .string()
      .describe('End date/time in ISO 8601 format (e.g. 2026-03-05T11:00:00Z)'),
    description: z.string().optional().describe('Description of the event'),
    location: z.string().optional().describe('Location of the event'),
    attendees: z
      .array(z.email())
      .optional()
      .describe('List of attendee email addresses'),
    timeZone: z
      .string()
      .optional()
      .describe('Time zone (e.g. America/New_York). Defaults to UTC.'),
  });

  constructor(private readonly tokenProvider: TokenProvider) {
    super();
  }

  async _call(input: {
    accountEmail: string;
    summary: string;
    startDateTime: string;
    endDateTime: string;
    description?: string;
    location?: string;
    attendees?: string[];
    timeZone?: string;
  }) {
    try {
      const token = await this.tokenProvider(input.accountEmail);
      const calendar = createCalendarClient(token);
      const timeZone = input.timeZone ?? 'UTC';

      const response = await calendar.events.insert({
        calendarId: input.accountEmail,
        requestBody: {
          summary: input.summary,
          description: input.description,
          location: input.location,
          start: { dateTime: input.startDateTime, timeZone },
          end: { dateTime: input.endDateTime, timeZone },
          attendees: input.attendees?.map((email) => ({ email })),
        },
      });

      const event = response.data;
      return [
        `Event created successfully.`,
        `  ID: ${event.id}`,
        `  Title: ${event.summary}`,
        `  Start: ${event.start?.dateTime ?? event.start?.date}`,
        `  End: ${event.end?.dateTime ?? event.end?.date}`,
        event.htmlLink ? `  Link: ${event.htmlLink}` : null,
      ]
        .filter(Boolean)
        .join('\n');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return `Failed to create calendar event: ${message}`;
    }
  }
}
