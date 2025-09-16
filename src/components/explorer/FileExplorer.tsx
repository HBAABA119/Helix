'use client';

import { useState } from 'react';
import { File, Folder, Plus, Trash2 } from 'lucide-react';
import { useFileSystem } from '@/contexts/FileSystemContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProjectFile } from '@/types';

interface FileItemProps {
  file: ProjectFile;
  onSelect: (file: ProjectFile) => void;
  onDelete: (id: string) => void;
  level: number;
}

function FileItem({ file, onSelect, onDelete, level }: FileItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { getFilesByParent } = useFileSystem();

  const children = file.type === 'folder' ? getFilesByParent(file.id) : [];

  const handleClick = () => {
    if (file.type === 'folder') {
      setIsExpanded(!isExpanded);
    } else {
      onSelect(file);
    }
  };

  return (
    <div>
      <div
        className="flex items-center px-2 py-1 hover:bg-accent cursor-pointer group"
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
        draggable={file.type === 'file'}
        onDragStart={(e) => {
          if (file.type === 'file') {
            e.dataTransfer.setData('application/json', JSON.stringify({
              type: 'file',
              id: file.id,
              name: file.name,
              path: file.path,
              content: file.content
            }));
          }
        }}
      >
        {file.type === 'folder' ? (
          <Folder className="w-4 h-4 mr-2 text-blue-400" />
        ) : (
          <File className="w-4 h-4 mr-2 text-gray-400" />
        )}
        
        <span className="text-sm flex-1">{file.name}</span>
        
        <div className="opacity-0 group-hover:opacity-100 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(file.id);
            }}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      {file.type === 'folder' && isExpanded && (
        <div>
          {children.map(child => (
            <FileItem
              key={child.id}
              file={child}
              onSelect={onSelect}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileExplorer() {
  const { getFilesByParent, setActiveFile, deleteFile, createFile, createFolder } = useFileSystem();
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  const rootFiles = getFilesByParent();

  const handleCreateFile = () => {
    if (newItemName.trim()) {
      createFile(newItemName.trim());
      setNewItemName('');
      setShowNewFileInput(false);
    }
  };

  const handleCreateFolder = () => {
    if (newItemName.trim()) {
      createFolder(newItemName.trim());
      setNewItemName('');
      setShowNewFolderInput(false);
    }
  };

  return (
    <div className="flex-1 bg-gray-900">
      <div className="p-3 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm text-gray-200">Explorer</h3>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-400 hover:text-gray-200"
              onClick={() => setShowNewFileInput(true)}
              title="New File"
            >
              <Plus className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-400 hover:text-gray-200"
              onClick={() => setShowNewFolderInput(true)}
              title="New Folder"
            >
              <Folder className="w-3 h-3" />
            </Button>
          </div>
        </div>
        
        {showNewFileInput && (
          <div className="mb-2">
            <Input
              placeholder="New file name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFile();
                if (e.key === 'Escape') setShowNewFileInput(false);
              }}
              onBlur={handleCreateFile}
              className="h-8 text-xs"
              autoFocus
            />
          </div>
        )}
        
        {showNewFolderInput && (
          <div className="mb-2">
            <Input
              placeholder="New folder name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder();
                if (e.key === 'Escape') setShowNewFolderInput(false);
              }}
              onBlur={handleCreateFolder}
              className="h-8 text-xs"
              autoFocus
            />
          </div>
        )}
      </div>
      
      <div className="overflow-y-auto">
        {rootFiles.map(file => (
          <FileItem
            key={file.id}
            file={file}
            onSelect={setActiveFile}
            onDelete={deleteFile}
            level={0}
          />
        ))}
        
        {rootFiles.length === 0 && (
          <div className="p-4 text-center text-gray-400 text-sm">
            No files yet. Create your first file!
          </div>
        )}
      </div>
    </div>
  );
}