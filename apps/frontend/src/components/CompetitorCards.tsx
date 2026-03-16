'use client'

import { Swords, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

interface Competitor {
  name: string
  description: string
  strengths: string[]
  weaknesses: string[]
  pricing?: string
}

interface CompetitorAnalysisData {
  directCompetitors: Competitor[]
  indirectCompetitors: Competitor[]
}

const COLORS = [
  'from-blue-500 to-blue-600',
  'from-purple-500 to-purple-600',
  'from-orange-500 to-orange-600',
  'from-green-500 to-green-600',
  'from-red-500 to-red-600',
  'from-pink-500 to-pink-600',
]

function CompetitorCard({ competitor, index }: { competitor: Competitor; index: number }) {
  const color = COLORS[index % COLORS.length]
  const initials = competitor.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-800 text-sm truncate">{competitor.name}</h4>
          <p className="text-xs text-gray-500 line-clamp-1">{competitor.description}</p>
        </div>
        {competitor.pricing && (
          <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full shrink-0">
            <DollarSign className="w-3 h-3" />
            {competitor.pricing}
          </div>
        )}
      </div>

      {/* Strengths */}
      {competitor.strengths?.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center gap-1 text-xs font-semibold text-green-600 mb-1">
            <TrendingUp className="w-3 h-3" /> Strengths
          </div>
          <ul className="space-y-0.5">
            {competitor.strengths.slice(0, 2).map((s, i) => (
              <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                <span className="text-green-400 mt-0.5">+</span> {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weaknesses */}
      {competitor.weaknesses?.length > 0 && (
        <div>
          <div className="flex items-center gap-1 text-xs font-semibold text-red-500 mb-1">
            <TrendingDown className="w-3 h-3" /> Weaknesses
          </div>
          <ul className="space-y-0.5">
            {competitor.weaknesses.slice(0, 2).map((w, i) => (
              <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                <span className="text-red-400 mt-0.5">−</span> {w}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function CompetitorCards({ data }: { data: CompetitorAnalysisData }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Swords className="w-5 h-5 text-orange-500" />
        <h2 className="text-lg font-bold text-gray-800">Competitor Analysis</h2>
        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
          {(data.directCompetitors?.length || 0) + (data.indirectCompetitors?.length || 0)} competitors
        </span>
      </div>

      {data.directCompetitors?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
            Direct Competitors
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {data.directCompetitors.map((c, i) => (
              <CompetitorCard key={i} competitor={c} index={i} />
            ))}
          </div>
        </div>
      )}

      {data.indirectCompetitors?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
            Indirect Competitors
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {data.indirectCompetitors.map((c, i) => (
              <CompetitorCard key={i} competitor={c} index={i + (data.directCompetitors?.length || 0)} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
