import { IconBook, IconBook2} from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Plugin } from '@/types/agent';

import { ChatPluginPicker } from './ChatPluginPicker';

interface ChatPluginListProps {
  selectedPlugins: Plugin[];
  defaultBook: string,
  onChange: (plugins: Plugin[]) => void;
}

export const ChatPluginList = ({
  selectedPlugins,
  defaultBook,
  onChange,
}: ChatPluginListProps) => {
  const { t } = useTranslation('chat');
  const [selectorIsOpen, setSelectorIsOpen] = useState(false);

  return (
    <div className="p-1">
<div className="flex flex-row items-center">
  <button
    className="flex-none rounded-sm p-1 text-neutral-800 hover:bg-neutral-300 hover:text-neutral-900 dark:text-neutral-100 dark:hover:text-neutral-200"
    onClick={() => setSelectorIsOpen(true)}
  >
    <IconBook
      size={30}
      className="text-neutral-800 dark:text-neutral-100"
    />
  </button>
</div>

  <ChatPluginPicker
      open={selectorIsOpen}
      onClose={(plugins) => {
        onChange(plugins);
        setSelectorIsOpen(false);
      }}
    />
  </div>
  
  );
};
