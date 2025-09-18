import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const directory = searchParams.get('dir') || '/';

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const filesRef = collection(db, 'files');
    const q = query(filesRef, where('projectId', '==', projectId));
    const querySnapshot = await getDocs(q);

    const allFiles = querySnapshot.docs.map(doc => doc.data());

    const buildTree = (path) => {
      const children = allFiles
        .filter(file => {
          const relativePath = file.path.substring(path.length);
          return file.path.startsWith(path) && file.path !== path && !relativePath.substring(1).includes('/');
        })
        .map(file => {
          const node = {
            name: file.name,
            type: file.type,
            path: file.path,
          };
          if (file.type === 'directory') {
            node.children = buildTree(file.path);
          }
          return node;
        });
      return children;
    };

    const rootPath = directory === '.' ? '/' : directory;
    const files = buildTree(rootPath);

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error scanning directory:', error);
    return NextResponse.json(
      { error: 'Failed to scan directory' },
      { status: 500 }
    );
  }
}