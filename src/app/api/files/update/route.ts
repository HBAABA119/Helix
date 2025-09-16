import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const { filePath, content } = await request.json();
    
    if (!filePath || content === undefined) {
      return NextResponse.json(
        { error: 'File path and content are required' },
        { status: 400 }
      );
    }
    
    const fullPath = join(process.cwd(), filePath);
    
    // Write file content
    await writeFile(fullPath, content, 'utf8');
    
    return NextResponse.json({
      success: true,
      message: 'File updated successfully'
    });
  } catch (error) {
    console.error('Error updating file:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update file'
      },
      { status: 500 }
    );
  }
}