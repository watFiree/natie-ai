import { StructuredTool } from '@langchain/core/tools';
import { GoogleCalendarCreateEventTool } from './createEvent';
import { GoogleCalendarViewEventsTool } from './viewEvents';
import { GoogleCalendarDeleteEventTool } from './deleteEvent';
import { TokenProvider } from './consts';

export const createTools = (tokenProvider: TokenProvider): StructuredTool[] => [
  new GoogleCalendarCreateEventTool(tokenProvider),
  new GoogleCalendarViewEventsTool(tokenProvider),
  new GoogleCalendarDeleteEventTool(tokenProvider),
];
