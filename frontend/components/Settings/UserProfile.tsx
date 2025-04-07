import { FC, useContext, useEffect, useState } from 'react';

import { useTranslation } from 'next-i18next';

import { useCreateReducer } from '@/hooks/useCreateReducer';

import { trpc } from '@/utils/trpc';

import { Settings } from '@/types/settings';

import HomeContext from '@/pages/api/home/home.context';

// import { TemperatureSlider } from '../Chat/Temperature';
import { Dialog } from '../Dialog/Dialog';
// import ImagePicker from '../Imagepicker';
import Avatar from '../Imagepicker/Avatar';


interface Props {
  open: boolean;
  onClose: () => void;
}

export const UserProfile: FC<Props> = ({ open, onClose }) => {
  const { t } = useTranslation('User Profile');
  const {
    state: { settings },
    dispatch: homeDispatch,
  } = useContext(HomeContext);
  const { state, dispatch } = useCreateReducer<Settings>({
    initialState: settings,
  });
 
  
  const {
    state: { models },
  } = useContext(HomeContext);

  const updateMutation = trpc.settings.settingsUpdate.useMutation();

  useEffect(() => {
    if (open) {
      dispatch({ type: 'replace_all', value: settings });
    }
  }, [dispatch, open, settings]);

  const handleSave = async () => {
    await updateMutation.mutate(state);
    homeDispatch({ field: 'settings', value: state });
  };

  // Render the dialog.
  return (
    <Dialog open={open} onClose={() => onClose()}>
      <div className="text-lg pb-4 font-bold text-black dark:text-neutral-200">
        {t('Profile')}
      </div>

      {/* <IconKey size={18} /> */}
      <div className="text-sm font-bold mb-2 text-black dark:text-neutral-200">
        {t('Name')}
      </div>

      <Avatar username={state.displayName} />

      <input
        // ref={inputRef}
        className="ml-2 h-[20px] flex-1 overflow-hidden overflow-ellipsis border-b border-neutral-400 bg-transparent pr-1 text-[12.5px] leading-3 text-left text-white outline-none focus:border-neutral-100"
          value={state.displayName}
        onChange={(event) =>
          dispatch({ field: 'displayName', value: event.target.value })
        }
        // onKeyDown={handleEnterDown}
        placeholder={t('Name') || 'Name'}
      />



      <div className="text-sm font-bold mb-2 text-black dark:text-neutral-200">
        {t('Theme')}
      </div>

      <select
        className="w-full cursor-pointer bg-transparent p-2 text-neutral-700 dark:text-neutral-200"
        value={state.theme}
        onChange={(event) =>
          dispatch({ field: 'theme', value: event.target.value })
        }
      >
        <option value="dark">{t('Dark mode')}</option>
        <option value="light">{t('Light mode')}</option>
      </select>

      <div className="text-sm font-bold mt-2 mb-2 text-black dark:text-neutral-200">
        {t('Question Language')}
      </div>

      <div className="w-full rounded-lg border border-neutral-200 bg-transparent pr-2 text-neutral-900 dark:border-neutral-600 dark:text-white">
        <select
          className="w-full bg-transparent p-2"
          value={state.sourceLanguage}
          onChange={(event) =>
            dispatch({ field: 'sourceLanguage', value: event.target.value })
          }
        >
          {models.length > 0 && models[0].languages.map((model) => (
            <option
              key={model.identifier}
              value={model.identifier}
              className="dark:bg-[#343541] dark:text-white"
            >
              {model.name}
            </option>
          ))}
        </select>
      </div>
      <div className="text-sm font-bold mt-2 mb-2 text-black dark:text-neutral-200">
        {t('Answer Language')}
      </div>

      <div className="w-full rounded-lg border border-neutral-200 bg-transparent pr-2 text-neutral-900 dark:border-neutral-600 dark:text-white">
        <select
          className="w-full bg-transparent p-2"
          value={state.defaultLanguage}
          onChange={(event) =>
            dispatch({ field: 'defaultLanguage', value: event.target.value })
          }
        >
          {models.length > 0 && models[0].languages.map((model) => (
            <option
              key={model.identifier}
              value={model.identifier}
              className="dark:bg-[#343541] dark:text-white"
            >
              {model.name}
            </option>
          ))}
        </select>
      </div>

    <div className="text-sm font-bold mt-2 mb-2 text-black dark:text-neutral-200">
        {t('Book of Choice')}
      </div>
      <div className="w-full rounded-lg border border-neutral-200 bg-transparent pr-2 text-neutral-900 dark:border-neutral-600 dark:text-white">
        <select
          className="w-full bg-transparent p-2"
          value={state.defaultBook}
          onChange={(event) =>
            dispatch({ field: 'defaultBook', value: event.target.value })
          }
        >
          {models.length > 0 &&  models[0].books.map((model) => (
            <option
              key={model.identifier}
              value={model.identifier}
              className="dark:bg-[#343541] dark:text-white"
            >
              {model.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        className="w-full px-4 py-2 mt-6 border rounded-lg shadow border-neutral-500 text-neutral-900 hover:bg-neutral-100 focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-300"
        onClick={() => {
          handleSave();
          onClose();
        }}
      >
        {t('Save')}
      </button>
    </Dialog>
  );
};
