import React, { useState, useEffect } from 'react';
import { TestPrompt } from '@/types/test-prompt';

type Language =
  | 'English'
  | 'Hindi'
  | 'Kannada'
  | 'Gujarati'
  | 'Tamil'
  | 'Punjabi'
  | 'Telugu'
  | 'Marathi'
  | 'Malayalam'
  | 'Bengali';

interface Props {
  testPrompt: TestPrompt;
  showAnswer: string;
}

const languageFontStyles: Record<Language, React.CSSProperties> = {
  English: { fontFamily: "'Arial', sans-serif" },
  Hindi: { fontFamily: "'Noto Sans Devanagari', sans-serif" },
  Kannada: { fontFamily: "'Noto Sans Kannada', sans-serif" },
  Gujarati: { fontFamily: "'Noto Sans Gujarati', sans-serif" },
  Tamil: { fontFamily: "'Noto Sans Tamil', sans-serif" },
  Punjabi: { fontFamily: "'Noto Sans Gurmukhi', sans-serif" },
  Telugu: { fontFamily: "'Noto Sans Telugu', sans-serif" },
  Marathi: { fontFamily: "'Noto Sans Devanagari', sans-serif" },
  Malayalam: { fontFamily: "'Noto Sans Malayalam', sans-serif" },
  Bengali: { fontFamily: "'Noto Sans Bengali', sans-serif" },
};

export const PromptComponent = ({ testPrompt, showAnswer }: Props) => {
  const [currentQA, setCurrentQA] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQA((prevQA) => (prevQA + 1) % 5);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentLanguage = 'English' as Language;
  const fontStyle = languageFontStyles[currentLanguage];

  return (
    <div style={{ ...fontStyle }}>
      <style>
        {`
          .three-line-clamp {
            display: -webkit-box;
            -webkit-line-clamp: 4;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        `}
      </style>

      <div key={currentQA} className="overflow-hidden">
        <p className="text-gray-500">{testPrompt.book_name}</p>
        <p className="w-full resize-none border-0 bg-transparent text-black dark:bg-transparent dark:text-white three-line-clamp">
          {testPrompt.question}
        </p>

        {showAnswer === 'true' && (
          <>
            <p className="text-gray-500 font-semibold mt-4 truncate">Answer:</p>
            <p className="w-full resize-none border-0 bg-transparent p-0 py-2 pr-8 pl-10 text-black dark:bg-transparent dark:text-white md:py-3 md:pl-10 three-line-clamp">
              {testPrompt.answer}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default PromptComponent;
