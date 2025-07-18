'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Critical Error</h2>
            <p className="text-gray-600 mb-6">
              The application encountered a critical error. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-red-500 text-white rounded px-4 py-2 hover:bg-red-600"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}