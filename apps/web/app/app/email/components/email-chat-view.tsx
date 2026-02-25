'use client';

import { ChatRuntimeProvider } from '@/components/chat/chat';
import { Thread } from '@/components/assistant-ui/thread';

export function EmailChatView({ className }: { className?: string }) {
  return (
    <ChatRuntimeProvider chatType="email">
      <Thread className={className} />
    </ChatRuntimeProvider>
  );
}
