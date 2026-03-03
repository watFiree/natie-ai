'use client';

import { ChatRuntimeProvider } from '@/components/chat/chat';
import { Thread } from '@/components/assistant-ui/thread';

export function CalendarChatView({ className }: { className?: string }) {
  return (
    <ChatRuntimeProvider chatType="calendar">
      <Thread className={className} />
    </ChatRuntimeProvider>
  );
}
