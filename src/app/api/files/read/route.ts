import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const { filePath } = await request.json();

    if (!filePath || typeof filePath !== 'string') {
      return NextResponse.json(
        { error: 'Invalid file path' },
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

    // Check if file exists
    if (!existsSync(fullPath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    try {
      const content = await readFile(fullPath, 'utf8');

      return NextResponse.json({
        success: true,
        content,
        path: filePath
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to read file' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('File read error:', error);
    return NextResponse.json(
      { error: 'Failed to read file' },
      { status: 500 }
    );
  }
}