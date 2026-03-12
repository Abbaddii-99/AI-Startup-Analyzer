'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'

export default function Home() {
  const [idea, setIdea] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!idea.trim()) return

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ idea }),
      })

      const data = await response.json()
      router.push(`/analysis/${data.id}`)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Sparkles className="w-16 h-16 text-blue-500" />
          </div>
          <h1 className="text-4xl font-bold mb-2">AI Startup Analyzer</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Get AI-powered insights for your startup idea
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Describe your startup idea..."
            className="w-full h-40 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          
          <button
            type="submit"
            disabled={loading || !idea.trim()}
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Analyzing...' : 'Analyze My Idea'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-500">
          <p>Powered by AI • Get comprehensive analysis in minutes</p>
        </div>
      </div>
    </main>
  )
}
