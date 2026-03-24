'use client'

import { Clock, Plus, User, ThumbsUp, ThumbsDown } from 'lucide-react'

interface RoadmapTask {
  title: string
  type?: string
  role?: string
}

interface RoadmapMilestone {
  phase: number
  title: string
  description: string
  weeks: number
  tasks: (RoadmapTask | string)[]
  deliverable: string
}

interface ProjectRoadmapData {
  milestones: RoadmapMilestone[]
  totalWeeks: number
  summary: string
}

const phaseColors = [
  { border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  { border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  { border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  { border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
]

const PHASE_NAMES = ['الأولى', 'الثانية', 'الثالثة', 'الرابعة']

function getTask(t: RoadmapTask | string): RoadmapTask {
  return typeof t === 'string' ? { title: t } : t
}

export default function Roadmap({ data }: { data: ProjectRoadmapData }) {
  return (
    <div className="space-y-2" dir="auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">خطة العمل</h2>
        <span className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-600">
          <Clock className="w-3.5 h-3.5" />
          {data.totalWeeks} أسبوع
        </span>
      </div>

      {data.milestones.map((m, i) => {
        const color = phaseColors[i % phaseColors.length]
        return (
          <div key={m.phase}>
            {/* Phase header */}
            <div className="flex items-center justify-between py-3 px-1">
              <div className="flex items-center gap-3">
                <h3 className={`font-bold text-sm ${color.text}`}>
                  المرحلة {PHASE_NAMES[i] ?? i + 1}: {m.title}
                </h3>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color.badge}`}>
                  {m.weeks} أسابيع
                </span>
              </div>
              <div className="flex gap-1">
                <button className="text-gray-300 hover:text-green-500 transition"><ThumbsUp className="w-3.5 h-3.5" /></button>
                <button className="text-gray-300 hover:text-red-400 transition"><ThumbsDown className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            {/* Tasks */}
            <div className="space-y-2">
              {m.tasks.map((t, j) => {
                const task = getTask(t)
                return (
                  <div key={j} className={`flex items-center gap-3 p-3 border ${color.border} rounded-xl bg-white hover:bg-gray-50 transition`}>
                    <button className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition shrink-0">
                      <Plus className="w-3 h-3" />
                    </button>
                    <span className="flex-1 text-sm text-gray-800 font-medium">{task.title}</span>
                    {task.type && (
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
                        {task.type}
                      </span>
                    )}
                    {task.role && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 shrink-0">
                        <span className="text-gray-400">/</span>
                        <span>{task.role}</span>
                        <User className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
