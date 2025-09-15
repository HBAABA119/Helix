'use client';

import { useState, useEffect } from 'react';
import { useFileSystem } from '@/contexts/FileSystemContext';
import { Button } from '@/components/ui/Button';
import { RefreshCw, ExternalLink } from 'lucide-react';

export function PreviewPane() {
  const { files } = useFileSystem();
  const [previewContent, setPreviewContent] = useState('');
  const [error, setError] = useState('');
  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    generatePreview();
  }, [files]);

  const generatePreview = () => {
    try {
      const htmlFile = files.find(f => f.name.endsWith('.html'));
      const cssFiles = files.filter(f => f.name.endsWith('.css'));
      const jsFiles = files.filter(f => f.name.endsWith('.js'));

      if (!htmlFile) {
        setPreviewContent('');
        setHasContent(false);
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
      setHasContent(true);
      setError('');
    } catch (err) {
      setError('Error generating preview: ' + (err as Error).message);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950">
      <div className="flex-1 bg-gray-900">
        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-red-400 text-sm">{error}</div>
          </div>
        ) : hasContent ? (
          <iframe
            srcDoc={previewContent}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
            title="Preview"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="mb-6">
                <div className="text-6xl font-bold text-gray-600 mb-4">h</div>
              </div>
              <p className="text-gray-400 text-lg">Your preview will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}