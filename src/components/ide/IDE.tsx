'use client';

import { useState } from 'react';
import { ArrowLeft, Play, Download, MessageCircle, Bug } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FileSystemProvider } from '@/contexts/FileSystemContext';
import { FileExplorer } from '@/components/explorer/FileExplorer';
import { CodeEditor } from '@/components/editor/CodeEditor';
import { PreviewPane } from '@/components/preview/PreviewPane';
import { AIChat } from '@/components/ai/AIChat';

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IDEProps {
  project: Project;
  onBack: () => void;
}

export function IDE({ project, onBack }: IDEProps) {
  const [showChat, setShowChat] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  return (
    <FileSystemProvider>
      <div className="h-screen flex flex-col bg-background">
        {/* Header */}
        <header className="h-12 bg-card border-b border-border flex items-center px-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="font-semibold">{project.name}</h1>
          <div className="ml-auto flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Play className="w-4 h-4 mr-2" />
              Run
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="ghost" size="sm">
              <Bug className="w-4 h-4 mr-2" />
              Debug
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowChat(!showChat)}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              AI Chat
            </Button>
          </div>
        </header>

        {/* Main IDE Layout */}
        <div className="flex-1 flex">
          {/* File Explorer */}
          <FileExplorer />

          {/* Editor */}
          <div className="flex-1 flex flex-col">
            <CodeEditor />
          </div>

          {/* Preview Pane */}
          {showPreview && (
            <div className="w-1/3 border-l border-border">
              <PreviewPane />
            </div>
          )}

          {/* AI Chat */}
          {showChat && (
            <div className="w-80 border-l border-border">
              <AIChat />
            </div>
          )}
        </div>
      </div>
    </FileSystemProvider>
  );
}