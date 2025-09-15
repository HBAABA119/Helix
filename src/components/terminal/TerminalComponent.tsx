'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface TerminalLine {
  id: string;
  type: 'command' | 'output' | 'error';
  content: string;
  timestamp: Date;
}

export function TerminalComponent() {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: '1',
      type: 'output',
      content: 'Helix IDE Terminal - Ready',
      timestamp: new Date()
    }
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  const executeCommand = async () => {
    if (!currentCommand.trim() || isRunning) return;

    const commandLine: TerminalLine = {
      id: Date.now().toString(),
      type: 'command',
      content: `$ ${currentCommand}`,
      timestamp: new Date()
    };

    setLines(prev => [...prev, commandLine]);
    setIsRunning(true);

    try {
      const response = await fetch('/api/terminal/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command: currentCommand }),
      });

      const data = await response.json();

      const outputLine: TerminalLine = {
        id: (Date.now() + 1).toString(),
        type: data.success ? 'output' : 'error',
        content: data.output || data.error || 'Command completed',
        timestamp: new Date()
      };

      setLines(prev => [...prev, outputLine]);
    } catch (error) {
      const errorLine: TerminalLine = {
        id: (Date.now() + 1).toString(),
        type: 'error',
        content: 'Failed to execute command',
        timestamp: new Date()
      };
      setLines(prev => [...prev, errorLine]);
    }

    setCurrentCommand('');
    setIsRunning(false);
    inputRef.current?.focus();
  };

  const clearTerminal = () => {
    setLines([{
      id: Date.now().toString(),
      type: 'output',
      content: 'Terminal cleared',
      timestamp: new Date()
    }]);
  };

  return (
    <div className="h-full flex flex-col bg-black text-green-400 font-mono">
      {/* Terminal Header */}
      <div className="h-8 bg-gray-800 flex items-center justify-between px-3 border-b border-gray-700">
        <span className="text-xs text-gray-300">Terminal</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearTerminal}
          className="h-6 w-6 text-gray-400 hover:text-white"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-2 text-sm"
      >
        {lines.map((line) => (
          <div key={line.id} className={`mb-1 ${
            line.type === 'error' ? 'text-red-400' : 
            line.type === 'command' ? 'text-blue-400' : 'text-green-400'
          }`}>
            {line.content}
          </div>
        ))}
        
        {isRunning && (
          <div className="text-yellow-400 animate-pulse">
            Running command...
          </div>
        )}
      </div>

      {/* Terminal Input */}
      <div className="p-2 border-t border-gray-700 flex items-center space-x-2">
        <span className="text-blue-400">$</span>
        <Input
          ref={inputRef}
          value={currentCommand}
          onChange={(e) => setCurrentCommand(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              executeCommand();
            }
          }}
          disabled={isRunning}
          placeholder="Enter command..."
          className="flex-1 bg-transparent border-none text-green-400 focus:ring-0 font-mono text-sm"
        />
        <Button
          onClick={executeCommand}
          disabled={isRunning || !currentCommand.trim()}
          size="sm"
          className="bg-gray-700 hover:bg-gray-600 text-white"
        >
          <Send className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}