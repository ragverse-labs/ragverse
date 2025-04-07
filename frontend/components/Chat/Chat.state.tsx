import { Plugin } from '@/types/agent';
import { ChatMode, ChatModes } from '@/types/chatmode';

export interface ChatInitialState {
  chatMode: ChatMode;
  selectedPlugins: Plugin[];
}

export const initialState: ChatInitialState = {
  chatMode: ChatModes.direct,
  selectedPlugins: [],
};
