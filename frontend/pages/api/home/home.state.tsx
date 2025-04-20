import { MutableRefObject } from 'react';

import { Conversation, Message } from '@/types/chat';
import { ChatModeKey } from '@/types/chatmode';
import { FolderInterface } from '@/types/folder';
import { LanguageModel, OpenAIModel, OpenAIModelID } from '@/types/openai';
import { Prompt } from '@/types/prompt';
import { Settings } from '@/types/settings';
import { TestPrompt } from '@/types/test-prompt';

export interface HomeInitialState {
  apiKey: string;
  chatModeKeys: ChatModeKey[];
  loading: boolean;
  settings: Settings;
  messageIsStreaming: boolean;
  modelError: Error | null;
  models: OpenAIModel[];
  languages: LanguageModel[];
  folders: FolderInterface[];
  publicFolders: FolderInterface[];
  conversations: Conversation[];
  testPrompts: TestPrompt[];
  selectedConversation: Conversation | undefined;
  currentMessage: Message | undefined;
  prompts: Prompt[];
  publicPrompts: Prompt[];
  showChatbar: boolean;
  showPromptbar: boolean;
  currentFolder: FolderInterface | undefined;
  messageError: boolean;
  searchTerm: string;
  defaultModelId: OpenAIModelID | undefined;
  serverSideApiKeyIsSet: boolean;
  serverSidePluginKeysSet: boolean;
  stopConversationRef: MutableRefObject<boolean>;
  isAzureOpenAI: boolean;
  supportEmail: string;
  promptSharingEnabled: boolean;
}

export const initialState: Partial<HomeInitialState> = {
  apiKey: '',
  loading: false,
  chatModeKeys: [],
  settings: {
    userId: '',
    displayName: '',
    theme: 'light',
    defaultTemperature: 1.0,
    sourceLanguage:"eng_Latn",
    defaultLanguage:"eng_Latn",
    defaultBook: "research"
  },
  messageIsStreaming: false,
  modelError: null,
  models: [],
  languages: [],
  folders: [],
  publicFolders: [],
  conversations: [],
  testPrompts: [],
  selectedConversation: undefined,
  currentMessage: undefined,
  prompts: [],
  publicPrompts: [],
  showPromptbar: true,
  showChatbar: true,
  currentFolder: undefined,
  messageError: false,
  searchTerm: '',
  defaultModelId: OpenAIModelID.RAGVERSE_1_0,
  serverSideApiKeyIsSet: true,
  serverSidePluginKeysSet: true,
  isAzureOpenAI: false,
  supportEmail: '',
  promptSharingEnabled: true,
};
