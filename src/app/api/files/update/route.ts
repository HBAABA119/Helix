import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { projectId, filePath, content } = await request.json();

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    if (!filePath || content === undefined) {
      return NextResponse.json({ error: 'File path and content are required' }, { status: 400 });
    }

    const filesRef = collection(db, 'files');
    const q = query(filesRef, where('projectId', '==', projectId), where('path', '==', filePath));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const fileDoc = querySnapshot.docs[0];
    await updateDoc(fileDoc.ref, {
      content,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'File updated successfully',
    });
  } catch (error) {
    console.error('Error updating file:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update file',
      },
      { status: 500 }
    );
  }
}