import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const { filePath, content } = await request.json();
    
    if (!filePath || typeof filePath !== 'string' || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Invalid file path or content' },
        { status: 400 }
      );
    }

    const projectRoot = process.cwd();
    const fullPath = join(projectRoot, filePath);
    
    // Security check - ensure path is within project directory
    if (!fullPath.startsWith(projectRoot)) {
      return NextResponse.json(
        { error: 'Invalid file path - outside project directory' },
        { status: 403 }
      );
    }

    try {
      await writeFile(fullPath, content, 'utf8');
      
      return NextResponse.json({
        success: true,
        message: 'File updated successfully',
        path: filePath
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to update file' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('File update error:', error);
    return NextResponse.json(
      { error: 'Failed to update file' },
      { status: 500 }
    );
  }
}