'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { Navbar } from '@/components/Navbar'
import { ScoreCard, scoreColor, scoreBg } from '@/components/ScoreCard'
import RiskRadar from '@/components/RiskRadar'
import Roadmap from '@/components/Roadmap'
import BusinessModel from '@/components/BusinessModel'
import CompetitorCards from '@/components/CompetitorCards'
import TargetAudienceCards from '@/components/TargetAudienceCards'
import ReactMarkdown from 'react-markdown'
import {
  Loader2, TrendingUp, Users, DollarSign, Zap, Download, Share2,
  MessageCircle, Send, CheckCircle, AlertTriangle, Lightbulb
} from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts'

const PROGRESS_LABELS: Record<number, string> = {
  5:  'Starting...',
  19: 'Analyzing idea...',
  33: 'Researching market...',
  47: 'Analyzing competitors...',
  61: 'Designing MVP...',
  75: 'Planning monetization...',
  89: 'Building go-to-market strategy...',
  90: 'Compiling data...',
  98: 'Writing final report...',
  100: 'Done!',
}

export default function AnalysisPage() {
  const params = useParams()
  const router = useRouter()
  const { token } = useAuthStore()
  const [analysis, setAnalysis] = useState<any>(null)
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('Initializing agents...')
  const [loading, setLoading] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!token) { router.push('/auth/login'); return }

    let interval: ReturnType<typeof setInterval> | null = null

    const pollProgress = () => {
      interval = setInterval(async () => {
        try {
          const { data } = await api.get(`/analysis/${params.id}/progress`)
          const p = data.progress || 0
          setProgress(p)
          const labelKey = Object.keys(PROGRESS_LABELS)
            .map(Number)
            .filter(k => k <= p)
            .pop()
          if (labelKey !== undefined) setProgressLabel(PROGRESS_LABELS[labelKey])

          if (data.status === 'COMPLETED') {
            clearInterval(interval!)
            const { data: full } = await api.get(`/analysis/${params.id}`)
            setAnalysis(full)
            setLoading(false)
          }
          if (data.status === 'FAILED') { clearInterval(interval!); setLoading(false) }
        } catch { clearInterval(interval!); setLoading(false) }
      }, 2000)
    }

    const fetchAnalysis = async () => {
      try {
        const { data } = await api.get(`/analysis/${params.id}`)
        setAnalysis(data)
        if (data.status === 'COMPLETED' || data.status === 'FAILED') {
          setLoading(false)
          return
        }
        pollProgress()
      } catch {
        setLoading(false)
      }
    }

    fetchAnalysis()

    return () => { if (interval) clearInterval(interval) }
  }, [params.id, token, router])

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const exportPDF = async () => {
    const { default: jsPDF } = await import('jspdf')
    const { default: html2canvas } = await import('html2canvas')
    if (!reportRef.current) return
    const canvas = await html2canvas(reportRef.current, { scale: 1.5, useCORS: true })
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const imgW = 210
    const imgH = (canvas.height * imgW) / canvas.width
    let y = 0
    while (y < imgH) {
      if (y > 0) pdf.addPage()
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.85), 'JPEG', 0, -y, imgW, imgH)
      y += 297
    }
    pdf.save(`analysis-${params.id}.pdf`)
  }

  const shareLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return
    const userMsg = chatInput.trim()
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setChatLoading(true)

    try {
      const context = JSON.stringify(analysis?.finalReport || {})
      const { data } = await api.post('/analysis/chat', {
        message: userMsg,
        context,
        analysisId: params.id,
      })
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }])
    } finally {
      setChatLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-6 max-w-sm w-full px-4">
          <div className="relative w-24 h-24 mx-auto">
            <Loader2 className="w-24 h-24 animate-spin text-blue-200 absolute" />
            <Loader2 className="w-16 h-16 animate-spin text-blue-500 absolute top-4 left-4" style={{ animationDirection: 'reverse' }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Analyzing Your Idea</h2>
            <p className="text-gray-500 mt-1 text-sm">{progressLabel}</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-blue-600 font-semibold">{progress}%</p>
          <div className="grid grid-cols-7 gap-1">
            {[19, 33, 47, 61, 75, 89, 100].map((step) => (
              <div key={step} className={`h-1.5 rounded-full ${progress >= step ? 'bg-blue-500' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!analysis || analysis.status === 'FAILED') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
          <p className="text-gray-600">Analysis failed. Please try again.</p>
          <button onClick={() => router.push('/')} className="bg-blue-500 text-white px-6 py-2 rounded-lg">Try Again</button>
        </div>
      </div>
    )
  }

  if (!analysis.finalReport) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">No data available</div>
  }

  const report = analysis.finalReport
  const score = report.score

  const radarData = [
    { subject: 'Market', value: score.marketDemand },
    { subject: 'Competition', value: score.competition },
    { subject: 'Execution', value: 10 - score.executionDifficulty },
    { subject: 'Profit', value: score.profitPotential },
    { subject: 'Overall', value: score.overall },
  ]

  const barData = [
    { name: 'Market Demand', score: score.marketDemand, color: '#3b82f6' },
    { name: 'Competition', score: score.competition, color: '#8b5cf6' },
    { name: 'Execution', score: score.executionDifficulty, color: '#f59e0b' },
    { name: 'Profit', score: score.profitPotential, color: '#10b981' },
  ]

  const renderVal = (val: any): string => {
    if (typeof val === 'string') return val
    if (Array.isArray(val)) return val.join('\n')
    if (typeof val === 'object' && val !== null) return Object.entries(val).map(([k, v]) => `**${k}:** ${renderVal(v)}`).join('\n\n')
    return String(val ?? '')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        variant="analysis"
        rightSlot={
          <div className="flex items-center gap-2">
            <button onClick={shareLink} className="flex items-center gap-2 border px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
              <Share2 className="w-4 h-4" />
              {copied ? 'Copied!' : 'Share'}
            </button>
            <button onClick={exportPDF} className="flex items-center gap-2 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-600 transition">
              <Download className="w-4 h-4" /> Export PDF
            </button>
            <button onClick={() => setChatOpen(!chatOpen)} className="flex items-center gap-2 bg-purple-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-purple-600 transition">
              <MessageCircle className="w-4 h-4" /> Ask AI
            </button>
          </div>
        }
      />

      <div className="max-w-5xl mx-auto p-6 space-y-6" ref={reportRef}>
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-2xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">Analysis Complete</h1>
              <p className="text-blue-100 text-sm">{analysis.idea}</p>
            </div>
            <div className="text-center ml-6">
              <div className={`text-5xl font-bold ${score.overall >= 7 ? 'text-green-300' : score.overall >= 5 ? 'text-yellow-300' : 'text-red-300'}`}>
                {score.overall}
              </div>
              <div className="text-blue-200 text-sm">/ 10</div>
              <div className="text-blue-200 text-xs mt-1">Overall Score</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <TrendingUp className="w-5 h-5" />, title: 'Market Demand', score: score.marketDemand },
            { icon: <Users className="w-5 h-5" />, title: 'Competition', score: score.competition },
            { icon: <Zap className="w-5 h-5" />, title: 'Execution', score: score.executionDifficulty },
            { icon: <DollarSign className="w-5 h-5" />, title: 'Profit Potential', score: score.profitPotential },
          ].map((card) => (
            <ScoreCard key={card.title} score={card.score} label={card.title} icon={card.icon} />
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="font-bold mb-4">Score Radar</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="font-bold mb-4">Score Breakdown</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} layout="vertical">
                <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                <Tooltip />
                <Bar dataKey="score" radius={4}>
                  {barData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Report Sections */}
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { title: 'Idea Summary', content: report.ideaSummary, icon: '💡' },
            { title: 'Problem', content: report.problem, icon: '🎯' },
            { title: 'Market Analysis', content: report.marketAnalysis, icon: '📊' },
            { title: 'MVP Plan', content: report.mvp, icon: '🚀' },
            { title: 'Monetization', content: report.monetization, icon: '💰' },
            { title: 'Go-To-Market', content: report.goToMarket, icon: '📣' },
          ].map((s) => (
            <div key={s.title} className="bg-white p-5 rounded-xl border shadow-sm">
              <h3 className="font-bold mb-3 flex items-center gap-2">{s.icon} {s.title}</h3>
              <div className="text-gray-700 text-sm leading-relaxed prose prose-sm max-w-none">
                <ReactMarkdown>{renderVal(s.content)}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>

        {/* Target Audience Cards */}
        {analysis.ideaAnalysis && (
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <TargetAudienceCards data={analysis.ideaAnalysis} />
          </div>
        )}

        {/* Competitor Cards */}
        {analysis.competitorAnalysis && (
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <CompetitorCards data={analysis.competitorAnalysis} />
          </div>
        )}

        <div className="bg-red-50 border border-red-200 p-6 rounded-xl">
          <h3 className="font-bold mb-4 text-red-800 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Risks</h3>
          <ul className="space-y-2">
            {(Array.isArray(report.risks) ? report.risks : [report.risks]).map((risk: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-red-700 text-sm">
                <span className="mt-0.5 shrink-0">•</span> {risk}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 p-6 rounded-xl">
          <h3 className="font-bold mb-3 text-green-800 flex items-center gap-2"><CheckCircle className="w-5 h-5" /> Final Verdict</h3>
          <div className="text-green-700 text-sm leading-relaxed prose prose-sm max-w-none">
            <ReactMarkdown>{renderVal(report.verdict)}</ReactMarkdown>
          </div>
        </div>

        {/* Risk Radar */}
        {analysis.riskRadar && (
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <RiskRadar data={analysis.riskRadar} />
          </div>
        )}

        {/* Roadmap */}
        {analysis.roadmap && (
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <Roadmap data={analysis.roadmap} />
          </div>
        )}

        {/* Business Model */}
        {analysis.businessModel && (
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <BusinessModel data={analysis.businessModel} />
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl">
          <h3 className="font-bold mb-4 text-blue-800 flex items-center gap-2"><Lightbulb className="w-5 h-5" /> Market Validation Questions</h3>
          <p className="text-blue-600 text-xs mb-3">Ask these questions to potential customers to validate your idea:</p>
          <ul className="space-y-2">
            {generateValidationQuestions(analysis.idea).map((q, i) => (
              <li key={i} className="flex items-start gap-2 text-blue-700 text-sm">
                <span className="font-bold shrink-0">{i + 1}.</span> {q}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Chat Panel */}
      {chatOpen && (
        <div className="fixed bottom-4 right-4 w-80 bg-white rounded-2xl shadow-2xl border flex flex-col" style={{ height: '420px' }}>
          <div className="bg-purple-500 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span className="font-medium text-sm">Ask about this analysis</span>
            </div>
            <button onClick={() => setChatOpen(false)} className="text-purple-200 hover:text-white text-lg leading-none">×</button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {chatMessages.length === 0 && (
              <div className="text-center text-gray-400 text-xs mt-4 space-y-2">
                <p>Ask anything about your analysis!</p>
                <div className="space-y-1">
                  {['What is the biggest risk?', 'How to get first 100 users?', 'What should I build first?'].map(q => (
                    <button key={q} onClick={() => setChatInput(q)} className="block w-full text-left text-xs bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg text-gray-600 transition">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {chatMessages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${m.role === 'user' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                  {m.role === 'assistant' ? (
                    <div className="prose prose-xs max-w-none">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : m.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-3 py-2 rounded-xl">
                  <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="p-3 border-t flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendChat()}
              placeholder="Ask a question..."
              className="flex-1 text-xs border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-400"
            />
            <button onClick={sendChat} disabled={chatLoading} className="bg-purple-500 text-white p-2 rounded-lg hover:bg-purple-600 disabled:opacity-50">
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function generateValidationQuestions(idea: string): string[] {
  const safeIdea = idea.replace(/[<>"'`]/g, '').slice(0, 100)
  return [
    `What is the biggest challenge you face related to ${safeIdea}?`,
    'How are you currently solving this problem?',
    'How much time/money do you spend on this problem monthly?',
    'Would you pay for a solution? How much?',
    'What features would make this a must-have for you?',
    'Who else in your network has this problem?',
    'What would make you switch from your current solution?',
  ]
}
