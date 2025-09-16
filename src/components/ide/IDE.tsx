'use client';

import { useState } from 'react';
import { ArrowLeft, Settings as SettingsIcon, Download, HelpCircle, Users, Terminal, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FileSystemProvider } from '@/contexts/FileSystemContext';
import { ChatProvider } from '@/contexts/ChatContext';
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
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch('/api/files/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectName: project.name }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${project.name}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <ChatProvider>
      <FileSystemProvider>
        <div className="h-screen flex bg-gray-950">
          {/* Left Sidebar - AI Chat */}
          <div className="w-96 bg-gray-900 border-r border-gray-800 flex flex-col">
            <AIChat projectId={project.id} />
          </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="h-12 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 60 120" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="helixGradientIDE1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{stopColor: '#3b82f6', stopOpacity: 1}} />
                        <stop offset="100%" style={{stopColor: '#8b5cf6', stopOpacity: 1}} />
                      </linearGradient>
                      <linearGradient id="helixGradientIDE2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{stopColor: '#06b6d4', stopOpacity: 1}} />
                        <stop offset="100%" style={{stopColor: '#10b981', stopOpacity: 1}} />
                      </linearGradient>
                    </defs>
                    <path d="M15 10 Q5 30 15 50 Q25 70 15 90 Q5 110 15 120" 
                          stroke="url(#helixGradientIDE1)" 
                          strokeWidth="3" 
                          fill="none" 
                          strokeLinecap="round"/>
                    <path d="M45 10 Q55 30 45 50 Q35 70 45 90 Q55 110 45 120" 
                          stroke="url(#helixGradientIDE2)" 
                          strokeWidth="3" 
                          fill="none" 
                          strokeLinecap="round"/>
                    <line x1="15" y1="20" x2="45" y2="20" stroke="#3b82f6" strokeWidth="1.5" opacity="0.7"/>
                    <line x1="18" y1="30" x2="42" y2="30" stroke="#06b6d4" strokeWidth="1.5" opacity="0.7"/>
                    <line x1="15" y1="40" x2="45" y2="40" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.7"/>
                    <line x1="12" y1="50" x2="48" y2="50" stroke="#10b981" strokeWidth="1.5" opacity="0.7"/>
                    <line x1="15" y1="60" x2="45" y2="60" stroke="#3b82f6" strokeWidth="1.5" opacity="0.7"/>
                    <line x1="18" y1="70" x2="42" y2="70" stroke="#06b6d4" strokeWidth="1.5" opacity="0.7"/>
                    <line x1="15" y1="80" x2="45" y2="80" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.7"/>
                    <line x1="12" y1="90" x2="48" y2="90" stroke="#10b981" strokeWidth="1.5" opacity="0.7"/>
                    <line x1="15" y1="100" x2="45" y2="100" stroke="#3b82f6" strokeWidth="1.5" opacity="0.7"/>
                  </svg>
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
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white text-sm px-4" 
                onClick={handleDownload}
                disabled={isDownloading}
              >
                <Download className="w-4 h-4 mr-2" />
                {isDownloading ? 'Downloading...' : 'Download'}
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
    </ChatProvider>
  );
}