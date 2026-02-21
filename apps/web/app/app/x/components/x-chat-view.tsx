import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChatRuntimeProvider } from '@/components/chat/chat';
import { Thread } from '@/components/assistant-ui/thread';

type XChatViewProps = {
  onChangeAuthSettings: () => void;
};

export function XChatView({ onChangeAuthSettings }: XChatViewProps) {
  return (
    <Card className="min-h-[420px]">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>X chat</CardTitle>
          <CardDescription>
            X credentials are set. Chat UI will be added next.
          </CardDescription>
        </div>
        <Button type="button" variant="outline" onClick={onChangeAuthSettings}>
          Change auth settings
        </Button>
      </CardHeader>
      <CardContent>
        <ChatRuntimeProvider>
          <Thread />
        </ChatRuntimeProvider>
      </CardContent>
    </Card>
  );
}
