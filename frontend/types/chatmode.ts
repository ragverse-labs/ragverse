import { KeyValuePair } from './data';

export interface ChatMode {
  id: ChatModeID;
  name: ChatModeName;
  requiredKeys: KeyValuePair[];
}

export interface ChatModeKey {
  chatModeId: ChatModeID;
  requiredKeys: KeyValuePair[];
}

export enum ChatModeID {
  DIRECT = 'direct',
  AGENT = 'agent',
  CONVERSATIONAL_AGENT = 'conversational-agent',
  GOOGLE_SEARCH = 'google-search',
}

export enum ChatModeName {
  DIRECT = 'Chat',
  AGENT = 'Agent',
  CONVERSATIONAL_AGENT = 'Conversational Agent',
  GOOGLE_SEARCH = 'Google Search',
}

export const ChatModes: Record<ChatModeID, ChatMode> = {
  [ChatModeID.DIRECT]: {
    id: ChatModeID.DIRECT,
    name: ChatModeName.DIRECT,
    requiredKeys: [],
  },
  [ChatModeID.AGENT]: {
    id: ChatModeID.AGENT,
    name: ChatModeName.AGENT,
    requiredKeys: [],
  },
  [ChatModeID.CONVERSATIONAL_AGENT]: {
    id: ChatModeID.CONVERSATIONAL_AGENT,
    name: ChatModeName.CONVERSATIONAL_AGENT,
    requiredKeys: [],
  },
  [ChatModeID.GOOGLE_SEARCH]: {
    id: ChatModeID.GOOGLE_SEARCH,
    name: ChatModeName.GOOGLE_SEARCH,
    requiredKeys: [
      {
        key: 'GOOGLE_API_KEY',
        value: '',
      },
      {
        key: 'GOOGLE_CSE_ID',
        value: '',
      },
    ],
  },
};

export const ChatModeList = Object.values(ChatModes);
