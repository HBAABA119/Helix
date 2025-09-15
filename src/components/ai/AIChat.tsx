'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Settings, Download, ChevronDown, Bot, User, Sparkles, FileText, CheckCircle, AlertCircle, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useFileSystem } from '@/contexts/FileSystemContext';

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
  fileReadResults?: Array<{ path: string; content: string; success: boolean; error?: string }>;
  terminalResults?: Array<{ command: string; output: string; success: boolean }>;
}

// Available AI models
const AVAILABLE_MODELS = [
  { id: 'nvidia/llama-3.1-nemotron-nano-4b-v1.1', name: 'Llama 3.1 Nemotron Nano 4B', description: 'Fast & efficient' },
  { id: 'meta/llama-3.1-405b-instruct', name: 'Llama 3.1 405B', description: 'Most capable' },
  { id: 'meta/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', description: 'Balanced performance' },
  { id: 'meta/llama-3.1-8b-instruct', name: 'Llama 3.1 8B', description: 'Quick responses' },
  { id: 'mistralai/mixtral-8x7b-instruct-v0.1', name: 'Mixtral 8x7B', description: 'Code specialist' },
  { id: 'nvidia/nemotron-4-340b-instruct', name: 'Nemotron 4 340B', description: 'Advanced reasoning' }
];

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { files, addFileFromPath, updateFileByPath, getAllFiles } = useFileSystem();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          model: selectedModel,
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
        terminalResults: data.terminalResults || []
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Auto-create files if the AI generated any
      if (data.filesToCreate && data.filesToCreate.length > 0) {
        const fileResults = await createFiles(data.filesToCreate);
        
        // Update the message with file operation results
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, fileOperations: fileResults }
            : msg
        ));
      }

      // Auto-update files if the AI modified any
      if (data.filesToUpdate && data.filesToUpdate.length > 0) {
        const updateResults = await updateFiles(data.filesToUpdate);
        
        // Update the message with file update results
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, fileUpdateResults: updateResults }
            : msg
        ));
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

  const updateFiles = async (filesToUpdate: Array<{ path: string; content: string; language: string }>) => {
    try {
      const results = [];
      
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
          <div className="p-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Sparkles className="w-4 h-4 text-white" />
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
      <div className="px-4 py-3 border-b border-gray-800 bg-gray-900/40">
        <div className="relative">
          <Button 
            variant="ghost" 
            onClick={() => setShowModelSelector(!showModelSelector)}
            className="w-full justify-between h-9 px-3 text-xs bg-gray-800/70 hover:bg-gray-800 text-gray-300 border border-gray-700 rounded-lg font-medium"
          >
            <span className="truncate">{selectedModelInfo?.name}</span>
            <ChevronDown className="w-3 h-3 ml-2 flex-shrink-0" />
          </Button>
          {showModelSelector && (
            <div className="absolute top-11 left-0 right-0 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
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
                  <div className="text-xs font-medium text-gray-200">{model.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{model.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto scroll-smooth" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <div className="p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="p-3 bg-gray-800/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Bot className="w-8 h-8 text-blue-400" />
              </div>
              <h4 className="font-medium text-gray-200 mb-2">AI Assistant Ready</h4>
              <p className="text-sm text-gray-400 mb-1">Ask me anything about your code!</p>
              <p className="text-xs text-gray-500">I can help with debugging, code review, refactoring, and more.</p>
            </div>
          )}
          
          {messages.map((message) => (
            <div key={message.id} className={`flex items-start space-x-3 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
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
                <div className={`p-3 rounded-xl ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white ml-auto'
                    : 'bg-gray-800 text-gray-100'
                }`}>
                  <div className="text-sm whitespace-pre-wrap break-words">{message.content}</div>
                  
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
            <div className="flex items-start space-x-3">
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
      <div className="border-t border-gray-800 p-4 bg-gray-900/50">
        <div className="flex space-x-3">
          <div className="flex-1">
            <Input
              placeholder="Ask me anything about your code..."
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
          Press Enter to send • Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}