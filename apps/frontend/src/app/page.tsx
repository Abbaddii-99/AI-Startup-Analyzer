'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, ArrowRight, Lightbulb } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/lib/store'

const MAX_IDEA_LENGTH = 2000

const EXAMPLE_IDEAS = [
  'An app that connects freelance chefs with people who want home-cooked meals delivered',
  'A platform that helps small businesses manage their social media using AI',
  'A subscription service that sends personalized book recommendations monthly',
]

export default function Home() {
  const [idea, setIdea] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!idea.trim()) return
    setError('')
    setLoading(true)

    try {
      if (!isAuthenticated()) { router.push('/auth/login'); return }

      const { data } = await api.post('/analysis', { idea: idea.trim().slice(0, MAX_IDEA_LENGTH) })
      router.push(`/analysis/${data.id}`)
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Something went wrong.'
      setError(Array.isArray(msg) ? msg.join(', ') : msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">

        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="bg-blue-500 p-4 rounded-2xl shadow-lg">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">AI Startup Analyzer</h1>
          <p className="text-gray-500">Get a full market analysis, competitor research, MVP plan, and more — powered by AI</p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { step: '1', label: 'Describe your idea' },
            { step: '2', label: '7 AI agents analyze it' },
            { step: '3', label: 'Get full report' },
          ].map((s) => (
            <div key={s.step} className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2">{s.step}</div>
              <p className="text-sm text-gray-600">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg border p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Your Startup Idea</label>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Describe your startup idea in detail. The more specific you are, the better the analysis..."
                maxLength={MAX_IDEA_LENGTH}
                className="w-full h-36 p-4 border rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                disabled={loading}
              />
              <p className="text-xs text-gray-400 text-right mt-1">{idea.length}/{MAX_IDEA_LENGTH}</p>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

            <button
              type="submit"
              disabled={loading || idea.trim().length < 10}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="animate-spin">⟳</span> Analyzing...</>
              ) : (
                <>Analyze My Idea <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div>
            <p className="text-xs text-gray-400 mb-2 flex items-center gap-1"><Lightbulb className="w-3 h-3" /> Try an example:</p>
            <div className="space-y-2">
              {EXAMPLE_IDEAS.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setIdea(ex)}
                  className="w-full text-left text-xs bg-gray-50 hover:bg-blue-50 hover:text-blue-600 px-3 py-2 rounded-lg text-gray-600 transition border border-transparent hover:border-blue-200"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-400 space-x-4">
          <button onClick={() => router.push('/dashboard')} className="hover:text-gray-600">My Analyses</button>
          <span>•</span>
          <button onClick={() => router.push('/auth/login')} className="hover:text-gray-600">Login</button>
          <span>•</span>
          <button onClick={() => router.push('/auth/register')} className="hover:text-gray-600">Register</button>
        </div>
      </div>
    </main>
  )
}
