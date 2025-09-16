'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ProjectChat {
  [projectId: string]: ChatMessage[];
}

interface ChatContextType {
  projectChats: ProjectChat;
  addMessage: (projectId: string, message: ChatMessage) => void;
  getProjectChat: (projectId: string) => ChatMessage[];
  clearProjectChat: (projectId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [projectChats, setProjectChats] = useState<ProjectChat>({});

  // Load chats from localStorage on mount
  useEffect(() => {
    const savedChats = localStorage.getItem('helix-project-chats');
    if (savedChats) {
      try {
        const parsed = JSON.parse(savedChats);
        // Convert timestamp strings back to Date objects
        const chatsWithDates: ProjectChat = {};
        Object.entries(parsed).forEach(([projectId, messages]) => {
          chatsWithDates[projectId] = (messages as any[]).map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
        });
        setProjectChats(chatsWithDates);
      } catch (error) {
        console.error('Error loading saved chats:', error);
      }
    }
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('helix-project-chats', JSON.stringify(projectChats));
  }, [projectChats]);

  const addMessage = (projectId: string, message: ChatMessage) => {
    setProjectChats(prev => {
      const currentMessages = prev[projectId] || [];
      // Check if message already exists to prevent duplicates
      const messageExists = currentMessages.some(msg => msg.id === message.id);
      if (messageExists) {
        return prev;
      }
      return {
        ...prev,
        [projectId]: [...currentMessages, message]
      };
    });
  };

  const getProjectChat = (projectId: string): ChatMessage[] => {
    return projectChats[projectId] || [];
  };

  const clearProjectChat = (projectId: string) => {
    setProjectChats(prev => ({
      ...prev,
      [projectId]: []
    }));
  };

  return (
    <ChatContext.Provider value={{
      projectChats,
      addMessage,
      getProjectChat,
      clearProjectChat
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}