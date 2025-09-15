import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat, readFile } from 'fs/promises';
import { join } from 'path';

async function scanDirectory(dirPath: string, basePath: string = '', depth: number = 0): Promise<any[]> {
  if (depth > 3) return []; // Limit recursion depth
  
  const files = [];
  
  try {
    const entries = await readdir(dirPath);
    
    for (const entry of entries) {
      // Skip node_modules, .next, .git and other system directories
      if (entry.startsWith('.') || entry === 'node_modules' || entry === 'dist' || entry === 'build') {
        continue;
      }
      
      const fullPath = join(dirPath, entry);
      const relativePath = basePath ? `${basePath}/${entry}` : entry;
      const stats = await stat(fullPath);
      
      if (stats.isDirectory()) {
        files.push({
          id: Math.random().toString(36).substr(2, 9),
          name: entry,
          path: relativePath,
          type: 'folder',
          content: '',
          children: await scanDirectory(fullPath, relativePath, depth + 1)
        });
      } else if (stats.isFile()) {
        // Only include common source files
        const ext = entry.split('.').pop()?.toLowerCase();
        if (['ts', 'tsx', 'js', 'jsx', 'json', 'md', 'css', 'html', 'txt'].includes(ext || '')) {
          try {
            const content = await readFile(fullPath, 'utf8');
            files.push({
              id: Math.random().toString(36).substr(2, 9),
              name: entry,
              path: relativePath,
              type: 'file',
              content: content.length > 10000 ? content.substring(0, 10000) + '...' : content, // Truncate large files
              size: stats.size
            });
          } catch (error) {
            // If we can't read the file, still include it but without content
            files.push({
              id: Math.random().toString(36).substr(2, 9),
              name: entry,
              path: relativePath,
              type: 'file',
              content: '',
              size: stats.size,
              error: 'Could not read file'
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error scanning directory:', error);
  }
  
  return files;
}

export async function GET() {
  try {
    const projectRoot = process.cwd();
    const files = await scanDirectory(projectRoot);
    
    return NextResponse.json({
      success: true,
      files: files
    });
  } catch (error) {
    console.error('Error scanning project files:', error);
    return NextResponse.json(
      { error: 'Failed to scan project files' },
      { status: 500 }
    );
  }
}