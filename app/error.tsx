'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console
    console.error('Application error:', error);
    
    // If it's a chunk loading error, try to reload the page
    if (error.message && error.message.includes('Loading chunk')) {
      console.log('Chunk loading error detected, reloading page...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong!</h2>
        <p className="text-gray-600 mb-6">
          We encountered an error while loading the application. This might be due to a recent update.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600 transition-colors"
          >
            Reload Page
          </button>
          <button
            onClick={() => reset()}
            className="w-full bg-gray-200 text-gray-800 rounded px-4 py-2 hover:bg-gray-300 transition-colors"
          >
            Try Again
          </button>
        </div>
        {error.digest && (
          <p className="text-xs text-gray-400 mt-4">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}