import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type EmailSetupViewProps = {
  onAddAccount: () => void;
};

export function EmailSetupView({ onAddAccount }: EmailSetupViewProps) {
  return (
    <Card className="min-h-[420px]">
      <CardHeader>
        <CardTitle>Connect your first email account</CardTitle>
        <CardDescription>
          You can connect multiple providers. Gmail is currently available.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-md border border-dashed p-6 text-center">
          <p className="text-muted-foreground text-sm">
            No email accounts connected yet.
          </p>
          <Button type="button" onClick={onAddAccount}>
            Add new account
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
