'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { Navbar } from '@/components/Navbar'
import { PlanBadge, scoreColor } from '@/components/ScoreCard'
import { Sparkles, TrendingUp, Clock, CheckCircle, XCircle, Trash2, RefreshCw, MoreVertical } from 'lucide-react'

export default function DashboardPage() {
  const [analyses, setAnalyses] = useState<any[]>([])
  const [planInfo, setPlanInfo] = useState<{ plan: string; used: number; limit: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [retrying, setRetrying] = useState<string | null>(null)
  const router = useRouter()
  const { token } = useAuthStore()

  useEffect(() => {
    if (!token) { router.push('/auth/login'); return }
    fetchData()
  }, [token, router])

  const fetchData = () => {
    Promise.all([
      api.get('/analysis'),
      api.get('/analysis/me/plan'),
    ]).then(([{ data: list }, { data: plan }]) => {
      setAnalyses(list)
      setPlanInfo(plan)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!confirm('Delete this analysis?')) return
    setDeleting(id)
    try {
      await api.delete(`/analysis/${id}`)
      setAnalyses(prev => prev.filter(a => a.id !== id))
    } catch { /* ignore */ }
    setDeleting(null)
    setMenuOpen(null)
  }

  const handleRetry = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setRetrying(id)
    try {
      await api.post(`/analysis/${id}/retry`)
      setAnalyses(prev => prev.map(a => a.id === id ? { ...a, status: 'PROCESSING' } : a))
      setTimeout(() => router.push(`/analysis/${id}`), 500)
    } catch { /* ignore */ }
    setRetrying(null)
    setMenuOpen(null)
  }

  const statusIcon = (status: string) => {
    if (status === 'COMPLETED') return <CheckCircle className="w-5 h-5 text-green-500" />
    if (status === 'FAILED') return <XCircle className="w-5 h-5 text-red-500" />
    return <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />
  }

  return (
    <div className="min-h-screen bg-gray-50" onClick={() => setMenuOpen(null)}>
      <Navbar variant="dashboard" />

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Analyses</h1>
            <p className="text-gray-500 text-sm mt-1">{analyses.length} total</p>
          </div>
          {planInfo && (
            <div className="text-right space-y-1">
              <PlanBadge plan={planInfo.plan} />
              <p className="text-xs text-gray-400">{planInfo.used} / {planInfo.limit} this month</p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : analyses.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <Sparkles className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="text-gray-500">No analyses yet. Start by analyzing your first idea!</p>
            <button onClick={() => router.push('/')} className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition">
              Analyze an Idea
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {analyses.map((a) => (
              <div
                key={a.id}
                onClick={() => a.status === 'COMPLETED' && router.push(`/analysis/${a.id}`)}
                className={`bg-white rounded-xl p-5 border shadow-sm flex items-center gap-4 ${a.status === 'COMPLETED' ? 'cursor-pointer hover:shadow-md transition' : ''}`}
              >
                {/* Status icon */}
                <div className="shrink-0">{statusIcon(a.status)}</div>

                {/* Idea text - truncated */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate max-w-md" title={a.idea}>
                    {a.idea}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(a.createdAt).toLocaleDateString()}</p>
                </div>

                {/* Scores */}
                {a.status === 'COMPLETED' && a.overallScore && (
                  <div className="hidden md:flex items-center gap-4 text-sm shrink-0">
                    <span className="text-gray-400">Market: <span className={`font-bold ${scoreColor(a.marketDemandScore)}`}>{a.marketDemandScore}</span></span>
                    <span className="text-gray-400">Profit: <span className={`font-bold ${scoreColor(a.profitPotentialScore)}`}>{a.profitPotentialScore}</span></span>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${scoreColor(a.overallScore)}`}>{a.overallScore}</div>
                      <div className="text-xs text-gray-400">/ 10</div>
                    </div>
                    <TrendingUp className="w-5 h-5 text-gray-300" />
                  </div>
                )}

                {a.status === 'PROCESSING' && (
                  <span className="text-xs text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full shrink-0">Processing...</span>
                )}

                {/* Actions menu */}
                <div className="relative shrink-0" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => setMenuOpen(menuOpen === a.id ? null : a.id)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {menuOpen === a.id && (
                    <div className="absolute right-0 top-8 bg-white border border-gray-100 rounded-xl shadow-lg z-10 py-1 w-36">
                      {a.status === 'FAILED' && (
                        <button
                          onClick={(e) => handleRetry(e, a.id)}
                          disabled={retrying === a.id}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 transition"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${retrying === a.id ? 'animate-spin' : ''}`} />
                          {retrying === a.id ? 'Retrying...' : 'Retry'}
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDelete(e, a.id)}
                        disabled={deleting === a.id}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        <Trash2 className={`w-3.5 h-3.5 ${deleting === a.id ? 'animate-pulse' : ''}`} />
                        {deleting === a.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
