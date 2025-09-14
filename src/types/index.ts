export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  files: ProjectFile[];
}

export interface ProjectFile {
  id: string;
  name: string;
  content: string;
  path: string;
  type: 'file' | 'folder';
  parentId?: string;
}

export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'google' | 'anthropic';
  apiKey?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ErrorContext {
  error: string;
  file: string;
  line?: number;
  column?: number;
  stack?: string;
}