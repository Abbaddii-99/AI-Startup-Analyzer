'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html>
      <body>
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
          <div className="text-center space-y-6">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">Something went wrong</h1>
              <p className="text-gray-400 text-sm mt-1">An unexpected error occurred.</p>
            </div>
            <button
              onClick={reset}
              className="flex items-center gap-2 mx-auto bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition font-medium"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
