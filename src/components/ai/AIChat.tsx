'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Settings, Download, ChevronDown, Bot, User, Sparkles, FileText, CheckCircle, AlertCircle, Terminal, FolderOpen, Check, X, Eye, Copy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useFileSystem } from '@/contexts/FileSystemContext';
import { useChat } from '@/contexts/ChatContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  codeBlocks?: Array<{ language: string; code: string }>;
  filesToCreate?: Array<{ path: string; content: string; language: string }>;
  filesToUpdate?: Array<{ path: string; content: string; language: string }>;
  fileOperations?: Array<{ path: string; success: boolean; error?: string; message?: string }>;
  fileUpdateResults?: Array<{ path: string; success: boolean; error?: string; message?: string }>;
  fileDeletionResults?: Array<{ path: string; success: boolean; error?: string; message?: string }>;
  folderCreationResults?: Array<{ path: string; success: boolean; error?: string; message?: string }>;
  fileReadResults?: Array<{ path: string; content: string; success: boolean; error?: string }>;
  terminalResults?: Array<{ command: string; output: string; success: boolean }>;
  previewRequests?: Array<string>;
  userQuestions?: Array<string>;
  pendingChanges?: boolean;
  changesApproved?: boolean;
}

// Available AI models
const AVAILABLE_MODELS = [
  { id: 'auto', name: 'Automatic', description: 'Best model chosen automatically' },
  { id: 'qwen/qwen3-coder-480b-a35b-instruct', name: 'Qwen Coder 480B', description: 'Best for coding' },
  { id: 'nvidia/llama-3.3-nemotron-super-49b-v1.5', name: 'Llama 3.3 Nemotron 49B', description: 'Advanced reasoning' },
  { id: 'meta/llama-3.2-3b-instruct', name: 'Llama 3.2 3B', description: 'Fast responses' },
  { id: 'meta/llama-3.2-1b-instruct', name: 'Llama 3.2 1B', description: 'Ultra fast' },
  { id: 'meta/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', description: 'Balanced performance' }
];

const CHAT_MODES = [
  { id: 'ask', name: 'Ask Mode', description: 'Quick questions & answers', icon: '❓' },
  { id: 'agent', name: 'Agent Mode', description: 'AI takes control & builds', icon: '🤖' }
];

export function AIChat({ projectId }: { projectId: string }) {
  const { addMessage, getProjectChat } = useChat();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const [chatMode, setChatMode] = useState(CHAT_MODES[0].id);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<Message | null>(null);
  const [pendingReview, setPendingReview] = useState<{
    messageId: string;
    filesToCreate?: Array<{ path: string; content: string; language: string }>;
    filesToUpdate?: Array<{ path: string; content: string; language: string }>;
  } | null>(null);
  const [draggedFile, setDraggedFile] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { files, addFileFromPath, updateFileByPath, getAllFiles } = useFileSystem();

  // Copy text to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.type === 'file') {
        const fileInfo = `[File: ${data.name}]\n${data.content ? data.content.substring(0, 500) + (data.content.length > 500 ? '...' : '') : 'No content'}`;
        setInputMessage(prev => prev + (prev ? '\n\n' : '') + fileInfo);
      }
    } catch (error) {
      console.error('Error handling dropped file:', error);
    }
    setDraggedFile(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedFile(null);
  };

  // Load project-specific chat history
  useEffect(() => {
    const projectMessages = getProjectChat(projectId);
    setMessages(projectMessages);
  }, [projectId]); // Remove getProjectChat from dependencies to prevent unnecessary re-renders

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    // Add user message to both local state and persistent storage
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    addMessage(projectId, userMessage);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          model: selectedModel,
          projectId: projectId,
          chatMode: chatMode,
          conversationHistory: messages.slice(-10).map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          context: {
            files: files.map(f => ({ name: f.name, path: f.path, content: f.content })),
            projectName: 'Helix IDE Project',
            allFiles: getAllFiles().map(f => ({ name: f.name, path: f.path, hasContent: !!f.content }))
          }
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'Sorry, I could not generate a response.',
        timestamp: new Date(),
        codeBlocks: data.codeBlocks || [],
        filesToCreate: data.filesToCreate || [],
        filesToUpdate: data.filesToUpdate || [],
        fileReadResults: data.fileReadResults || [],
        fileUpdateResults: data.fileUpdateResults || [],
        fileDeletionResults: data.fileDeletionResults || [],
        folderCreationResults: data.folderCreationResults || [],
        terminalResults: data.terminalResults || [],
        previewRequests: data.previewRequests || [],
        userQuestions: data.userQuestions || []
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      addMessage(projectId, assistantMessage);

      // Check if there are files to create or update - always require review in both modes
      if ((data.filesToCreate && data.filesToCreate.length > 0) || 
          (data.filesToUpdate && data.filesToUpdate.length > 0)) {
        // Set pending review for both Ask and Agent modes
        setPendingReview({
          messageId: assistantMessage.id,
          filesToCreate: data.filesToCreate,
          filesToUpdate: data.filesToUpdate
        });
        
        // Mark message as pending changes
        assistantMessage.pendingChanges = true;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedModelInfo = AVAILABLE_MODELS.find(m => m.id === selectedModel);
  const selectedModeInfo = CHAT_MODES.find(m => m.id === chatMode);

  const handleApproveChanges = async () => {
    if (!pendingReview) return;
    
    try {
      let fileResults: any[] = [];
      let updateResults: any[] = [];
      
      // Create files if any
      if (pendingReview.filesToCreate && pendingReview.filesToCreate.length > 0) {
        fileResults = await createFiles(pendingReview.filesToCreate);
      }
      
      // Update files if any
      if (pendingReview.filesToUpdate && pendingReview.filesToUpdate.length > 0) {
        updateResults = await updateFiles(pendingReview.filesToUpdate);
      }
      
      // Update the message to show changes were approved
      setMessages(prev => prev.map(msg => 
        msg.id === pendingReview.messageId
          ? { 
              ...msg, 
              pendingChanges: false, 
              changesApproved: true,
              fileOperations: fileResults,
              fileUpdateResults: updateResults
            }
          : msg
      ));
      
      // Clear pending review
      setPendingReview(null);
    } catch (error) {
      console.error('Error applying changes:', error);
    }
  };
  
  const handleRejectChanges = () => {
    if (!pendingReview) return;
    
    // Update the message to show changes were rejected
    setMessages(prev => prev.map(msg => 
      msg.id === pendingReview.messageId
        ? { ...msg, pendingChanges: false, changesApproved: false }
        : msg
    ));
    
    // Clear pending review
    setPendingReview(null);
  };

  const createFiles = async (filesToCreate: Array<{ path: string; content: string; language: string }>) => {
    try {
      const response = await fetch('/api/files/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files: filesToCreate }),
      });

      const result = await response.json();
      
      // Sync successful files with the filesystem context
      if (result.results) {
        result.results.forEach((fileResult: any) => {
          if (fileResult.success) {
            const originalFile = filesToCreate.find(f => f.path === fileResult.path);
            if (originalFile) {
              addFileFromPath(fileResult.path, originalFile.content);
            }
          }
        });
      }
      
      return result.results || [];
    } catch (error) {
      console.error('Error creating files:', error);
      return filesToCreate.map(file => ({
        path: file.path,
        success: false,
        error: 'Failed to create file'
      }));
    }
  };

  const updateFiles = async (filesToUpdate: Array<{ path: string; content: string; language: string }>): Promise<Array<{ path: string; success: boolean; error?: string; message?: string }>> => {
    try {
      const results: Array<{ path: string; success: boolean; error?: string; message?: string }> = [];
      
      for (const file of filesToUpdate) {
        try {
          const response = await fetch('/api/files/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filePath: file.path, content: file.content }),
          });

          const result = await response.json();
          
          // Update the file in the filesystem context if successful
          if (result.success) {
            updateFileByPath(file.path, file.content);
          }
          
          results.push({
            path: file.path,
            success: result.success || false,
            error: result.error,
            message: result.message
          });
        } catch (error) {
          results.push({
            path: file.path,
            success: false,
            error: 'Failed to update file'
          });
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error updating files:', error);
      return filesToUpdate.map(file => ({
        path: file.path,
        success: false,
        error: 'Failed to update file'
      }));
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 border-l border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 60 120" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="helixGradientAI1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#ffffff', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: '#f8fafc', stopOpacity: 1}} />
                </linearGradient>
                <linearGradient id="helixGradientAI2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#e2e8f0', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: '#ffffff', stopOpacity: 1}} />
                </linearGradient>
              </defs>
              <path d="M15 10 Q5 30 15 50 Q25 70 15 90 Q5 110 15 120" 
                    stroke="url(#helixGradientAI1)" 
                    strokeWidth="3" 
                    fill="none" 
                    strokeLinecap="round"/>
              <path d="M45 10 Q55 30 45 50 Q35 70 45 90 Q55 110 45 120" 
                    stroke="url(#helixGradientAI2)" 
                    strokeWidth="3" 
                    fill="none" 
                    strokeLinecap="round"/>
              <line x1="15" y1="20" x2="45" y2="20" stroke="#ffffff" strokeWidth="1.5" opacity="0.8"/>
              <line x1="18" y1="30" x2="42" y2="30" stroke="#f8fafc" strokeWidth="1.5" opacity="0.8"/>
              <line x1="15" y1="40" x2="45" y2="40" stroke="#ffffff" strokeWidth="1.5" opacity="0.8"/>
              <line x1="12" y1="50" x2="48" y2="50" stroke="#e2e8f0" strokeWidth="1.5" opacity="0.8"/>
              <line x1="15" y1="60" x2="45" y2="60" stroke="#ffffff" strokeWidth="1.5" opacity="0.8"/>
              <line x1="18" y1="70" x2="42" y2="70" stroke="#f8fafc" strokeWidth="1.5" opacity="0.8"/>
              <line x1="15" y1="80" x2="45" y2="80" stroke="#ffffff" strokeWidth="1.5" opacity="0.8"/>
              <line x1="12" y1="90" x2="48" y2="90" stroke="#e2e8f0" strokeWidth="1.5" opacity="0.8"/>
              <line x1="15" y1="100" x2="45" y2="100" stroke="#ffffff" strokeWidth="1.5" opacity="0.8"/>
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-gray-100 tracking-tight">Helix AI</h3>
            <p className="text-xs text-gray-400 font-medium">{selectedModelInfo?.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-200 hover:bg-gray-800">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Model Selector */}
      <div className="px-4 py-3 border-b border-gray-800 bg-gray-900/40 space-y-3">
        {/* Chat Mode Selector */}
        <div className="relative">
          <Button 
            variant="ghost" 
            onClick={() => setShowModeSelector(!showModeSelector)}
            className="w-full justify-between h-9 px-3 text-xs bg-gray-800/70 hover:bg-gray-800 text-gray-300 border border-gray-700 rounded-lg font-medium transition-all duration-200 hover:border-blue-500"
          >
            <span className="flex items-center gap-2">
              <span>{selectedModeInfo?.icon}</span>
              <span className="truncate">{selectedModeInfo?.name}</span>
            </span>
            <ChevronDown className={`w-3 h-3 ml-2 flex-shrink-0 transition-transform duration-200 ${showModeSelector ? 'rotate-180' : ''}`} />
          </Button>
          {showModeSelector && (
            <div className="absolute top-11 left-0 right-0 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 animate-in slide-in-from-top-2 duration-200">
              {CHAT_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => {
                    setChatMode(mode.id);
                    setShowModeSelector(false);
                  }}
                  className={`w-full text-left px-3 py-3 hover:bg-gray-800 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    chatMode === mode.id ? 'bg-gray-800 border-l-2 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{mode.icon}</span>
                    <div>
                      <div className="text-xs font-medium text-gray-200">{mode.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{mode.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Model Selector */}
        <div className="relative">
          <Button 
            variant="ghost" 
            onClick={() => setShowModelSelector(!showModelSelector)}
            className="w-full justify-between h-9 px-3 text-xs bg-gray-800/70 hover:bg-gray-800 text-gray-300 border border-gray-700 rounded-lg font-medium transition-all duration-200 hover:border-blue-500"
          >
            <span className="truncate">{selectedModelInfo?.name}</span>
            <ChevronDown className={`w-3 h-3 ml-2 flex-shrink-0 transition-transform duration-200 ${showModelSelector ? 'rotate-180' : ''}`} />
          </Button>
          {showModelSelector && (
            <div className="absolute top-11 left-0 right-0 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
              {AVAILABLE_MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setSelectedModel(model.id);
                    setShowModelSelector(false);
                  }}
                  className={`w-full text-left px-3 py-3 hover:bg-gray-800 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    selectedModel === model.id ? 'bg-gray-800 border-l-2 border-blue-500' : ''
                  }`}
                >
                  <div className="text-xs font-medium text-gray-200 flex items-center gap-2">
                    {model.id === 'auto' && <Sparkles className="w-3 h-3 text-blue-400" />}
                    {model.name}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{model.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto scroll-smooth chat-scroll" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <div className="p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12 animate-fade-in">
              <div className="p-3 bg-gray-800/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center hover-glow transition-all duration-300">
                <Bot className="w-8 h-8 text-blue-400" />
              </div>
              <h4 className="font-medium text-gray-200 mb-2">AI Assistant Ready</h4>
              <p className="text-sm text-gray-400 mb-1">Ask me anything about your code!</p>
              <p className="text-xs text-gray-500">I can help with debugging, code review, refactoring, and more.</p>
            </div>
          )}
          
          {messages.map((message) => (
            <div key={message.id} className={`flex items-start space-x-3 animate-fade-in ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`p-2 rounded-full flex-shrink-0 ${
                message.role === 'user' 
                  ? 'bg-blue-600' 
                  : 'bg-gray-700'
              }`}>
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-gray-300" />
                )}
              </div>
              <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                <div className={`p-3 rounded-xl relative group ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white ml-auto'
                    : 'bg-gray-800 text-gray-100'
                }`}>
                  <div className="text-sm whitespace-pre-wrap break-words">{message.content}</div>
                  
                  {/* Copy button for AI messages */}
                  {message.role === 'assistant' && (
                    <Button
                      onClick={() => copyToClipboard(message.content)}
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-200"
                      title="Copy message"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  )}
                  
                  {/* Show file update results if any */}
                  {message.fileUpdateResults && message.fileUpdateResults.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-gray-400 font-medium">Files Updated:</div>
                      {message.fileUpdateResults.map((updateResult, index) => (
                        <div key={index} className={`flex items-center space-x-2 text-xs p-2 rounded ${
                          updateResult.success ? 'bg-blue-900/30 text-blue-300' : 'bg-red-900/30 text-red-300'
                        }`}>
                          {updateResult.success ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          <FileText className="w-3 h-3" />
                          <span className="font-mono">{updateResult.path}</span>
                          {!updateResult.success && updateResult.error && (
                            <span className="text-red-400">- {updateResult.error}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Show file read results if any */}
                  {message.fileReadResults && message.fileReadResults.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-gray-400 font-medium">Files Read:</div>
                      {message.fileReadResults.map((readResult, index) => (
                        <div key={index} className={`text-xs p-2 rounded border ${
                          readResult.success ? 'bg-green-900/20 border-green-700' : 'bg-red-900/20 border-red-700'
                        }`}>
                          <div className="flex items-center space-x-2 mb-1">
                            <FileText className="w-3 h-3" />
                            <span className="font-mono">{readResult.path}</span>
                            {!readResult.success && (
                              <span className="text-red-400">- {readResult.error}</span>
                            )}
                          </div>
                          {readResult.success && readResult.content && (
                            <pre className="text-gray-300 whitespace-pre-wrap font-mono text-xs bg-gray-900/50 p-2 rounded mt-1 max-h-32 overflow-y-auto">
                              {readResult.content.substring(0, 500)}{readResult.content.length > 500 ? '...' : ''}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Show terminal results if any */}
                  {message.terminalResults && message.terminalResults.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-gray-400 font-medium">Terminal Commands:</div>
                      {message.terminalResults.map((termResult, index) => (
                        <div key={index} className={`text-xs p-2 rounded border ${termResult.success ? 'bg-green-900/20 border-green-700' : 'bg-red-900/20 border-red-700'}`}>
                          <div className="flex items-center space-x-2 mb-1">
                            <Terminal className="w-3 h-3" />
                            <span className="font-mono text-blue-300">$ {termResult.command}</span>
                          </div>
                          <pre className="text-gray-300 whitespace-pre-wrap font-mono text-xs bg-gray-900/50 p-2 rounded">
                            {termResult.output}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Show file operations if any */}
                  {message.fileOperations && message.fileOperations.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-gray-400 font-medium">Files Created:</div>
                      {message.fileOperations.map((fileOp, index) => (
                        <div key={index} className={`flex items-center space-x-2 text-xs p-2 rounded ${
                          fileOp.success ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'
                        }`}>
                          {fileOp.success ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          <FileText className="w-3 h-3" />
                          <span className="font-mono">{fileOp.path}</span>
                          {!fileOp.success && fileOp.error && (
                            <span className="text-red-400">- {fileOp.error}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Show file deletion results if any */}
                  {message.fileDeletionResults && message.fileDeletionResults.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-gray-400 font-medium">Files Deleted:</div>
                      {message.fileDeletionResults.map((deleteResult, index) => (
                        <div key={index} className={`flex items-center space-x-2 text-xs p-2 rounded ${
                          deleteResult.success ? 'bg-red-900/30 text-red-300' : 'bg-red-900/30 text-red-300'
                        }`}>
                          {deleteResult.success ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          <FileText className="w-3 h-3" />
                          <span className="font-mono">{deleteResult.path}</span>
                          {!deleteResult.success && deleteResult.error && (
                            <span className="text-red-400">- {deleteResult.error}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Show folder creation results if any */}
                  {message.folderCreationResults && message.folderCreationResults.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-gray-400 font-medium">Folders Created:</div>
                      {message.folderCreationResults.map((folderResult, index) => (
                        <div key={index} className={`flex items-center space-x-2 text-xs p-2 rounded ${
                          folderResult.success ? 'bg-blue-900/30 text-blue-300' : 'bg-red-900/30 text-red-300'
                        }`}>
                          {folderResult.success ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          <FolderOpen className="w-3 h-3" />
                          <span className="font-mono">{folderResult.path}</span>
                          {!folderResult.success && folderResult.error && (
                            <span className="text-red-400">- {folderResult.error}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Code Review Section */}
                  {message.pendingChanges && (
                    <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Eye className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm font-medium text-yellow-200">Review Changes</span>
                        </div>
                      </div>
                      <p className="text-xs text-yellow-300 mb-3">
                        The AI wants to create/modify files. Please review and approve or decline these changes.
                      </p>
                      
                      {/* Show files to be created */}
                      {message.filesToCreate && message.filesToCreate.length > 0 && (
                        <div className="mb-3">
                          <div className="text-xs text-yellow-400 font-medium mb-1">Files to Create:</div>
                          {message.filesToCreate.map((file, index) => (
                            <div key={index} className="text-xs text-yellow-200 font-mono bg-yellow-900/10 px-2 py-1 rounded mb-1">
                              📄 {file.path}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Show files to be updated */}
                      {message.filesToUpdate && message.filesToUpdate.length > 0 && (
                        <div className="mb-3">
                          <div className="text-xs text-yellow-400 font-medium mb-1">Files to Update:</div>
                          {message.filesToUpdate.map((file, index) => (
                            <div key={index} className="text-xs text-yellow-200 font-mono bg-yellow-900/10 px-2 py-1 rounded mb-1">
                              ✏️ {file.path}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        <Button 
                          onClick={async () => {
                            // Approve changes
                            try {
                              let fileResults: any[] = [];
                              let updateResults: any[] = [];
                              
                              // Create files if any
                              if (message.filesToCreate && message.filesToCreate.length > 0) {
                                fileResults = await createFiles(message.filesToCreate);
                              }
                              
                              // Update files if any
                              if (message.filesToUpdate && message.filesToUpdate.length > 0) {
                                updateResults = await updateFiles(message.filesToUpdate);
                              }
                              
                              // Update the message to show changes were approved
                              setMessages(prev => prev.map(msg => 
                                msg.id === message.id
                                  ? { 
                                      ...msg, 
                                      pendingChanges: false, 
                                      changesApproved: true,
                                      fileOperations: fileResults,
                                      fileUpdateResults: updateResults
                                    }
                                  : msg
                              ));
                            } catch (error) {
                              console.error('Error applying changes:', error);
                            }
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Approve & Apply
                        </Button>
                        <Button 
                          onClick={() => {
                            // Decline changes
                            setMessages(prev => prev.map(msg => 
                              msg.id === message.id
                                ? { ...msg, pendingChanges: false, changesApproved: false }
                                : msg
                            ));
                          }}
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs px-3 py-1"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Show approval/decline status */}
                  {!message.pendingChanges && message.changesApproved !== undefined && (
                    <div className={`mt-3 p-2 rounded text-xs ${
                      message.changesApproved 
                        ? 'bg-green-900/20 text-green-300 border border-green-700'
                        : 'bg-red-900/20 text-red-300 border border-red-700'
                    }`}>
                      {message.changesApproved ? '✅ Changes approved and applied' : '❌ Changes declined'}
                    </div>
                  )}
                  
                  {/* Show user questions if any */}
                  {message.userQuestions && message.userQuestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-gray-400 font-medium">Questions for you:</div>
                      {message.userQuestions.map((question, index) => (
                        <div key={index} className="bg-yellow-900/20 border border-yellow-700 rounded p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                            <span className="text-xs text-yellow-400 font-medium">Question</span>
                          </div>
                          <p className="text-sm text-yellow-200">{question}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Show preview requests if any */}
                  {message.previewRequests && message.previewRequests.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-gray-400 font-medium">Preview:</div>
                      {message.previewRequests.map((preview, index) => (
                        <div key={index} className="bg-blue-900/20 border border-blue-700 rounded p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <span className="text-xs text-blue-400 font-medium">Preview Available</span>
                          </div>
                          <p className="text-sm text-blue-200">Open {preview} to see your Next.js app</p>
                          <Button 
                            onClick={() => window.open(`http://${preview}`, '_blank')}
                            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1"
                          >
                            Open Preview
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Show code blocks */}
                  {message.codeBlocks && message.codeBlocks.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.codeBlocks.map((block, index) => (
                        <div key={index} className="bg-gray-900 rounded border border-gray-700">
                          <div className="px-3 py-1 bg-gray-800 text-xs text-gray-400 border-b border-gray-700">
                            {block.language || 'code'}
                          </div>
                          <pre className="p-3 text-xs overflow-x-auto">
                            <code>{block.code}</code>
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className={`text-xs text-gray-500 mt-1 ${
                  message.role === 'user' ? 'text-right' : ''
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start space-x-3 animate-scale-in">
              <div className="p-2 rounded-full flex-shrink-0 bg-gray-700">
                <Bot className="w-4 h-4 text-gray-300" />
              </div>
              <div className="flex-1">
                <div className="p-3 rounded-xl bg-gray-800">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-400">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div 
        className={`border-t border-gray-800 p-4 bg-gray-900/50 transition-colors ${
          draggedFile ? 'bg-blue-500/20 border-blue-500' : ''
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        {draggedFile && (
          <div className="mb-2 p-2 bg-blue-500/20 border border-blue-500 rounded-lg text-blue-300 text-sm">
            Drop file here to add it to your message
          </div>
        )}
        <div className="flex space-x-3">
          <div className="flex-1">
            <Input
              placeholder="Ask me anything about your code or drop a file here..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={isLoading}
              className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>
          <Button 
            onClick={sendMessage} 
            disabled={isLoading || !inputMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Press Enter to send • Shift+Enter for new line • Drag files from explorer to include them
        </div>
      </div>
    </div>
  );
}

