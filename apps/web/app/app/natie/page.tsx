import { Thread } from '@/components/assistant-ui/thread';
import { ChatRuntimeProvider } from '@/components/chat/chat';
import { Button } from '@/components/ui/button';

export default function Page() {
  return (
    <div className="flex flex-col h-full max-h-[calc(100dvh-(var(--header-height))-(var(--spacing)*4))] overflow-hidden">
      <div className="flex shrink-0 w-full items-center px-4 py-2 justify-between">
        <Button type="button" variant="outline" className="ml-auto">
          Tutorial
        </Button>
      </div>
      <ChatRuntimeProvider chatType="natie">
        <Thread className="flex-1 min-h-0" />
      </ChatRuntimeProvider>
    </div>
  );
}
