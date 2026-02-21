'use client';

import { useMemo, type ReactNode } from 'react';
import { AssistantRuntimeProvider, useLocalRuntime } from '@assistant-ui/react';
import { historyAdapter as historyAdapterFactory } from './adapters/HistoryAdapter';
import { assistantAdapter as assistantAdapterFactory } from './adapters/AssistantAdapter';
import { GetMessagesChatType } from '@/lib/api/models';

export function ChatRuntimeProvider({
  children,
  chatType,
}: Readonly<{
  children: ReactNode;
  chatType: GetMessagesChatType;
}>) {
  const assistantAdapter = useMemo(
    () => assistantAdapterFactory(chatType),
    [chatType]
  );
  const historyAdapter = useMemo(
    () => historyAdapterFactory(chatType),
    [chatType]
  );

  const runtime = useLocalRuntime(assistantAdapter, {
    adapters: {
      history: historyAdapter,
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
