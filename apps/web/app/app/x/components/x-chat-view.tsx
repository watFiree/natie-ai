import { Button } from '@/components/ui/button';
import { ChatRuntimeProvider } from '@/components/chat/chat';
import { Thread } from '@/components/assistant-ui/thread';

type XChatViewProps = {
  onChangeAuthSettings: () => void;
};

export function XChatView({ onChangeAuthSettings }: XChatViewProps) {
  return (
    <>
      <div className="flex shrink-0 w-full items-center px-4 py-2 justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onChangeAuthSettings}
          className="ml-auto"
        >
          Account settings
        </Button>
      </div>
      <ChatRuntimeProvider chatType="x">
        <Thread className="flex-1 min-h-0" />
      </ChatRuntimeProvider>
    </>
  );
}
