'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto" />
        <div>
          <h1 className="text-xl font-bold text-gray-800">Something went wrong</h1>
          <p className="text-gray-400 text-sm mt-1">{error.message || 'An unexpected error occurred.'}</p>
        </div>
        <div className="flex items-center gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-2 bg-blue-500 text-white px-5 py-2.5 rounded-xl hover:bg-blue-600 transition font-medium text-sm"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 border border-gray-200 bg-white text-gray-700 px-5 py-2.5 rounded-xl hover:bg-gray-50 transition font-medium text-sm"
          >
            <Home className="w-4 h-4" /> Go Home
          </button>
        </div>
      </div>
    </main>
  )
}
