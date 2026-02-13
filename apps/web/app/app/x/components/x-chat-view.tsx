import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type XChatViewProps = {
  onChangeAuthSettings: () => void
}

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
        <div className="text-muted-foreground flex min-h-[280px] items-center justify-center rounded-md border border-dashed text-center text-sm">
          Empty chat view for X integration.
        </div>
      </CardContent>
    </Card>
  )
}
