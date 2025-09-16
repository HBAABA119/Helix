import { NextRequest, NextResponse } from 'next/server';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const { folderPath } = await request.json();
    
    if (!folderPath) {
      return NextResponse.json(
        { error: 'Folder path is required' },
        { status: 400 }
      );
    }
    
    const fullPath = join(process.cwd(), folderPath);
    
    if (existsSync(fullPath)) {
      return NextResponse.json({
        success: true,
        message: 'Folder already exists'
      });
    }
    
    await mkdir(fullPath, { recursive: true });
    
    return NextResponse.json({
      success: true,
      message: 'Folder created successfully'
    });
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create folder'
      },
      { status: 500 }
    );
  }
}