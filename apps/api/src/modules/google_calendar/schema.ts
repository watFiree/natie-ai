import { z } from 'zod';

export const CalendarAccountResponseSchema = z.object({
  email: z.email(),
  provider: z.literal('google'),
});

export const CalendarAccountsResponseSchema = z.array(
  CalendarAccountResponseSchema
);

export const DeleteCalendarAccountQuerySchema = z.object({
  email: z.email(),
});

export const SuccessResponseSchema = z.object({
  success: z.boolean(),
});
