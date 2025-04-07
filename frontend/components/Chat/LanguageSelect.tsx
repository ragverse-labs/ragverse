
import {  IconWorld } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageSelectorProps {
  models: { languages: { identifier: string; name: string }[] }[];
  defaultLanguage: string;
  onChange: (language: string) => void;
}

export const LanguageSelector = ({
  models,
  defaultLanguage,
  onChange,
}: LanguageSelectorProps) => {
  const { t } = useTranslation('chat');
  const [langSelectorIsOpen, setLangSelectorIsOpen] = useState(false);

  const handleLanguageChange = (language: string) => {
    onChange(language);
    setLangSelectorIsOpen(false);
  };
  // const { state, dispatch } = useCreateReducer<Settings>({
  //   initialState: settings,
  // });

  // List of languages to display
  const allowedLanguages = [
    'eng_Latn',
    'hin_Deva',
    'kan_Knda',
    'tam_Taml',
    'tel_Telu',
    'ben_Beng',
    'guj_Gujr',
    'mal_Mlym',
    'mar_Deva',
    'pan_Guru',
  ];

  // Filter the languages based on the allowed languages list
  const filteredLanguages = models.length > 0
    ? models[0].languages.filter(language =>
      allowedLanguages.includes(language.identifier)
    )
    : [];

  return (
    <div className="p-1">
<div className="flex flex-row items-center">
  <button
  className="flex-none rounded-sm p-1 text-neutral-800 hover:bg-neutral-300 hover:text-neutral-900 dark:text-neutral-100 dark:hover:text-neutral-200"
    onClick={() => setLangSelectorIsOpen(true)}
  >
    <IconWorld
      size={30}
      
    />
  </button>
</div>
  
    {langSelectorIsOpen && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setLangSelectorIsOpen(false);
          }
        }}
      >
        <div className="bg-white dark:bg-[#343541] rounded-lg shadow-lg p-4 w-11/12 max-w-sm">
          <div className="flex flex-col space-y-2">
            {filteredLanguages.map((language) => (
              <button
                key={language.identifier}
                className={`text-left py-1 px-2 rounded ${
                  language.identifier === defaultLanguage
                    ? 'bg-gray-300 font-bold dark:bg-gray-700 text-black' // Styles for selected language
                    : 'hover:bg-neutral-300 dark:hover:bg-[#4a4a4a] text-gray-900 dark:text-gray-100' // Default styles for other languages
                }`}
                onClick={() => handleLanguageChange(language.identifier)}
              >
                <span>
                  {language.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )}
  </div>
  

  );
};
