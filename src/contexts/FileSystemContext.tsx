'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { ProjectFile } from '@/types';

interface FileSystemContextType {
  files: ProjectFile[];
  activeFile: ProjectFile | null;
  setActiveFile: (file: ProjectFile | null) => void;
  createFile: (name: string, parentId?: string) => void;
  updateFile: (id: string, content: string) => void;
  deleteFile: (id: string) => void;
  createFolder: (name: string, parentId?: string) => void;
  getFilesByParent: (parentId?: string) => ProjectFile[];
}

const FileSystemContext = createContext<FileSystemContextType | null>(null);

export function useFileSystem() {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  return context;
}

export function FileSystemProvider({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [activeFile, setActiveFile] = useState<ProjectFile | null>(null);

  const createFile = useCallback((name: string, parentId?: string) => {
    const newFile: ProjectFile = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      content: '',
      path: parentId ? `${parentId}/${name}` : name,
      type: 'file',
      parentId,
    };
    setFiles(prev => [...prev, newFile]);
    setActiveFile(newFile);
  }, []);

  const updateFile = useCallback((id: string, content: string) => {
    setFiles(prev => prev.map(file => 
      file.id === id ? { ...file, content } : file
    ));
  }, []);

  const deleteFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
    if (activeFile?.id === id) {
      setActiveFile(null);
    }
  }, [activeFile]);

  const createFolder = useCallback((name: string, parentId?: string) => {
    const newFolder: ProjectFile = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      content: '',
      path: parentId ? `${parentId}/${name}` : name,
      type: 'folder',
      parentId,
    };
    setFiles(prev => [...prev, newFolder]);
  }, []);

  const getFilesByParent = useCallback((parentId?: string) => {
    return files.filter(file => file.parentId === parentId);
  }, [files]);

  return (
    <FileSystemContext.Provider value={{
      files,
      activeFile,
      setActiveFile,
      createFile,
      updateFile,
      deleteFile,
      createFolder,
      getFilesByParent,
    }}>
      {children}
    </FileSystemContext.Provider>
  );
}