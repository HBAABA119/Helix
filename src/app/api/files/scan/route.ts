import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const directory = searchParams.get('dir') || '.';
    
    const files = await scanDirectory(directory);
    
    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error scanning directory:', error);
    return NextResponse.json(
      { error: 'Failed to scan directory' },
      { status: 500 }
    );
  }
}

async function scanDirectory(dirPath: string): Promise<any[]> {
  try {
    const items = await readdir(dirPath);
    const files = [];
    
    for (const item of items) {
      if (item.startsWith('.')) continue; // Skip hidden files
      
      const fullPath = join(dirPath, item);
      const stats = await stat(fullPath);
      
      if (stats.isDirectory()) {
        files.push({
          name: item,
          type: 'directory',
          path: fullPath,
          children: await scanDirectory(fullPath)
        });
      } else {
        files.push({
          name: item,
          type: 'file',
          path: fullPath,
          size: stats.size,
          modified: stats.mtime
        });
      }
    }
    
    return files;
  } catch (error) {
    return [];
  }
}