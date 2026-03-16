'use client'

import { Briefcase, Star, TrendingUp } from 'lucide-react'

interface BusinessModelMatch {
  name: string
  description: string
  fitScore: number
  reason: string
  examples: string[]
}

interface BusinessModelData {
  matchedCount: number
  totalModels: number
  topMatches: BusinessModelMatch[]
  primaryModel: string
  summary: string
}

const scoreColor = (s: number) =>
  s >= 8 ? 'text-green-600 bg-green-50 border-green-200' :
  s >= 6 ? 'text-blue-600 bg-blue-50 border-blue-200' :
  'text-gray-600 bg-gray-50 border-gray-200'

const barColor = (s: number) =>
  s >= 8 ? 'bg-green-500' : s >= 6 ? 'bg-blue-500' : 'bg-gray-400'

export default function BusinessModel({ data }: { data: BusinessModelData }) {
  const pct = Math.round((data.matchedCount / data.totalModels) * 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Briefcase className="w-5 h-5 text-purple-500" />
        <h2 className="text-lg font-bold text-gray-800">Business Model</h2>
      </div>

      {/* Big counter */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 rounded-2xl p-6 flex items-center gap-6">
        <div className="text-center">
          <div className="text-6xl font-bold text-purple-600">{data.matchedCount}</div>
          <div className="text-sm text-gray-500 mt-1">
            out of <span className="font-semibold text-gray-700">{data.totalModels}</span> models
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Compatibility</span>
            <span className="font-bold text-purple-600">{pct}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">{data.summary}</p>
        </div>
      </div>

      {/* Primary model badge */}
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-purple-500" />
        <span className="text-sm text-gray-600">Primary model:</span>
        <span className="bg-purple-100 text-purple-700 text-sm font-semibold px-3 py-0.5 rounded-full">
          {data.primaryModel}
        </span>
      </div>

      {/* Top matches */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Top Matching Models</h3>
        {data.topMatches.map((m, i) => (
          <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <span className="font-semibold text-gray-800 text-sm">{m.name}</span>
                <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg border shrink-0 ${scoreColor(m.fitScore)}`}>
                <Star className="w-3 h-3" />
                {m.fitScore}/10
              </div>
            </div>

            {/* Fit bar */}
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
              <div
                className={`h-1.5 rounded-full ${barColor(m.fitScore)}`}
                style={{ width: `${m.fitScore * 10}%` }}
              />
            </div>

            <p className="text-xs text-gray-600 mb-2">{m.reason}</p>

            {/* Examples */}
            {m.examples?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {m.examples.map((ex, j) => (
                  <span key={j} className="text-xs bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                    {ex}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
