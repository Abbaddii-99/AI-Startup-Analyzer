'use client'

import { TrendingUp, Globe, BarChart3 } from 'lucide-react'

interface MarketResearchData {
  marketDemand: string
  tam: string
  sam: string
  som: string
  growthTrends: string[]
  geographicOpportunities: string[]
}

const CIRCLES = [
  { key: 'tam', label: 'TAM', sublabel: 'Total Addressable Market', size: 220, color: '#3b82f6', opacity: 0.15, textColor: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  { key: 'sam', label: 'SAM', sublabel: 'Serviceable Addressable Market', size: 150, color: '#8b5cf6', opacity: 0.2, textColor: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  { key: 'som', label: 'SOM', sublabel: 'Serviceable Obtainable Market', size: 90, color: '#10b981', opacity: 0.3, textColor: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
]

export default function MarketSizeVisual({ data }: { data: MarketResearchData }) {
  const values: Record<string, string> = { tam: data.tam, sam: data.sam, som: data.som }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-blue-500" />
        <h2 className="text-lg font-bold text-gray-800">Market Size Analysis</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-center">
        {/* Venn Diagram */}
        <div className="flex items-center justify-center">
          <div className="relative" style={{ width: 240, height: 240 }}>
            {CIRCLES.map((c) => {
              const offset = (220 - c.size) / 2
              return (
                <div
                  key={c.key}
                  className="absolute rounded-full border-2 flex items-center justify-center"
                  style={{
                    width: c.size,
                    height: c.size,
                    top: offset,
                    left: offset,
                    backgroundColor: c.color,
                    opacity: c.opacity + 0.1,
                    borderColor: c.color,
                  }}
                />
              )
            })}
            {/* Labels inside circles */}
            {CIRCLES.map((c) => {
              const offset = (220 - c.size) / 2
              const center = offset + c.size / 2
              return (
                <div
                  key={`label-${c.key}`}
                  className="absolute flex flex-col items-center justify-center pointer-events-none"
                  style={{
                    width: c.size * 0.6,
                    top: center - c.size * 0.15,
                    left: offset + c.size * 0.2,
                  }}
                >
                  <span className="text-xs font-bold text-white drop-shadow">{c.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Values */}
        <div className="space-y-3">
          {CIRCLES.map((c) => (
            <div key={c.key} className={`${c.bg} border ${c.border} rounded-xl p-3`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold ${c.textColor}`}>{c.label}</span>
                <span className="text-xs text-gray-400">{c.sublabel}</span>
              </div>
              <p className="text-sm font-semibold text-gray-800">{values[c.key]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Market Demand */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-500 mb-1">Market Demand</p>
        <p className="text-sm text-gray-700">{data.marketDemand}</p>
      </div>

      {/* Growth Trends + Geographic */}
      <div className="grid sm:grid-cols-2 gap-4">
        {data.growthTrends?.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <h3 className="text-sm font-semibold text-gray-700">Growth Trends</h3>
            </div>
            <ul className="space-y-1.5">
              {data.growthTrends.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="text-green-500 font-bold mt-0.5">↑</span> {t}
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.geographicOpportunities?.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Globe className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-semibold text-gray-700">Geographic Opportunities</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {data.geographicOpportunities.map((g, i) => (
                <span key={i} className="text-xs bg-blue-50 border border-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                  {g}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
