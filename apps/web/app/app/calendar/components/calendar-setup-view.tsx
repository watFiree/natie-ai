import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type CalendarSetupViewProps = {
  onAddAccount: () => void;
};

export function CalendarSetupView({ onAddAccount }: CalendarSetupViewProps) {
  return (
    <Card className="min-h-[420px]">
      <CardHeader>
        <CardTitle>Connect your first calendar account</CardTitle>
        <CardDescription>
          You can connect multiple providers. Google Calendar is currently
          available.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-md border border-dashed p-6 text-center">
          <p className="text-muted-foreground text-sm">
            No calendar accounts connected yet.
          </p>
          <Button type="button" onClick={onAddAccount}>
            Add new account
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
