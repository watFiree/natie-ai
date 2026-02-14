'use client';

import { useToastFromSearch } from '@/hooks/use-toast-from-search';

import { GOOGLE_TOAST_MESSAGES } from '../consts';

export function EmailToastHandler() {
  useToastFromSearch({
    paramName: 'google',
    messages: GOOGLE_TOAST_MESSAGES,
    redirectPath: '/app/email',
  });

  return null;
}
