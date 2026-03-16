'use client'

import { Users, Zap, Target } from 'lucide-react'

const COLORS = [
  { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
  { bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
  { bg: 'bg-green-500', light: 'bg-green-50', text: 'text-green-700', border: 'border-green-100' },
  { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100' },
  { bg: 'bg-pink-500', light: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-100' },
]

const ACCESS_LEVELS = ['Easy', 'Moderate', 'Hard']
const accessColor = (i: number) =>
  i === 0 ? 'bg-green-100 text-green-700' :
  i === 1 ? 'bg-yellow-100 text-yellow-700' :
  'bg-red-100 text-red-700'

interface IdeaAnalysisData {
  summary: string
  coreProblem: string
  targetUsers: string[]
  industry: string
  useCases: string[]
}

export default function TargetAudienceCards({ data }: { data: IdeaAnalysisData }) {
  if (!data?.targetUsers?.length) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-blue-500" />
        <h2 className="text-lg font-bold text-gray-800">Target Audience</h2>
        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
          {data.targetUsers.length} segments
        </span>
      </div>

      {/* Industry + Problem */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-start gap-2">
          <Target className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-0.5">Industry</p>
            <p className="text-sm font-medium text-gray-800">{data.industry}</p>
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-start gap-2">
          <Zap className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-0.5">Core Problem</p>
            <p className="text-sm font-medium text-gray-800 line-clamp-2">{data.coreProblem}</p>
          </div>
        </div>
      </div>

      {/* Audience cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.targetUsers.map((user, i) => {
          const color = COLORS[i % COLORS.length]
          const accessIdx = i % ACCESS_LEVELS.length
          const initials = user.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

          return (
            <div key={i} className={`${color.light} border ${color.border} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg ${color.bg} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                  {initials}
                </div>
                <p className="text-sm font-semibold text-gray-800 line-clamp-2">{user}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${accessColor(accessIdx)}`}>
                {ACCESS_LEVELS[accessIdx]} to reach
              </span>
            </div>
          )
        })}
      </div>

      {/* Use cases */}
      {data.useCases?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Use Cases</h3>
          <div className="flex flex-wrap gap-2">
            {data.useCases.map((uc, i) => (
              <span key={i} className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-full">
                {uc}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
