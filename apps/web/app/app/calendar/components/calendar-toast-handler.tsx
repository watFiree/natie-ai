'use client';

import { useToastFromSearch } from '@/hooks/use-toast-from-search';

import { GOOGLE_CALENDAR_TOAST_MESSAGES } from '../consts';

export function CalendarToastHandler() {
  useToastFromSearch({
    paramName: 'google_calendar',
    messages: GOOGLE_CALENDAR_TOAST_MESSAGES,
    redirectPath: '/app/calendar',
  });

  return null;
}
