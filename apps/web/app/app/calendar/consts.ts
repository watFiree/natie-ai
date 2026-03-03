import type { ToastMessage } from '@/hooks/use-toast-from-search';

export const GOOGLE_CALENDAR_TOAST_MESSAGES: Record<string, ToastMessage> = {
  success: {
    type: 'success',
    title: 'Account connected',
    description: 'Your Google Calendar account has been linked successfully.',
  },
  failed: {
    type: 'error',
    title: 'Connection failed',
    description:
      'Something went wrong while connecting your Google Calendar account. Please try again.',
  },
  already_registered: {
    type: 'error',
    title: 'Already connected',
    description:
      'This Google Calendar account is already linked to your profile.',
  },
};
