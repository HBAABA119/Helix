import { NextRequest, NextResponse } from 'next/server';
import { createReadStream, readdirSync, statSync } from 'fs';
import { join } from 'path';
import archiver from 'archiver';

export async function POST(request: NextRequest) {
  try {
    const { projectName = 'helix-project' } = await request.json();
    
    // Set up the response as a zip file
    const headers = new Headers();
    headers.set('Content-Type', 'application/zip');
    headers.set('Content-Disposition', `attachment; filename="${projectName}.zip"`);
    
    // Create a readable stream for the zip
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    
    // Create archive
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });
    
    // Handle archive errors
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      writer.close();
    });
    
    // Pipe archive data to the writable stream
    archive.on('data', (chunk) => {
      writer.write(chunk);
    });
    
    archive.on('end', () => {
      writer.close();
    });
    
    // Get project root directory (current working directory)
    const projectRoot = process.cwd();
    
    // Define files and directories to include
    const filesToInclude = [
      'src',
      'public',
      'package.json',
      'next.config.js',
      'tailwind.config.js',
      'tsconfig.json',
      'README.md',
      '.env.example'
    ];
    
    // Add files to archive
    for (const fileOrDir of filesToInclude) {
      const fullPath = join(projectRoot, fileOrDir);
      
      try {
        const stats = statSync(fullPath);
        
        if (stats.isDirectory()) {
          // Add directory recursively
          archive.directory(fullPath, fileOrDir);
        } else if (stats.isFile()) {
          // Add single file
          archive.file(fullPath, { name: fileOrDir });
        }
      } catch (error) {
        // File doesn't exist, skip it
        console.log(`Skipping ${fileOrDir} - not found`);
      }
    }
    
    // Finalize the archive
    archive.finalize();
    
    return new NextResponse(readable, { headers });
    
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to create download' },
      { status: 500 }
    );
  }
}