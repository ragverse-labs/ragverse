import { MutableRefObject, useContext } from 'react';

import { useAgentMode } from '@/hooks/chatmode/useAgentMode';
import { useDirectMode } from '@/hooks/chatmode/useDirectMode';
import { useGoogleMode } from '@/hooks/chatmode/useGoogleMode';

import { ChatModeRunner, Conversation } from '@/types/chat';
import { ChatMode, ChatModeID } from '@/types/chatmode';

import HomeContext from '@/pages/api/home/home.context';

export const useChatModeRunner = (conversations: Conversation[]) => {
  const {
    state: { stopConversationRef },
  } = useContext(HomeContext);
  const directMode = useDirectMode(conversations, stopConversationRef);
  const googleMode = useGoogleMode(conversations);
  const conversationalAgentMode = useAgentMode(
    conversations,
    stopConversationRef,
    true,
  );
  const agentMode = useAgentMode(conversations, stopConversationRef, false);
  return (plugin: ChatMode | null): ChatModeRunner => {
    if (!plugin) {
      return directMode;
    }
    switch (plugin.id) {
      case ChatModeID.GOOGLE_SEARCH:
        return googleMode;
      case ChatModeID.AGENT:
        return agentMode;
      case ChatModeID.CONVERSATIONAL_AGENT:
        return conversationalAgentMode;
      default:
        return directMode;
    }
  };
};
