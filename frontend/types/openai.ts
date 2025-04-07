import language from 'react-syntax-highlighter/dist/esm/languages/hljs/1c';
import * as z from 'zod';

export enum OpenAIModelID {
  RAGVERSE_1_0 = 'ragverse-1.0',
  GPT_3_5 = 'gpt-3.5-turbo',
}

export enum OpenAIModelType {
  CHAT = 'chat',
  COMPLETION = 'completion',
  EMDEDDING = 'embedding'
}

export const LanguageSchema = z.object({
  identifier: z.string(),
  name: z.string(),
});
export type LanguageModel = z.infer<typeof LanguageSchema>;

export const BookSchema = z.object({
  identifier: z.string(),
  name: z.string(),
});
export type BookModel = z.infer<typeof BookSchema>;

export const OpenAIModelSchema = z.object({
  id: z.nativeEnum(OpenAIModelID),
  azureDeploymentId: z.string().optional(),
  name: z.string(),
  maxLength: z.number(), // max length of a message.
  tokenLimit: z.number(),
  // language: z.string(),
  // bookId: z.string(),
  // bookName: z.string(),
  languages: z.array(LanguageSchema),
  books: z.array(BookSchema),
  type: z.nativeEnum(OpenAIModelType).default(OpenAIModelType.CHAT)
});
export type OpenAIModel = z.infer<typeof OpenAIModelSchema>;

// in case the `DEFAULT_MODEL` environment variable is not set or set to an unsupported model
export const fallbackModelID = OpenAIModelID.RAGVERSE_1_0;

export const OpenAIModels: Record<OpenAIModelID, OpenAIModel> = {
  [OpenAIModelID.RAGVERSE_1_0]: {
    id: OpenAIModelID.RAGVERSE_1_0,
    name: 'RagVerse-1.0',
    maxLength: 12000,
    tokenLimit: 4000,
    languages:[],
    books: [],
    type: OpenAIModelType.CHAT
  },
  [OpenAIModelID.GPT_3_5]: {
    id: OpenAIModelID.GPT_3_5,
    name: 'GPT-3.5',
    maxLength: 12000,
    tokenLimit: 4000,
    languages:[],
    books: [],
    type: OpenAIModelType.CHAT
  },

};


