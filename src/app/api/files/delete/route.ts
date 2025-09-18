import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, deleteDoc, writeBatch } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { projectId, filePath } = await request.json();

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    if (!filePath) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 });
    }

    const filesRef = collection(db, 'files');
    const q = query(filesRef, where('projectId', '==', projectId), where('path', '==', filePath));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ error: 'File or directory not found' }, { status: 404 });
    }

    const docToDelete = querySnapshot.docs[0];
    const data = docToDelete.data();

    const batch = writeBatch(db);

    if (data.type === 'directory') {
      // If it's a directory, delete all nested files and subdirectories
      const folderPath = filePath.endsWith('/') ? filePath : `${filePath}/`;
      const allItemsInDirQuery = query(filesRef, where('projectId', '==', projectId), where('path', '>=', folderPath));
      const allItemsSnapshot = await getDocs(allItemsInDirQuery);

      allItemsSnapshot.forEach(doc => {
        if (doc.data().path.startsWith(folderPath)) {
          batch.delete(doc.ref);
        }
      });
    }

    batch.delete(docToDelete.ref);
    await batch.commit();

    return NextResponse.json({
      success: true,
      message: 'File or directory deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete file or directory',
      },
      { status: 500 }
    );
  }
}