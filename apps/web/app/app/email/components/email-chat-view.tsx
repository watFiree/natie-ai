import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function EmailChatView() {
  return (
    <Card className="min-h-[420px]">
      <CardHeader>
        <CardTitle>Email chat</CardTitle>
        <CardDescription>
          Email accounts are connected. Chat UI will be added next.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground flex min-h-[280px] items-center justify-center rounded-md border border-dashed text-center text-sm">
          Empty chat view for email integration.
        </div>
      </CardContent>
    </Card>
  );
}
