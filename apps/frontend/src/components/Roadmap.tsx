'use client'

import { MapPin, Clock, CheckCircle2, Package } from 'lucide-react'

interface RoadmapMilestone {
  phase: number
  title: string
  description: string
  weeks: number
  tasks: string[]
  deliverable: string
}

interface ProjectRoadmapData {
  milestones: RoadmapMilestone[]
  totalWeeks: number
  summary: string
}

const phaseColors = [
  { bg: 'bg-blue-500', light: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
  { bg: 'bg-purple-500', light: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700' },
  { bg: 'bg-orange-500', light: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700' },
  { bg: 'bg-green-500', light: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-700' },
]

export default function Roadmap({ data }: { data: ProjectRoadmapData }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-bold text-gray-800">Project Roadmap</h2>
        </div>
        <span className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-600">
          <Clock className="w-3.5 h-3.5" />
          {data.totalWeeks} weeks total
        </span>
      </div>

      <p className="text-sm text-gray-500">{data.summary}</p>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

        <div className="space-y-6">
          {data.milestones.map((m, i) => {
            const color = phaseColors[i % phaseColors.length]
            return (
              <div key={m.phase} className="relative flex gap-4">
                {/* Circle */}
                <div className={`relative z-10 w-12 h-12 rounded-full ${color.bg} flex items-center justify-center shrink-0 shadow-md`}>
                  <span className="text-white font-bold text-sm">{m.phase}</span>
                </div>

                {/* Content */}
                <div className={`flex-1 ${color.light} border ${color.border} rounded-xl p-4 mb-1`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className={`font-bold text-sm ${color.text}`}>{m.title}</h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${color.badge}`}>
                      {m.weeks} {m.weeks === 1 ? 'week' : 'weeks'}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 mb-3">{m.description}</p>

                  {/* Tasks */}
                  <ul className="space-y-1 mb-3">
                    {m.tasks.map((task, j) => (
                      <li key={j} className="flex items-start gap-1.5 text-xs text-gray-600">
                        <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${color.text}`} />
                        {task}
                      </li>
                    ))}
                  </ul>

                  {/* Deliverable */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-gray-200">
                    <Package className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="text-xs text-gray-500">
                      <span className="font-semibold text-gray-700">Deliverable: </span>
                      {m.deliverable}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
