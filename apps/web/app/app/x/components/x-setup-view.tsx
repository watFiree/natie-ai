'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import { XAuthSettingsForm } from './x-auth-settings-form';
import { XSetupInstructions } from './x-setup-instructions';

type XSetupViewProps = {
  isConfigured: boolean;
  onCredentialsSaved: () => void;
  onBackToChat?: () => void;
};

export function XSetupView({
  isConfigured,
  onCredentialsSaved,
  onBackToChat,
}: XSetupViewProps) {
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  return (
    <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
      <Card className="hidden xl:block">
        <CardHeader>
          <CardTitle>How to get required variables</CardTitle>
          <CardDescription>
            Follow the steps below to extract cookie values from x.com.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <XSetupInstructions />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-col items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle>Authentication settings</CardTitle>
              <CardDescription>
                Paste auth_token and ct0 cookies from your X account.
              </CardDescription>
            </div>

            <Sheet
              open={isInstructionsOpen}
              onOpenChange={setIsInstructionsOpen}
            >
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="xl:hidden"
                >
                  View instructions
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-full max-w-full overflow-y-auto sm:max-w-xl"
              >
                <SheetHeader>
                  <SheetTitle>How to get X cookies</SheetTitle>
                  <SheetDescription>
                    Step-by-step instructions with a video walkthrough.
                  </SheetDescription>
                </SheetHeader>
                <div className="px-4 pb-6">
                  <XSetupInstructions />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardHeader>

        <CardContent>
          <XAuthSettingsForm
            isConfigured={isConfigured}
            onCredentialsSaved={onCredentialsSaved}
            onBackToChat={onBackToChat}
          />
        </CardContent>
      </Card>
    </div>
  );
}
