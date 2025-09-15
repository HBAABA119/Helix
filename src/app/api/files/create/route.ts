import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const { files } = await request.json();
    
    if (!files || !Array.isArray(files)) {
      return NextResponse.json(
        { error: 'Invalid files data' },
        { status: 400 }
      );
    }

    const results = [];
    const projectRoot = process.cwd();

    for (const file of files) {
      try {
        const { path, content } = file;
        if (!path || typeof content !== 'string') {
          results.push({
            path,
            success: false,
            error: 'Invalid file data'
          });
          continue;
        }

        // Ensure the path is within the project directory for security
        const fullPath = join(projectRoot, path);
        if (!fullPath.startsWith(projectRoot)) {
          results.push({
            path,
            success: false,
            error: 'Invalid file path - outside project directory'
          });
          continue;
        }

        // Create directory if it doesn't exist
        const dir = dirname(fullPath);
        if (!existsSync(dir)) {
          await mkdir(dir, { recursive: true });
        }

        // Write the file
        await writeFile(fullPath, content, 'utf8');
        
        results.push({
          path,
          success: true,
          message: `File created successfully`
        });
      } catch (error) {
        results.push({
          path: file.path,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('File creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create files' },
      { status: 500 }
    );
  }
}