'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Something went wrong!</h2>
        <p className="text-gray-400">An error occurred while loading this page.</p>
        <Button
          onClick={reset}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Try again
        </Button>
      </div>
    </div>
  );
}