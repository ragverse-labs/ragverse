import React, {
  FC,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useTranslation } from 'next-i18next';

import { Conversation } from '@/types/chat';
import { Prompt } from '@/types/prompt';

import { Textarea } from '@/components/Input/Textarea';

import { PromptList } from './PromptList';
import { VariableModal } from './VariableModal';

interface Props {
  conversation: Conversation;
  systemPrompt: string;
  prompts: Prompt[];
  publicPrompts: Prompt[];
  onChangePrompt: (prompt: string) => void;
}

export const SystemPrompt: FC<Props> = ({
  conversation,
  systemPrompt,
  prompts,
  publicPrompts,
  onChangePrompt,
}) => {
  const { t } = useTranslation('chat');

  const [value, setValue] = useState<string>('');
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [showPromptList, setShowPromptList] = useState(false);
  const [promptInputValue, setPromptInputValue] = useState('');
  const [variables, setVariables] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>(prompts);
  const [filteredPublicPrompts, setFilteredPublicPrompts] = useState<Prompt[]>(publicPrompts);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const promptListRef = useRef<HTMLUListElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const maxLength = conversation.model.maxLength;

    if (value.length > maxLength) {
      alert(
        t(
          `Prompt limit is {{maxLength}} characters. You have entered {{valueLength}} characters.`,
          { maxLength, valueLength: value.length },
        ),
      );
      return;
    }

    setValue(value);
    updatePromptListVisibility(value);
    onChangePrompt(value);
  };

  const handleInitModal = () => {
    const selectedPrompt = [...filteredPrompts, ...filteredPublicPrompts][activePromptIndex];
    setValue((prevVal) => {
      const newContent = prevVal?.replace(/\/\w*$/, selectedPrompt.content);
      return newContent;
    });
    handlePromptSelect(selectedPrompt);
    setShowPromptList(false);
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
    setVariables(parsedVariables);
    // console.log(parsedVariables);
    if (parsedVariables.length > 0) {
      setIsModalVisible(true);
    } else {
      const updatedContent = value?.replace(/\/\w*$/, prompt.content);

      setValue(updatedContent);
      onChangePrompt(updatedContent);

      updatePromptListVisibility(prompt.content);
    }
  };

  const handleSubmit = (updatedVariables: string[]) => {
    const newContent = value?.replace(/{{(.*?)}}/g, (match, variable) => {
      const index = variables.indexOf(variable);
      return updatedVariables[index];
    });

    setValue(newContent);
    onChangePrompt(newContent);

    if (textareaRef && textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
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
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
    } else if (e.key === '/' && e.metaKey) {
      e.preventDefault();
    }
  };


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
    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current?.scrollHeight}px`;
    }
  }, [value]);

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

  return (
    <div className="flex flex-col">
      <label className="mb-2 text-left text-neutral-700 dark:text-neutral-400">
        {t('System Prompt')}
      </label>
      <Textarea
        textareaRef={textareaRef}
        className="w-full rounded-lg border border-neutral-200 bg-transparent px-4 py-3 text-neutral-900 dark:border-neutral-600 dark:text-neutral-100"
        style={{
          resize: 'none',
          bottom: `${textareaRef?.current?.scrollHeight}px`,
          maxHeight: '300px',
          overflow: `${
            textareaRef.current && textareaRef.current.scrollHeight > 400
              ? 'auto'
              : 'hidden'
          }`,
        }}
        placeholder={
          t(`Enter a prompt or type "/" to select a prompt...`) || ''
        }
        value={systemPrompt}
        rows={3}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />

      {showPromptList && (filteredPrompts.length > 0 || filteredPublicPrompts.length > 0) && (
        <div>
          <PromptList
            activePromptIndex={activePromptIndex}
            prompts={filteredPrompts}
            publicPrompts={filteredPublicPrompts}
            onSelect={handleInitModal}
            onMouseOver={setActivePromptIndex}
            promptListRef={promptListRef}
          />
        </div>
      )}

      {isModalVisible && (
        <VariableModal
          prompt={[...filteredPrompts, ...filteredPublicPrompts][activePromptIndex]}
          variables={variables}
          onSubmit={handleSubmit}
          onClose={() => setIsModalVisible(false)}
        />
      )}
    </div>
  );
};
