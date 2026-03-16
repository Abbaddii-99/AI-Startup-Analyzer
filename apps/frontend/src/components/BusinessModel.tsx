'use client'

import { useState } from 'react'
import { Briefcase, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react'

interface BusinessModelItem {
  name: string
  description: string
  applicable: boolean
  reason: string
  examples: string[]
  icon: string
}

interface BusinessModelData {
  matchedCount: number
  totalModels: number
  percentMatch: number
  primaryModel: string
  summary: string
  applicable: BusinessModelItem[]
  notApplicable: BusinessModelItem[]
}

function ModelCard({ model, applicable }: { model: BusinessModelItem; applicable: boolean }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`rounded-xl border p-4 transition ${applicable ? 'bg-white border-gray-100 hover:border-blue-200' : 'bg-gray-50 border-gray-100'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <span className="text-lg shrink-0">{model.icon}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-semibold text-sm text-gray-800">{model.name}</h4>
              {applicable ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{model.description}</p>
          </div>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-gray-600 shrink-0 mt-0.5">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
          <p className={`text-xs ${applicable ? 'text-blue-700' : 'text-red-600'}`}>{model.reason}</p>
          {applicable && model.examples?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {model.examples.map((ex, i) => (
                <span key={i} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{ex}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function BusinessModel({ data }: { data: BusinessModelData }) {
  const [showNotApplicable, setShowNotApplicable] = useState(false)
  const pct = data.percentMatch || Math.round((data.matchedCount / data.totalModels) * 100)

  // Build visual grid: green = applicable, gray = not
  const totalCells = data.totalModels
  const matchedCells = data.matchedCount

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Briefcase className="w-5 h-5 text-purple-500" />
        <h2 className="text-lg font-bold text-gray-800">Business Model</h2>
        <span className="text-xs text-gray-400">اكتشف استراتيجيات مخصصة لتطبيق فكرتك عبر نماذج أعمال مختلفة</span>
      </div>

      {/* Big counter + grid */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">متوافق مع</p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-bold text-purple-600">{pct}%</span>
              <span className="text-gray-400 text-sm">من {data.totalModels} نموذج</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              بناءً على تحليلنا، تتوافق فكرتك مع <strong>{data.matchedCount}</strong> من أصل <strong>{data.totalModels}</strong> نموذجاً. استكشف هذه النماذج لتعرف كيف تطبق فكرتك بطرق متنوعة.
            </p>
          </div>

          {/* Dot grid */}
          <div className="shrink-0">
            <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(7, 1fr)', width: 'fit-content' }}>
              {Array.from({ length: totalCells }).map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-sm ${i < matchedCells ? 'bg-purple-500' : 'bg-gray-200'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 w-full bg-white rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Primary model */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500">النموذج الأساسي:</span>
        <span className="bg-purple-100 text-purple-700 font-semibold px-3 py-0.5 rounded-full">{data.primaryModel}</span>
        <span className="text-gray-400 text-xs">{data.summary}</span>
      </div>

      {/* Applicable models */}
      {data.applicable?.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            نماذج أعمال قابلة للتطبيق
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{data.applicable.length}</span>
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.applicable.map((m, i) => (
              <ModelCard key={i} model={m} applicable={true} />
            ))}
          </div>
        </div>
      )}

      {/* Not applicable models - collapsible */}
      {data.notApplicable?.length > 0 && (
        <div>
          <button
            onClick={() => setShowNotApplicable(!showNotApplicable)}
            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition mb-3"
          >
            <XCircle className="w-4 h-4 text-red-400" />
            نماذج أعمال غير قابلة للتطبيق
            <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">{data.notApplicable.length}</span>
            {showNotApplicable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showNotApplicable && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.notApplicable.map((m, i) => (
                <ModelCard key={i} model={m} applicable={false} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
