import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const { files } = await request.json();

    if (!files || !Array.isArray(files)) {
      return NextResponse.json(
        { error: 'Invalid files array' },
        { status: 400 }
      );
    }

    const results = [];

    for (const file of files) {
      try {
        const { path, content } = file;
        const fullPath = join(process.cwd(), path);
        const dirPath = dirname(fullPath);

        // Create directory if it doesn't exist
        if (!existsSync(dirPath)) {
          await mkdir(dirPath, { recursive: true });
        }

        // Write file content
        await writeFile(fullPath, content, 'utf8');

        results.push({
          path,
          success: true,
          message: 'File created successfully'
        });
      } catch (error) {
        results.push({
          path: file.path,
          success: false,
          error: 'Failed to create file'
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error creating files:', error);
    return NextResponse.json(
      { error: 'Failed to process file creation request' },
      { status: 500 }
    );
  }
}