'use client';

import { useState, useEffect } from 'react';
import { useFileSystem } from '@/contexts/FileSystemContext';
import { Button } from '@/components/ui/Button';
import { RefreshCw, ExternalLink } from 'lucide-react';

export function PreviewPane() {
  const { files } = useFileSystem();
  const [previewContent, setPreviewContent] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    generatePreview();
  }, [files]);

  const generatePreview = () => {
    try {
      const htmlFile = files.find(f => f.name.endsWith('.html'));
      const cssFiles = files.filter(f => f.name.endsWith('.css'));
      const jsFiles = files.filter(f => f.name.endsWith('.js'));

      if (!htmlFile) {
        setPreviewContent('<div style="padding: 20px; text-align: center; color: #666;">No HTML file found. Create an index.html file to see the preview.</div>');
        return;
      }

      let html = htmlFile.content;
      
      // Inject CSS
      const cssContent = cssFiles.map(f => f.content).join('\n');
      if (cssContent) {
        html = html.replace('</head>', `<style>\n${cssContent}\n</style>\n</head>`);
      }

      // Inject JS
      const jsContent = jsFiles.map(f => f.content).join('\n');
      if (jsContent) {
        html = html.replace('</body>', `<script>\n${jsContent}\n</script>\n</body>`);
      }

      setPreviewContent(html);
      setError('');
    } catch (err) {
      setError('Error generating preview: ' + (err as Error).message);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="h-12 border-b border-border flex items-center px-4">
        <h3 className="font-semibold text-sm">Preview</h3>
        <div className="ml-auto flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={generatePreview}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 bg-white">
        {error ? (
          <div className="p-4 text-red-500 text-sm">{error}</div>
        ) : (
          <iframe
            srcDoc={previewContent}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
            title="Preview"
          />
        )}
      </div>
    </div>
  );
}