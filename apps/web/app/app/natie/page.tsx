import { Thread } from '@/components/assistant-ui/thread';
import { ChatRuntimeProvider } from '@/components/chat/chat';

export default function Page() {
  return (
    <div className="flex flex-1 flex-col max-h-full">
      <ChatRuntimeProvider chatType="natie">
        <Thread />
      </ChatRuntimeProvider>
    </div>
  );
}
