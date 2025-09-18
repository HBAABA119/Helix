import { NextRequest, NextResponse } from 'next/server';
import { unlink, rmdir } from 'fs/promises';
import { join } from 'path';
import { existsSync, statSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const { filePath } = await request.json();

    if (!filePath) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      );
    }

    const fullPath = join(process.cwd(), filePath);

    if (!existsSync(fullPath)) {
      return NextResponse.json(
        {
          success: false,
          error: 'File or directory not found'
        },
        { status: 404 }
      );
    }

    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      // Delete directory
      await rmdir(fullPath, { recursive: true });
      return NextResponse.json({
        success: true,
        message: 'Directory deleted successfully'
      });
    } else {
      // Delete file
      await unlink(fullPath);
      return NextResponse.json({
        success: true,
        message: 'File deleted successfully'
      });
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete file or directory'
      },
      { status: 500 }
    );
  }
}