import { z } from 'zod';

export const SaveTelegramSettingsSchema = z.object({
  telegramUserId: z.string(),
});

export const TelegramSettingsResponseSchema = z.object({
  id: z.string(),
  telegramUserId: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const SuccessResponseSchema = z.object({
  success: z.boolean(),
});

export const ErrorResponseSchema = z.object({
  error: z.string(),
});
