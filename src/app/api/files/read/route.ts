import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { projectId, filePath } = await request.json();

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    if (!filePath || typeof filePath !== 'string') {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    const filesRef = collection(db, 'files');
    const q = query(filesRef, where('projectId', '==', projectId), where('path', '==', filePath));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const fileDoc = querySnapshot.docs[0];
    const fileData = fileDoc.data();

    if (fileData.type !== 'file') {
      return NextResponse.json({ error: 'Path does not refer to a file' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      content: fileData.content,
      path: filePath,
    });
  } catch (error) {
    console.error('File read error:', error);
    return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
  }
}