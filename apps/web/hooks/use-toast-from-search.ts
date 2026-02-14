'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast, type ExternalToast } from 'sonner';

type ToastType = keyof Pick<
  typeof toast,
  'success' | 'error' | 'info' | 'warning' | 'loading' | 'message'
>;

export type ToastMessage = {
  type: ToastType;
  title: string;
} & ExternalToast;

type UseToastFromSearchOptions = {
  paramName: string;
  messages: Record<string, ToastMessage>;
  redirectPath: string;
};

export function useToastFromSearch({
  paramName,
  messages,
  redirectPath,
}: UseToastFromSearchOptions) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const value = searchParams.get(paramName);
    if (!value) return;

    const { type, title, ...data } = messages[value] ?? {};
    if (type && title) {
      toast[type](title, data);
    }

    router.replace(redirectPath);
  }, [paramName, messages, redirectPath, searchParams, router]);
}
