import {
  IconCaretDown,
  IconCaretRight,
  IconCheck,
  IconPencil,
  IconTrash,
  IconFolderPlus,
  IconX,
} from '@tabler/icons-react';
import {
  KeyboardEvent,
  ReactElement,
  useEffect,
  useState,
} from 'react';


import { FolderInterface } from '@/types/folder';

import SidebarActionButton from '@/components/Buttons/SidebarActionButton';

import { InputText } from '../Input/InputText';

interface Props {
  currentFolder: FolderInterface;
  searchTerm: string;
  handleDrop?: ((e: any, folder: FolderInterface) => void);
  folderComponent: (ReactElement | undefined)[];
  handleAddItem?: () => void;
  handleEditFolder?: (folder: FolderInterface) => void;
  handleDeleteFolder?: (folder: FolderInterface) => void;
}

const Folder = ({
  currentFolder,
  searchTerm,
  handleDrop,
  folderComponent,
  handleAddItem,
  handleEditFolder,
  handleDeleteFolder
}: Props) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleEnterDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEditFolder && handleRename();
    }
  };

  const handleRename = async () => {
    handleEditFolder && handleEditFolder({
      ...currentFolder,
      name: renameValue,
    });
    setRenameValue('');
    setIsRenaming(false);
  };

  const dropHandler = (e: any) => {
    if (e.dataTransfer) {
      setIsOpen(true);

      handleDrop && handleDrop(e, currentFolder);

      e.target.style.background = 'none';
    }
  };

  const allowDrop = (e: any) => {
    e.preventDefault();
  };

  const highlightDrop = (e: any) => {
    e.target.style.background = '#343541';
  };

  const removeHighlight = (e: any) => {
    e.target.style.background = 'none';
  };

  useEffect(() => {
    if (isRenaming) {
      setIsDeleting(false);
    } else if (isDeleting) {
      setIsRenaming(false);
    }
  }, [isRenaming, isDeleting]);

  useEffect(() => {
    if (searchTerm) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [searchTerm]);

  return (
    <>
      <div className="relative flex items-center">
        {isRenaming ? (
          <div className="flex w-full items-center gap-3 bg-[#343541]/90 p-3">
            {isOpen ? (
              <IconCaretDown size={18} />
            ) : (
              <IconCaretRight size={18} />
            )}
            <InputText
              className="mr-12 flex-1 overflow-hidden overflow-ellipsis border-neutral-400 bg-transparent text-left text-[12.5px] leading-3 text-white outline-none focus:border-neutral-100"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={handleEnterDown}
              autoFocus
            />
          </div>
        ) : (
          <button
            className={`flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 text-sm transition-colors duration-200 hover:bg-[#343541]/90`}
            onClick={() => setIsOpen(!isOpen)}
            onDrop={handleDrop ? (e) => dropHandler(e) : undefined}
            onDragOver={handleDrop ? allowDrop : undefined}
            onDragEnter={handleDrop ? highlightDrop : undefined}
            onDragLeave={handleDrop ? removeHighlight : undefined}
          >
            {isOpen ? (
              <IconCaretDown size={18} />
            ) : (
              <IconCaretRight size={18} />
            )}

            <div className="relative max-h-5 flex-1 overflow-hidden text-ellipsis whitespace-nowrap break-all text-left text-[12.5px] leading-3">
              {currentFolder.name}
            </div>
          </button>
        )}

        {(isDeleting || isRenaming) && (
          <div className="absolute right-1 z-10 flex text-gray-300">
            <SidebarActionButton
              handleClick={(e) => {
                e.stopPropagation();

                if (isDeleting) {
                  handleDeleteFolder!(currentFolder);
                } else if (isRenaming) {
                  handleRename();
                }

                setIsDeleting(false);
                setIsRenaming(false);
              }}
            >
              <IconCheck size={18} />
            </SidebarActionButton>
            <SidebarActionButton
              handleClick={(e) => {
                e.stopPropagation();
                setIsDeleting(false);
                setIsRenaming(false);
              }}
            >
              <IconX size={18} />
            </SidebarActionButton>
          </div>
        )}

        {!isDeleting && !isRenaming && (
          <div className="absolute right-1 z-10 flex text-gray-300">
            {handleEditFolder && (
              <SidebarActionButton
                handleClick={(e) => {
                  e.stopPropagation();
                  setIsRenaming(true);
                  setRenameValue(currentFolder.name);
                }}
              >
                <IconPencil size={18} />
              </SidebarActionButton>
            )}
            {handleDeleteFolder && (
              <SidebarActionButton
                handleClick={(e) => {
                  e.stopPropagation();
                  setIsDeleting(true);
                }}
              >
                <IconTrash size={18} />
              </SidebarActionButton>
            )}
            {handleAddItem && (
              <SidebarActionButton
                handleClick={(e) => {
                  e.stopPropagation();
                  handleAddItem();
                }}
              >
                <IconFolderPlus size={18} />
              </SidebarActionButton>
            )}
          </div>
        )}
      </div>

      {isOpen ? (<div className="pl-2"> {folderComponent} </div>) : null}
    </>
  );
};

export default Folder;
