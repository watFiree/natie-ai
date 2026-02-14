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

import { TelegramSettingsForm } from './telegram-settings-form';
import { TelegramSetupInstructions } from './telegram-setup-instructions';

type TelegramSetupViewProps = {
  isConfigured: boolean;
  currentTelegramUserId?: string;
  onSettingsSaved: () => void;
  onSettingsDeleted: () => void;
};

export function TelegramSetupView({
  isConfigured,
  currentTelegramUserId,
  onSettingsSaved,
  onSettingsDeleted,
}: TelegramSetupViewProps) {
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  return (
    <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
      <Card className="hidden xl:block">
        <CardHeader>
          <CardTitle>How to connect Telegram</CardTitle>
          <CardDescription>
            Message @NatieAi_bot to get your User ID, then paste it here.
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-4">
          <TelegramSetupInstructions />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-col items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle>Telegram settings</CardTitle>
              <CardDescription>
                {isConfigured ? (
                  <span>
                    Your Telegram account is{' '}
                    <strong className="text-green-600">connected</strong>. You
                    can update or disconnect it below.
                  </span>
                ) : (
                  <span>
                    Enter your Telegram user ID to <strong>connect</strong> your
                    account.
                  </span>
                )}
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
                  <SheetTitle>How to connect Telegram</SheetTitle>
                  <SheetDescription>
                    Message @NatieAi_bot to get your User ID, then paste it
                    here.
                  </SheetDescription>
                </SheetHeader>
                <div className="px-4 pb-6">
                  <TelegramSetupInstructions />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardHeader>

        <CardContent>
          <TelegramSettingsForm
            isConfigured={isConfigured}
            currentTelegramUserId={currentTelegramUserId}
            onSettingsSaved={onSettingsSaved}
            onSettingsDeleted={onSettingsDeleted}
          />
        </CardContent>
      </Card>
    </div>
  );
}
