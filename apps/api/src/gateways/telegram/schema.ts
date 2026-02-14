import { z } from 'zod';

export const SaveTelegramSettingsSchema = z.object({
  telegramUserId: z.string(),
});
