'use client'

import { Shield } from 'lucide-react'

interface RiskItem {
  id: number
  title: string
  description: string
  probability: 'low' | 'medium' | 'high' | 'critical'
  impact: 'low' | 'medium' | 'high' | 'critical'
  mitigation: string
}

interface RiskRadarData {
  risks: RiskItem[]
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical'
  summary: string
}

const LEVELS = ['low', 'medium', 'high', 'critical'] as const
type Level = typeof LEVELS[number]

const levelLabel: Record<Level, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

const cellColor = (prob: Level, imp: Level): string => {
  const p = LEVELS.indexOf(prob)
  const i = LEVELS.indexOf(imp)
  const score = p + i
  if (score <= 1) return 'bg-green-100 border-green-200'
  if (score <= 3) return 'bg-yellow-100 border-yellow-200'
  if (score <= 5) return 'bg-orange-100 border-orange-200'
  return 'bg-red-100 border-red-200'
}

const badgeColor: Record<Level, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
}

const overallColor: Record<Level, string> = {
  low: 'text-green-600 bg-green-50 border-green-200',
  medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  high: 'text-orange-600 bg-orange-50 border-orange-200',
  critical: 'text-red-600 bg-red-50 border-red-200',
}

export default function RiskRadar({ data }: { data: RiskRadarData }) {
  // Build matrix: rows = impact (critical→low), cols = probability (low→critical)
  const matrix: Record<string, RiskItem[]> = {}
  LEVELS.forEach(p => LEVELS.forEach(i => { matrix[`${p}-${i}`] = [] }))
  data.risks.forEach(r => matrix[`${r.probability}-${r.impact}`]?.push(r))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-bold text-gray-800">Risk Radar</h2>
        </div>
        <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${overallColor[data.overallRiskLevel]}`}>
          Overall: {levelLabel[data.overallRiskLevel]}
        </span>
      </div>

      <p className="text-sm text-gray-500">{data.summary}</p>

      {/* Matrix */}
      <div className="overflow-x-auto">
        <div className="min-w-[480px]">
          {/* X-axis label */}
          <div className="text-center text-xs font-semibold text-gray-400 mb-1 ml-16">← Probability →</div>
          <div className="flex">
            {/* Y-axis label */}
            <div className="flex items-center justify-center w-8 mr-2">
              <span className="text-xs font-semibold text-gray-400 -rotate-90 whitespace-nowrap">← Impact →</span>
            </div>
            <div className="flex-1">
              {/* Column headers */}
              <div className="grid grid-cols-4 gap-1 mb-1 ml-14">
                {LEVELS.map(l => (
                  <div key={l} className="text-center text-xs font-medium text-gray-500 capitalize">{levelLabel[l]}</div>
                ))}
              </div>
              {/* Rows: impact from critical to low */}
              {[...LEVELS].reverse().map(imp => (
                <div key={imp} className="grid grid-cols-[56px_1fr_1fr_1fr_1fr] gap-1 mb-1">
                  <div className="flex items-center justify-end pr-2 text-xs font-medium text-gray-500 capitalize">{levelLabel[imp]}</div>
                  {LEVELS.map(prob => {
                    const items = matrix[`${prob}-${imp}`] || []
                    return (
                      <div
                        key={prob}
                        className={`min-h-[52px] rounded-lg border-2 p-1 flex flex-wrap gap-1 items-center justify-center ${cellColor(prob, imp)}`}
                      >
                        {items.map(r => (
                          <div
                            key={r.id}
                            className="group relative"
                          >
                            <div className="w-6 h-6 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-xs font-bold text-gray-600 cursor-pointer hover:border-blue-400 transition">
                              {r.id}
                            </div>
                            {/* Tooltip */}
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 bg-gray-900 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition pointer-events-none z-10 shadow-lg">
                              <p className="font-semibold mb-1">{r.title}</p>
                              <p className="text-gray-300">{r.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Risk List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Risk Details</h3>
        {data.risks.map(r => (
          <div key={r.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                  {r.id}
                </span>
                <span className="font-semibold text-gray-800 text-sm">{r.title}</span>
              </div>
              <div className="flex gap-1 shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor[r.probability]}`}>
                  P: {levelLabel[r.probability]}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor[r.impact]}`}>
                  I: {levelLabel[r.impact]}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-2">{r.description}</p>
            <div className="flex items-start gap-1.5">
              <Shield className="w-3 h-3 text-blue-400 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-600">{r.mitigation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
