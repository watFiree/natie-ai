'use client';

import { useForm } from 'react-hook-form';

import { postXAccount } from '@/lib/api/default/default';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type XAuthSettingsFormProps = {
  isConfigured: boolean;
  onCredentialsSaved: () => void;
  onBackToChat?: () => void;
};

type XAuthSettingsFormValues = {
  authToken: string;
  ct0: string;
};

export function XAuthSettingsForm({
  isConfigured,
  onCredentialsSaved,
  onBackToChat,
}: XAuthSettingsFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<XAuthSettingsFormValues>({
    defaultValues: {
      authToken: '',
      ct0: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    clearErrors('root');

    const authToken = values.authToken.trim();
    const ct0 = values.ct0.trim();

    try {
      const response = await postXAccount({
        authToken,
        ct0,
      });

      if (response.status !== 200) {
        setError('root', {
          type: 'manual',
          message: 'Could not save X credentials. Please try again.',
        });
        return;
      }

      reset();
      onCredentialsSaved();
    } catch {
      setError('root', {
        type: 'manual',
        message: 'Could not save X credentials. Please try again.',
      });
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="auth-token-input">auth_token</Label>
        <Input
          id="auth-token-input"
          placeholder="Paste auth_token cookie value"
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          {...register('authToken', {
            required: 'auth_token is required.',
            validate: (value) =>
              value.trim().length > 0 || 'auth_token is required.',
          })}
        />
        {errors.authToken?.message && (
          <p className="text-destructive text-sm">{errors.authToken.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="ct0-input">ct0</Label>
        <Input
          id="ct0-input"
          placeholder="Paste ct0 cookie value"
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          {...register('ct0', {
            required: 'ct0 is required.',
            validate: (value) => value.trim().length > 0 || 'ct0 is required.',
          })}
        />
        {errors.ct0?.message && (
          <p className="text-destructive text-sm">{errors.ct0.message}</p>
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
              ? 'Update credentials'
              : 'Save credentials'}
        </Button>

        {isConfigured && onBackToChat && (
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onBackToChat}
          >
            Back to chat view
          </Button>
        )}
      </div>
    </form>
  );
}
