'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { Navbar } from '@/components/Navbar'
import { PlanBadge, scoreColor } from '@/components/ScoreCard'
import { Sparkles, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react'

export default function DashboardPage() {
  const [analyses, setAnalyses] = useState<any[]>([])
  const [planInfo, setPlanInfo] = useState<{ plan: string; used: number; limit: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { token } = useAuthStore()

  useEffect(() => {
    if (!token) { router.push('/auth/login'); return }

    Promise.all([
      api.get('/analysis'),
      api.get('/analysis/me/plan'),
    ]).then(([{ data: list }, { data: plan }]) => {
      setAnalyses(list)
      setPlanInfo(plan)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [token, router])

  const statusIcon = (status: string) => {
    if (status === 'COMPLETED') return <CheckCircle className="w-5 h-5 text-green-500" />
    if (status === 'FAILED') return <XCircle className="w-5 h-5 text-red-500" />
    return <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
                className={`bg-white rounded-xl p-5 border shadow-sm flex items-center justify-between ${a.status === 'COMPLETED' ? 'cursor-pointer hover:shadow-md transition' : ''}`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {statusIcon(a.status)}
                  <div className="min-w-0">
                    <p className="font-medium truncate">{a.idea}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(a.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {a.status === 'COMPLETED' && a.overallScore && (
                  <div className="flex items-center gap-6 ml-4 shrink-0">
                    <div className="hidden md:flex gap-4 text-sm">
                      <span className="text-gray-400">Market: <span className={`font-bold ${scoreColor(a.marketDemandScore)}`}>{a.marketDemandScore}</span></span>
                      <span className="text-gray-400">Competition: <span className={`font-bold ${scoreColor(a.competitionScore)}`}>{a.competitionScore}</span></span>
                      <span className="text-gray-400">Profit: <span className={`font-bold ${scoreColor(a.profitPotentialScore)}`}>{a.profitPotentialScore}</span></span>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${scoreColor(a.overallScore)}`}>{a.overallScore}</div>
                      <div className="text-xs text-gray-400">/ 10</div>
                    </div>
                    <TrendingUp className="w-5 h-5 text-gray-300" />
                  </div>
                )}

                {a.status === 'PROCESSING' && (
                  <span className="text-xs text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full ml-4 shrink-0">Processing...</span>
                )}
                {a.status === 'FAILED' && (
                  <span className="text-xs text-red-600 bg-red-50 px-3 py-1 rounded-full ml-4 shrink-0">Failed</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
