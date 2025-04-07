import { useState } from 'react';

import { usePlugins } from '@/hooks/usePlugins';

import { Plugin } from '@/types/agent';

import { Dialog } from '../Dialog/Dialog';
import { Checkbox } from '../Input/Checkbox';

interface Props {
  open: boolean;
  onClose: (plugins: Plugin[]) => void;
}

const PluginListItem = ({
  tool,
  checked,
  onChange,
}: {
  tool: Plugin;
  checked: boolean;
  onChange: (value: boolean) => void;
}) => {
  return (
<div
  className={`flex items-center p-2 rounded cursor-pointer ${checked ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
  onClick={() => onChange(!checked)}
>
  <Checkbox
    checked={checked}
    className="text-gray-600 mr-2"
    onChange={() => onChange(!checked)}
  />
  <span className="flex-1 text-gray-700 dark:text-gray-300 font-medium">
    {tool.nameForHuman}
  </span>
</div>

  );
};
export const ChatPluginPicker = ({ open, onClose }: Props) => {
  const [selectedPlugins, setSelectedPlugins] = useState<Set<Plugin>>(
    new Set(),
  );
  const { plugins } = usePlugins();
  if (!open) {
    return null;
  }

  const handleChange = (tool: Plugin, value: boolean) => {
    if (value) {
      selectedPlugins.clear();
      setSelectedPlugins(new Set(selectedPlugins).add(tool));
    } else {
      const newValue = new Set(selectedPlugins);
      newValue.delete(tool);
      setSelectedPlugins(newValue);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => onClose(Array.from(selectedPlugins.values()))}
      className="fixed flex items-center justify-center " // Reduced padding for mobile and desktop
    >
      {/* <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-lg "> Reduced padding */}

        <div className="max-h-80 sm:max-h-100 overscroll-y-auto divide-y-2">
          {plugins &&
            plugins.map((plugin) => (
              <PluginListItem
                key={plugin.nameForModel}
                tool={plugin}
                checked={selectedPlugins.has(plugin)}
                onChange={(value) => handleChange(plugin, value)}
              />
            ))}
        </div>
      {/* </div> */}
    </Dialog>

  );
};
