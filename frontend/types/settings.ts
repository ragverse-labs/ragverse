import * as z from 'zod';

export const SettingsSchema = z.object({
  userId: z.string(),
  displayName: z.string(),
  theme: z.enum(['light', 'dark']),
  defaultBook: z.string(),
  sourceLanguage : z.string(),
  defaultLanguage : z.string(),
  defaultTemperature: z.number(),
  avatar: z.instanceof(Buffer).optional(), 
});

export type Settings = z.infer<typeof SettingsSchema>;
