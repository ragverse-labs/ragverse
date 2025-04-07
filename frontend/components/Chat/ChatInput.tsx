import { IconPlayerStop, IconRepeat, IconSend } from '@tabler/icons-react';
import {
  KeyboardEvent,
  MutableRefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useTranslation } from 'next-i18next';

import { Plugin } from '@/types/agent';
import { Message } from '@/types/chat';
import { ChatMode, ChatModeID, ChatModes } from '@/types/chatmode';
import { Prompt } from '@/types/prompt';

import HomeContext from '@/pages/api/home/home.context';


import ChatContext from './Chat.context';
// import { ChatInputTokenCount } from './ChatInputTokenCount';
// import { ChatModeSelect } from './ChatModeSelect';
import { ChatPluginList } from './ChatPluginList';
// import { PromptList } from './PromptList';
// import { VariableModal } from './VariableModal';

import classNames from 'classnames';
import { useCreateReducer } from '@/hooks/useCreateReducer';
import { Settings } from '@/types/settings';
import { LanguageSelector } from './LanguageSelect';
import WhatsAppShare from '../Share';


interface Props {
  onSend: (
    message: Message,
    chatMode: ChatMode | null,
    plugins: Plugin[],
  ) => void;
  onRegenerate: (chatMode: ChatMode | null, plugins: Plugin[]) => void;
  textareaRef: MutableRefObject<HTMLTextAreaElement | null>;
}



function ChatInputContainer({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={classNames(
        'stretch mx-2 mt-0 flex flex-row gap-3 last:mb-2 md:mx-4 md:mt-[6px] md:last:mb-6 lg:mx-auto lg:max-w-3xl',
        className,
      )}
    >
      <div className="relative mx-2 flex w-full flex-grow flex-col rounded-lg border border-black/10 bg-white shadow-lg dark:border-gray-900/50 dark:bg-[#40414F] dark:text-white dark:shadow-lg sm:mx-4">
        {children}
      </div>
    </div>
  );
}

export default ChatInputContainer;


type ChatControlPanelProps = {
  chatMode: ChatMode;
  showStopButton: boolean;
  showRegenerateButton: boolean;
  onRegenerate: () => void;
  onStopConversation: () => void;
};
function ChatControlPanel({
  showStopButton,
  showRegenerateButton,
  onRegenerate,
  onStopConversation,
}: ChatControlPanelProps) {
  const { t } = useTranslation('chat');
 
  return (
    <div className="left-0 top-0 mx-auto px-4 bg-transparent text-black hover:opacity-50 dark:border-neutral-600 dark:text-white md:mb-0 md:mt-2">
      <div className="w-max flex flex-col mx-auto">
        <div className="flex w-fit items-center gap-4">
          {showStopButton && (
            <ChatControlButton onClick={onStopConversation}>
              <IconPlayerStop size={16} /> {t('Stop Generating')}
            </ChatControlButton>
          )}
          {/* {showRegenerateButton && (
            // <ChatControlButton onClick={onRegenerate}>
            //   <IconRepeat size={16} /> {t('Regenerate response')}
            // </ChatControlButton>
            <WhatsAppShare shareText={shareText} shareUrl={shareUrl} />
          )} */}

        </div>
      </div>
    </div>
  );
}

function ChatControlButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      className="flex w-fit items-center gap-3 mb-2 py-2 rounded border border-neutral-200 bg-white px-4 text-black hover:opacity-50 dark:border-neutral-600 dark:bg-[#343541] dark:text-white md:mb-0 md:mt-2"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export const ChatInput = ({ onSend, onRegenerate, textareaRef }: Props) => {
  const { t } = useTranslation('chat');

  const {
    state: {
      selectedConversation,
      messageIsStreaming,
      prompts,
      publicPrompts,
      stopConversationRef,
      settings,
    },
  } = useContext(HomeContext);
  const { state, dispatch } = useCreateReducer<Settings>({
    initialState: settings,
  });
  const {
    state: { selectedPlugins, chatMode },
    dispatch: chatDispatch,
  } = useContext(ChatContext);

  const [content, setContent] = useState<string>();
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showPromptList, setShowPromptList] = useState(false);
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [promptInputValue, setPromptInputValue] = useState('');
  const [variables, setVariables] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showPluginSelect, setShowPluginSelect] = useState(false);
  const [lastDownKey, setLastDownKey] = useState<string>('');
  const [endComposing, setEndComposing] = useState<boolean>(false);
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>(prompts);
  const [filteredPublicPrompts, setFilteredPublicPrompts] = useState<Prompt[]>(publicPrompts);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const promptListRef = useRef<HTMLUListElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const maxLength = selectedConversation?.model.maxLength;

    if (maxLength && value.length > maxLength) {
      alert(
        t(
          `Message limit is {{maxLength}} characters. You have entered {{valueLength}} characters.`,
          { maxLength, valueLength: value.length },
        ),
      );
      return;
    }

    setContent(value);
    updatePromptListVisibility(value);
  };

  const handleSend = () => {
    if (messageIsStreaming) {
      // dispatch("selectedConversation", { role: 'user', content: updated_content_str })
      return;
    }

    if (!content) {
      alert(t('Please enter a message'));
      return;
    }
    let book_name = settings.defaultBook;
    let target_language = defaultLanguage ? defaultLanguage : settings.defaultLanguage;
    let source_language = settings.sourceLanguage;
    if (selectedPlugins.length > 0)
      book_name = selectedPlugins[0].nameForModel;

    if (variables[0]) {

      variables[0] = ""; //empty once
    }
    let updated_content = { "content": content, "book_name": book_name, "from_language": source_language, "to_language": target_language, "user_id": settings.userId }
    let updated_content_str = JSON.stringify(updated_content);
    // console.log(selectedPlugins);
    onSend({ role: 'user', content: updated_content_str }, chatMode, selectedPlugins);
    // onSend({ role: 'user', content }, chatMode, selectedPlugins);
    setContent('');

    if (window.innerWidth < 640 && textareaRef && textareaRef.current) {
      textareaRef.current.blur();
    }
  };

  const handleRegenerate = () => {
    onRegenerate(chatMode, selectedPlugins);
  };

  const handleStopConversation = () => {
    stopConversationRef.current = true;
    setTimeout(() => {
      stopConversationRef.current = false;
    }, 30000);
  };

  const isMobile = () => {
    const userAgent =
      typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
    const mobileRegex =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
    return mobileRegex.test(userAgent);
  };

  const handleInitModal = () => {
    const selectedPrompt = [...filteredPrompts, ...filteredPublicPrompts][activePromptIndex];
    const book_details = [];
    let book_name = selectedPrompt.description;
    let to_lang = selectedPrompt.toLang!;
    book_details.push(book_name);
    book_details.push(to_lang);
    if (selectedPrompt) {
      setContent((prevContent) => {
        const newContent = prevContent?.replace(
          /\/\w*$/,
          selectedPrompt.content,
        );
        book_details.push(prevContent);
        return newContent;
      });
      handlePromptSelect(selectedPrompt);
    }

    setVariables(book_details);
    setShowPromptList(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // safari support
    const composing = endComposing;
    setLastDownKey(e.key);
    setEndComposing(false);
    if (e.key === 'Enter' && composing) {
      return;
    }
    if (showPromptList) {
      const totalPrompts = filteredPrompts.length + filteredPublicPrompts.length;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActivePromptIndex((prevIndex) =>
          prevIndex < totalPrompts - 1 ? prevIndex + 1 : prevIndex,
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActivePromptIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : prevIndex,
        );
      } else if (e.key === 'Tab') {
        e.preventDefault();
        setActivePromptIndex((prevIndex) =>
          prevIndex < totalPrompts - 1 ? prevIndex + 1 : 0,
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleInitModal();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowPromptList(false);
      } else {
        setActivePromptIndex(0);
      }
    } else if (e.key === 'Enter' && !isTyping && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === '/' && e.metaKey) {
      e.preventDefault();
      setShowPluginSelect(!showPluginSelect);
    }
  };

  const parseVariables = (content: string) => {
    const regex = /{{(.*?)}}/g;
    const foundVariables = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      foundVariables.push(match[1]);
    }
    return foundVariables;
  };

  const updatePromptListVisibility = useCallback((text: string) => {
    const match = text.match(/\/\w*$/);
    if (match) {
      setShowPromptList(true);
      setPromptInputValue(match[0].slice(1));
    } else {
      setShowPromptList(false);
      setPromptInputValue('');
    }
  }, []);

  const handlePromptSelect = (prompt: Prompt) => {
    const parsedVariables = parseVariables(prompt.content);
    if (parsedVariables.length > 0) {
      setIsModalVisible(true);
    } else {
      setContent((prevContent) => {
        const updatedContent = prevContent?.replace(/\/\w*$/, prompt.content);
        // console.log(updatedContent);
        return updatedContent;
      });
      updatePromptListVisibility(prompt.content);
    }
  };

  const handleSubmit = (updatedVariables: string[]) => {

    const newContent = content?.replace(/{{(.*?)}}/g, (match, variable) => {
      const index = variables.indexOf(variable);
      return updatedVariables[index];
    });

    setContent(newContent);

    if (textareaRef && textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const {
    state: { models },
  } = useContext(HomeContext);
  const [showSelect, setShowSelect] = useState(false);
  useEffect(() => {
    const filteredPrompts = prompts.filter((prompt) =>
      prompt.name.toLowerCase().includes(promptInputValue.toLowerCase()),
    );
    setFilteredPrompts(filteredPrompts)
  }, [prompts, promptInputValue, setFilteredPrompts]);

  useEffect(() => {
    const filteredPublicPrompts = publicPrompts.filter((prompt) =>
      prompt.name.toLowerCase().includes(promptInputValue.toLowerCase()),
    );
    setFilteredPublicPrompts(filteredPublicPrompts)
  }, [publicPrompts, promptInputValue, setFilteredPublicPrompts]);

  useEffect(() => {
    if (promptListRef.current) {
      promptListRef.current.scrollTop = activePromptIndex * 30;
    }
  }, [activePromptIndex]);

  useEffect(() => {
    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current?.scrollHeight}px`;
      textareaRef.current.style.overflow = `${textareaRef?.current?.scrollHeight > 400 ? 'auto' : 'hidden'
        }`;
    }
  }, [content, textareaRef]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        promptListRef.current &&
        !promptListRef.current.contains(e.target as Node)
      ) {
        setShowPromptList(false);
      }
    };

    window.addEventListener('click', handleOutsideClick);

    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  const showStopButton = messageIsStreaming;
  const [defaultLanguage, setDefaultLanguage] = useState(settings.defaultLanguage);
  const showRegenerateButton =
    !messageIsStreaming &&
    selectedConversation &&
    selectedConversation.messages.length > 0;

  return (
    <div className="absolute bottom-0 right-0 w-full border-transparent bg-gradient-to-b from-transparent via-white to-white pt-2 dark:border-white/20 dark:via-[#343541] dark:to-[#343541]">
      <ChatControlPanel
        chatMode={chatMode}
        showStopButton={showStopButton}
        showRegenerateButton={Boolean(showRegenerateButton)}
        onRegenerate={() => handleRegenerate()}
        onStopConversation={handleStopConversation}
      />

      <ChatInputContainer>
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1"> {/* Grouped LanguageSelector and PluginList */}
            <LanguageSelector
              models={models}
              defaultLanguage={defaultLanguage}
              onChange={setDefaultLanguage}
            />
            <ChatPluginList
              selectedPlugins={selectedPlugins}
              defaultBook={settings.defaultBook}
              onChange={(plugins) => chatDispatch({ field: 'selectedPlugins', value: plugins })}
            />
          </div>

          <div className="relative flex-grow">
            <textarea
              ref={textareaRef}
              className="m-0 w-full resize-none border-1 border-gray-300 bg-white text-black dark:bg-[#343541] dark:text-white rounded-lg p-1 pr-10" // Add `pr-10` here
              style={{
                resize: 'none',
                maxHeight: '275px',
                overflow: `${textareaRef.current && textareaRef.current.scrollHeight > 200 ? 'auto' : 'hidden'}`,
              }}
              placeholder={t('Let the conversation begin...') || ''}
              value={content}
              rows={2}
              onCompositionStart={() => setIsTyping(true)}
              onCompositionEnd={() => {
                setIsTyping(false);
                if (lastDownKey !== 'Enter') {
                  setEndComposing(true);
                }
              }}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />

            {/* Position the button relative to the parent container */}
            <button
              className="absolute right-2 bottom-2 rounded-sm p-2 bg-gray-500 text-white hover:bg-gray-600 dark:bg-gray-400 dark:hover:bg-gray-500"
              onClick={handleSend}
            >
              {messageIsStreaming ? (
                <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-white opacity-60"></div>
              ) : (
                <IconSend size={25} color='white' />
              )}
            </button>
          </div>


        </div>
      </ChatInputContainer>




      <div className="hidden md:block px-3 pt-2 pb-3 text-center text-[12px] text-black/50 dark:text-white/50 md:px-4 md:pt-3 md:pb-6">
        <a
          href="https://ourvedas.in/landing/index.html"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          RAGVerse
        </a>
        {' '}
        {t("may be inaccurate; Please validate.")}
      </div>
    </div>

  );
};
