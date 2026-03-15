'use client'

import { useRouter } from 'next/navigation'
import { Sparkles, Home } from 'lucide-react'

export default function NotFound() {
  const router = useRouter()
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-blue-500 p-4 rounded-2xl shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-6xl font-bold text-gray-200">404</h1>
          <p className="text-xl font-semibold text-gray-700 mt-2">Page not found</p>
          <p className="text-gray-400 text-sm mt-1">The page you're looking for doesn't exist.</p>
        </div>
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 mx-auto bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition font-medium"
        >
          <Home className="w-4 h-4" /> Go Home
        </button>
      </div>
    </main>
  )
}
