'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useFileSystem } from '@/contexts/FileSystemContext';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export function CodeEditor() {
  const { activeFile, updateFile } = useFileSystem();
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    monaco.editor.defineTheme('helix-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#0a0a0a',
        'editor.foreground': '#ffffff',
        'editorLineNumber.foreground': '#6b7280',
        'editorIndentGuide.background': '#374151',
        'editorIndentGuide.activeBackground': '#6b7280',
      },
    });
    
    monaco.editor.setTheme('helix-dark');
  };

  const handleEditorChange = (value: string | undefined) => {
    if (activeFile && value !== undefined) {
      updateFile(activeFile.id, value);
    }
  };

  const getLanguage = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js': return 'javascript';
      case 'jsx': return 'javascript';
      case 'ts': return 'typescript';
      case 'tsx': return 'typescript';
      case 'html': return 'html';
      case 'css': return 'css';
      case 'json': return 'json';
      case 'md': return 'markdown';
      default: return 'plaintext';
    }
  };

  if (!activeFile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-muted-foreground">No file selected</h3>
          <p className="text-sm text-muted-foreground">Select a file from the explorer to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background">
      <div className="border-b border-border px-4 py-2">
        <span className="text-sm font-medium">{activeFile.name}</span>
      </div>
      <Editor
        height="calc(100vh - 120px)"
        language={getLanguage(activeFile.name)}
        value={activeFile.content}
        onMount={handleEditorDidMount}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace',
          lineNumbers: 'on',
          wordWrap: 'on',
          tabSize: 2,
          insertSpaces: true,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          theme: 'helix-dark',
        }}
      />
    </div>
  );
}