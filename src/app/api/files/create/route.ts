import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { projectId, files } = await request.json();

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    if (!files || !Array.isArray(files)) {
      return NextResponse.json({ error: 'Invalid files array' }, { status: 400 });
    }

    const results = [];
    const filesRef = collection(db, 'files');

    for (const file of files) {
      try {
        const { path, content, type = 'file' } = file;

        // Check if file or directory already exists at this path for this project
        const q = query(filesRef, where('projectId', '==', projectId), where('path', '==', path));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          results.push({
            path,
            success: false,
            error: 'File or directory already exists at this path',
          });
          continue;
        }

        const docData = {
          projectId,
          path,
          name: path.split('/').pop(),
          type,
          content: type === 'file' ? content : null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await addDoc(filesRef, docData);

        results.push({
          path,
          success: true,
          message: `${type === 'file' ? 'File' : 'Directory'} created successfully`,
        });
      } catch (error) {
        results.push({
          path: file.path,
          success: false,
          error: `Failed to create ${file.type || 'file'}`,
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