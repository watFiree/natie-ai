import type { ToastMessage } from '@/hooks/use-toast-from-search';

export const GOOGLE_TOAST_MESSAGES: Record<string, ToastMessage> = {
  success: {
    type: 'success',
    title: 'Account connected',
    description: 'Your Google account has been linked successfully.',
  },
  failed: {
    type: 'error',
    title: 'Connection failed',
    description:
      'Something went wrong while connecting your Google account. Please try again.',
  },
  already_registered: {
    type: 'error',
    title: 'Already connected',
    description: 'This Google account is already linked to your profile.',
  },
};
