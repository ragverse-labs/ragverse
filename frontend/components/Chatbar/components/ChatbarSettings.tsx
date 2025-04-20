import {
  IconFileExport,
  IconLogout,
  IconMoon,
  IconSettings,
  IconSun,
} from '@tabler/icons-react';
import { useContext, useState } from 'react';

import { useTranslation } from 'next-i18next';

import HomeContext from '@/pages/api/home/home.context';

import { SettingDialog } from '@/components/Settings/SettingDialog';

import { Import } from '../../Settings/Import';
import { Key } from '../../Settings/Key';
import { SidebarButton } from '../../Sidebar/SidebarButton';
import ChatbarContext from '../Chatbar.context';
import { ChatModeKeys } from './ChatModeKeys';
import { ClearConversations } from './ClearConversations';
import { UserProfile } from '@/components/Settings/UserProfile';

export const ChatbarSettings = () => {
  const { t } = useTranslation('sidebar');
  const [isSettingDialogOpen, setIsSettingDialog] = useState<boolean>(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState<boolean>(false);
  const [isChangePasswordOpen, setsChangePasswordOpen] = useState<boolean>(false);
  const {
    state: {
      apiKey,
      serverSideApiKeyIsSet,
      serverSidePluginKeysSet,
      conversations,
    },
  } = useContext(HomeContext);

  const {
    handleClearConversations,
    // handleImportConversations,
    // handleExportData,
    // handleApiKeyChange,
    handleLogOut,
  } = useContext(ChatbarContext);

  return (
    <div className="flex flex-col items-center space-y-1 border-t border-white/20 pt-1 text-sm">
      {conversations.length > 0 ? (
        <ClearConversations onClearConversations={handleClearConversations} />
      ) : null}

      {/* <Import onImport={handleImportConversations} /> */}

      {/* <SidebarButton
        text={t('Export data')}
        icon={<IconFileExport size={18} />}
        onClick={() => handleExportData()}
      /> */}

<UserProfile
        open={isUserProfileOpen}
        onClose={() => {
          setIsUserProfileOpen(false);
        }}
      />
      
    {/* <SidebarButton
            text={t('Change Password')}
            icon={<IconSettings size={18} />}
            onClick={() => setIsUserProfileOpen(true)}
          /> */}

      <SidebarButton
        text={t('User Profile')}
        icon={<IconSettings size={18} />}
        onClick={() => setIsUserProfileOpen(true)}
      />

      {/* {!serverSideApiKeyIsSet ? (
        <Key apiKey={apiKey} onApiKeyChange={handleApiKeyChange} />
      ) : null}

      {!serverSidePluginKeysSet ? <ChatModeKeys /> : null} */}

      {/* <SettingDialog
        open={isSettingDialogOpen}
        onClose={() => {
          setIsSettingDialog(false);
        }}s
      />
       */}


      <SidebarButton
        text={t('Log Out')}
        icon={<IconLogout size={18} />}
        onClick={() => handleLogOut()}
      />
      
    </div>
  );
};
