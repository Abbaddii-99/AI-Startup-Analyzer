'use client'

import { ThumbsUp, ThumbsDown, CheckCircle, AlertCircle, MinusCircle } from 'lucide-react'

const priorityColor: Record<string, string> = {
  'Must Have': 'bg-blue-100 text-blue-700',
  'Should Have': 'bg-purple-100 text-purple-700',
  'Nice to Have': 'bg-gray-100 text-gray-500',
}

const riskColor: Record<string, string> = {
  Low: 'text-green-600',
  Medium: 'text-yellow-600',
  High: 'text-red-600',
}

export default function MvpPlan({ data }: { data: any }) {
  if (!data) return null

  return (
    <div className="space-y-10" dir="auto">

      {/* Header */}
      {data.productName && (
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{data.productName}</h2>
            {data.tagline && <p className="text-gray-500 text-sm mt-1">{data.tagline}</p>}
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span className="bg-gray-100 px-3 py-1 rounded-full">{data.developmentComplexity}</span>
            <span className="bg-gray-100 px-3 py-1 rounded-full">{data.estimatedTime}</span>
          </div>
        </div>
      )}

      {/* Core Features */}
      {data.coreFeatures?.length > 0 && (
        <div>
          <SectionHeader title="الميزات الأساسية" subtitle="حدد وترتب الوظائف الأساسية التي يجب أن يتضمنها المنتج الأولي للقيمة المستهدفين" />
          <div className="space-y-3 mt-4">
            {data.coreFeatures.map((f: any, i: number) => (
              <div key={i} className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-gray-400">
                  <span className="text-sm">⚙️</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm">{f.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor[f.priority] ?? 'bg-gray-100 text-gray-500'}`}>
                      {f.priority}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs mt-1 leading-relaxed">{f.description}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button className="text-gray-300 hover:text-green-500 transition"><ThumbsUp className="w-4 h-4" /></button>
                  <button className="text-gray-300 hover:text-red-400 transition"><ThumbsDown className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback Loops */}
      {data.feedbackLoops?.length > 0 && (
        <div>
          <SectionHeader title="حلقات التغذية الراجعة" subtitle="قم بوضع أساليب منهجية لجمع وتحليل والتصرف بناءً على ملاحظات المستخدمين" />
          <div className="grid grid-cols-2 gap-4 mt-4">
            {data.feedbackLoops.map((f: any, i: number) => (
              <div key={i} className="p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <span className="text-sm">🔄</span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button className="text-gray-300 hover:text-green-500 transition"><ThumbsUp className="w-3.5 h-3.5" /></button>
                    <button className="text-gray-300 hover:text-red-400 transition"><ThumbsDown className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mt-2">{f.title}</h4>
                <p className="text-gray-500 text-xs mt-1 leading-relaxed">{f.description}</p>
                {f.method && <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{f.method}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPIs */}
      {data.kpis?.length > 0 && (
        <div>
          <SectionHeader title="أهداف قابلة للقياس وأداء رئيسية" subtitle="حدد أهدافاً واضحة للقياس ومؤشرات أداء رئيسية لتتبع التقدم والنجاح الأولي" />
          <div className="grid grid-cols-2 gap-4 mt-4">
            {data.kpis.map((k: any, i: number) => (
              <div key={i} className="p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition">
                <div className="flex items-start justify-between">
                  <p className="text-xs text-gray-400">{k.title}</p>
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold shrink-0">{i + 1}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-2">{k.target}</div>
                <p className="text-gray-500 text-xs mt-1 leading-relaxed">{k.description}</p>
                {k.timeframe && <span className="text-xs text-blue-500 mt-1 block">{k.timeframe}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Iteration Strategy */}
      {data.iterationStrategy && (
        <div>
          <SectionHeader title="التحسين التكراري" subtitle="قم بتطوير نهج منظم لتحسين منتجك الأولي باستمرار من خلال حلقات التحسين وبيانات الأداء" />
          <div className="mt-4 p-4 border border-gray-100 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                <span className="text-sm">🔁</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 mb-1">استراتيجية تكرارية</p>
                <p className="text-gray-700 text-sm leading-relaxed">{data.iterationStrategy}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button className="text-gray-300 hover:text-green-500 transition"><ThumbsUp className="w-4 h-4" /></button>
                <button className="text-gray-300 hover:text-red-400 transition"><ThumbsDown className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feasibility */}
      {data.feasibilityChecks?.length > 0 && (
        <div>
          <SectionHeader title="دراسات الجدوى" subtitle="قم بتقييم المتطلبات التقنية والقيود والميزانية لضمان أن أول منتج قابل للتطبيق ضمن نطاق مشروعك" />
          <div className="space-y-3 mt-4">
            {data.feasibilityChecks.map((f: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition">
                {f.risk === 'Low'
                  ? <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  : f.risk === 'High'
                  ? <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  : <MinusCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                }
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{f.question}</p>
                  <p className="text-gray-500 text-xs mt-1 leading-relaxed">{f.answer}</p>
                </div>
                <span className={`text-xs font-medium shrink-0 ${riskColor[f.risk] ?? 'text-gray-400'}`}>{f.risk}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Milestones */}
      {data.keyMilestones?.length > 0 && (
        <div>
          <SectionHeader title="العلامات الرئيسية" subtitle="حدد نقاط التحقق والتسليمات والتواريخ المحورية التي تعكس التقدم الفعلي نحو الإطلاق" />
          <div className="relative mt-6 pl-4">
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200" />
            {data.keyMilestones.map((m: any, i: number) => (
              <div key={i} className="relative flex items-start gap-4 mb-6 last:mb-0">
                <div className="absolute -left-[17px] w-8 h-8 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow">
                  {i + 1}
                </div>
                <div className="ml-6 flex-1 p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm">{m.title}</span>
                    <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full shrink-0">{m.week}</span>
                  </div>
                  <p className="text-gray-500 text-xs mt-1 leading-relaxed">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <p className="text-gray-400 text-xs mt-0.5 max-w-xl">{subtitle}</p>
      </div>
      <div className="flex gap-1 shrink-0">
        <button className="text-gray-300 hover:text-green-500 transition"><ThumbsUp className="w-4 h-4" /></button>
        <button className="text-gray-300 hover:text-red-400 transition"><ThumbsDown className="w-4 h-4" /></button>
      </div>
    </div>
  )
}
