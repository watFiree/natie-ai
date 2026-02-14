'use client';

import { useForm } from 'react-hook-form';

import { postTelegramSettings, deleteTelegramSettings } from '@/lib/client/default/default';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type TelegramSettingsFormProps = {
  isConfigured: boolean;
  currentTelegramUserId?: string;
  onSettingsSaved: () => void;
  onSettingsDeleted: () => void;
};

type TelegramSettingsFormValues = {
  telegramUserId: string;
};

export function TelegramSettingsForm({
  isConfigured,
  currentTelegramUserId,
  onSettingsSaved,
  onSettingsDeleted,
}: TelegramSettingsFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TelegramSettingsFormValues>({
    defaultValues: {
      telegramUserId: currentTelegramUserId ?? '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    clearErrors('root');

    const telegramUserId = values.telegramUserId.trim();

    try {
      const response = await postTelegramSettings({
        telegramUserId,
      });

      if (response.status !== 200) {
        setError('root', {
          type: 'manual',
          message: 'Could not save Telegram settings. Please try again.',
        });
        return;
      }

      reset({ telegramUserId });
      onSettingsSaved();
    } catch {
      setError('root', {
        type: 'manual',
        message: 'Could not save Telegram settings. Please try again.',
      });
    }
  });

  const handleDelete = async () => {
    clearErrors('root');

    try {
      const response = await deleteTelegramSettings();

      if (response.status !== 200) {
        setError('root', {
          type: 'manual',
          message: 'Could not disconnect Telegram. Please try again.',
        });
        return;
      }

      reset({ telegramUserId: '' });
      onSettingsDeleted();
    } catch {
      setError('root', {
        type: 'manual',
        message: 'Could not disconnect Telegram. Please try again.',
      });
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="telegram-user-id-input">Telegram User ID</Label>
        <Input
          id="telegram-user-id-input"
          placeholder="Enter your Telegram user ID (e.g. 123456789)"
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          {...register('telegramUserId', {
            required: 'Telegram user ID is required.',
            validate: (value) =>
              value.trim().length > 0 || 'Telegram user ID is required.',
          })}
        />
        {errors.telegramUserId?.message && (
          <p className="text-destructive text-sm">
            {errors.telegramUserId.message}
          </p>
        )}
      </div>

      {errors.root?.message && (
        <p className="text-destructive text-sm">{errors.root.message}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Saving...'
            : isConfigured
              ? 'Update settings'
              : 'Save settings'}
        </Button>

        {isConfigured && (
          <Button
            type="button"
            variant="destructive"
            disabled={isSubmitting}
            onClick={handleDelete}
          >
            Disconnect Telegram
          </Button>
        )}
      </div>
    </form>
  );
}
