import * as z from 'zod';

export const TestPromptSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
  language: z.string(),
  book_name: z.string(),
  order: z.number(),
  show: z.number(),
});

export const TestPromptSchemaArray = z.array(TestPromptSchema);

export type TestPrompt = z.infer<typeof TestPromptSchema>;
