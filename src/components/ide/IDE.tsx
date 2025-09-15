'use client';

import { useState } from 'react';
import { ArrowLeft, Settings as SettingsIcon, Download, Github, HelpCircle, Users, Terminal, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FileSystemProvider } from '@/contexts/FileSystemContext';
import { CodeEditor } from '@/components/editor/CodeEditor';
import { PreviewPane } from '@/components/preview/PreviewPane';
import { AIChat } from '@/components/ai/AIChat';
import { FileExplorer } from '@/components/explorer/FileExplorer';
import { TerminalComponent } from '@/components/terminal/TerminalComponent';
import { Settings } from '@/components/ide/Settings';

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
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [showTerminal, setShowTerminal] = useState(false);
  const [showFiles, setShowFiles] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <FileSystemProvider>
      <div className="h-screen flex bg-gray-950">
        {/* Left Sidebar - AI Chat */}
        <div className="w-96 bg-gray-900 border-r border-gray-800 flex flex-col">
          <AIChat />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="h-12 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">H</span>
                </div>
                <span className="text-white font-medium text-sm">Helix</span>
              </div>
              <Button variant="ghost" size="sm" onClick={onBack} className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-1" />
                View history
              </Button>
            </div>
            
            <div className="flex items-center space-x-1">
              <select className="bg-gray-800 text-gray-300 text-sm px-3 py-1 rounded border border-gray-700 focus:border-blue-500">
                <option>{project.name} (imported from GitHub)</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowSettings(true)}
                className="text-gray-400 hover:text-white"
              >
                <SettingsIcon className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Github className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Users className="w-4 h-4" />
                Integrations
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4">
                Publish
              </Button>
            </div>
          </header>

          {/* Content with File Explorer and Editor */}
          <div className="flex-1 flex">
            {/* File Explorer */}
            {showFiles && (
              <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
                <FileExplorer />
              </div>
            )}

            {/* Editor and Terminal Area */}
            <div className="flex-1 flex flex-col">
              {/* Tab Navigation */}
              <div className="h-10 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setActiveTab('code')}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      activeTab === 'code'
                        ? 'bg-gray-800 text-white border border-gray-700'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    📄 Code
                  </button>
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      activeTab === 'preview'
                        ? 'bg-gray-800 text-white border border-gray-700'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    👁️ Preview
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFiles(!showFiles)}
                    className="text-gray-400 hover:text-white"
                  >
                    <FolderOpen className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTerminal(!showTerminal)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Terminal className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Tab Content */}
              <div className={`flex-1 ${showTerminal ? 'flex flex-col' : ''}`}>
                <div className={showTerminal ? 'flex-1' : 'h-full'}>
                  {activeTab === 'code' ? (
                    <CodeEditor />
                  ) : (
                    <PreviewPane />
                  )}
                </div>
                
                {/* Terminal */}
                {showTerminal && (
                  <div className="h-64 bg-black border-t border-gray-700">
                    <TerminalComponent />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <footer className="h-8 bg-gray-900 border-t border-gray-800 flex items-center justify-end px-4">
            <div className="flex items-center space-x-4 text-xs">
              <button className="text-blue-400 hover:text-blue-300 flex items-center space-x-1">
                <HelpCircle className="w-3 h-3" />
                <span>Help Center</span>
              </button>
              <button className="text-blue-400 hover:text-blue-300 flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>Join our Community</span>
              </button>
            </div>
          </footer>
        </div>
        
        {/* Settings Panel */}
        <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
      </div>
    </FileSystemProvider>
  );
}