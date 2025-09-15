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
  addFileFromPath: (filePath: string, content: string) => void;
  getFileByPath: (filePath: string) => ProjectFile | null;
  updateFileByPath: (filePath: string, content: string) => void;
  getAllFiles: () => ProjectFile[];
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

  const addFileFromPath = useCallback((filePath: string, content: string) => {
    const fileName = filePath.split('/').pop() || 'untitled';
    const newFile: ProjectFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: fileName,
      content,
      path: filePath,
      type: 'file',
      parentId: undefined,
    };
    setFiles(prev => {
      // Check if file already exists, update if it does
      const existingIndex = prev.findIndex(f => f.path === filePath);
      if (existingIndex !== -1) {
        return prev.map((file, index) => 
          index === existingIndex ? { ...file, content } : file
        );
      }
      return [...prev, newFile];
    });
  }, []);

  const getFileByPath = useCallback((filePath: string) => {
    return files.find(file => file.path === filePath) || null;
  }, [files]);

  const updateFileByPath = useCallback((filePath: string, content: string) => {
    setFiles(prev => prev.map(file => 
      file.path === filePath ? { ...file, content } : file
    ));
  }, []);

  const getAllFiles = useCallback(() => {
    return files;
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
      addFileFromPath,
      getFileByPath,
      updateFileByPath,
      getAllFiles,
    }}>
      {children}
    </FileSystemContext.Provider>
  );
}