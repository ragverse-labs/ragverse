import { TestPrompt } from '@/types/test-prompt';
import PromptComponent from './PromptComponent';
import { useContext, useEffect, useState } from 'react';
import HomeContext from '@/pages/api/home/home.context';
import { Message } from '@/types/chat';
import { ChatMode, ChatModeID } from '@/types/chatmode';
import { Plugin } from '@/types/agent';
import ChatContext from '@/components/Chat/Chat.context';

interface Props {
  userId: string;
  onSend: (
    message: Message,
    chatMode: ChatMode | null,
    plugins: Plugin[],
  ) => void;
}

export const TestPrompts = ({ onSend, userId }: Props) => {
  // Access testPrompts from HomeContext
  const {
    state: { testPrompts },
  } = useContext(HomeContext);

  // Access selectedPlugins and chatMode from ChatContext
  const {
    state: { selectedPlugins, chatMode },
    dispatch: chatDispatch,
  } = useContext(ChatContext);

  // State to track the current index of test prompts
  const [currentIndex, setCurrentIndex] = useState(0);

  // Cycle through the test prompts every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 4) % testPrompts.length);
    }, 7000); // Change set of flashcards every 7 seconds
    return () => clearInterval(interval);
  }, [testPrompts.length]);

  // Get a set of 4 cards to display
  const getCardsToShow = () => {
    const startIndex = currentIndex;
    return [
      testPrompts[startIndex],
      testPrompts[(startIndex + 1) % testPrompts.length],
      testPrompts[(startIndex + 2) % testPrompts.length],
      testPrompts[(startIndex + 3) % testPrompts.length],
    ];
  };

  const cardsToShow = getCardsToShow();

  // Handle click on each card to send the content
  const handleCardClick = (content: TestPrompt) => {
    let updated_content = {
      content: content.question,
      book_name: content.book_name,
      from_language:'eng_Latn',
      to_language:'eng_Latn',
      user_id: userId,
    };
    console.log("before...");
    console.log(updated_content);
    let updated_content_str = JSON.stringify(updated_content);
    onSend({ role: 'user', content: updated_content_str }, null, selectedPlugins);
  };

  return (
    <div>
      {/* Display the flashcards */}
      <div className="w-full flex flex-col space-y-4">
        {cardsToShow.map((testPrompt: TestPrompt, index: number) => (
          <div
            key={index}
            onClick={() => handleCardClick(testPrompt)}
            // className="flex border border-gray-200 p-4 rounded-lg shadow-lg"
             className="flex border border-gray-200 p-4 rounded-lg shadow-lg cursor-pointer"
          >
            <PromptComponent testPrompt={testPrompt} showAnswer="false" />
          </div>
        ))}
      </div>
    </div>
  );
};
