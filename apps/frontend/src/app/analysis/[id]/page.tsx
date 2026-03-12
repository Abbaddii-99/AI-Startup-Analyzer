'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import api from '@/lib/api'
import { Loader2, TrendingUp, Users, DollarSign, Zap } from 'lucide-react'

export default function AnalysisPage() {
  const params = useParams()
  const [analysis, setAnalysis] = useState<any>(null)
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const { data } = await api.get(`/analysis/${params.id}`)
        setAnalysis(data)
        
        if (data.status === 'COMPLETED') {
          setLoading(false)
        } else {
          pollProgress()
        }
      } catch (error) {
        console.error('Error:', error)
        setLoading(false)
      }
    }

    const pollProgress = async () => {
      const interval = setInterval(async () => {
        try {
          const { data: progressData } = await api.get(`/analysis/${params.id}/progress`)
          setProgress(progressData.progress || 0)
          
          if (progressData.status === 'COMPLETED') {
            clearInterval(interval)
            const { data } = await api.get(`/analysis/${params.id}`)
            setAnalysis(data)
            setLoading(false)
          }
        } catch (error) {
          clearInterval(interval)
        }
      }, 2000)
    }

    fetchAnalysis()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-500" />
          <h2 className="text-2xl font-bold">Analyzing Your Idea...</h2>
          <div className="w-64 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-gray-600">{progress}% Complete</p>
        </div>
      </div>
    )
  }

  if (!analysis || !analysis.finalReport) {
    return <div className="min-h-screen flex items-center justify-center">No data available</div>
  }

  const report = analysis.finalReport

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Analysis Complete</h1>
          <p className="text-gray-600">{analysis.idea}</p>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ScoreCard 
            icon={<TrendingUp />}
            title="Market Demand"
            score={report.score.marketDemand}
          />
          <ScoreCard 
            icon={<Users />}
            title="Competition"
            score={report.score.competition}
          />
          <ScoreCard 
            icon={<Zap />}
            title="Execution"
            score={report.score.executionDifficulty}
          />
          <ScoreCard 
            icon={<DollarSign />}
            title="Profit Potential"
            score={report.score.profitPotential}
          />
        </div>

        {/* Overall Score */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-2">Overall Score</h2>
          <div className="text-6xl font-bold">{report.score.overall}/10</div>
        </div>

        {/* Report Sections */}
        <ReportSection title="Idea Summary" content={report.ideaSummary} />
        <ReportSection title="Problem" content={report.problem} />
        <ReportSection title="Target Market" content={report.targetMarket} />
        <ReportSection title="Market Analysis" content={report.marketAnalysis} />
        <ReportSection title="Competitors" content={report.competitors} />
        <ReportSection title="MVP Plan" content={report.mvp} />
        <ReportSection title="Monetization" content={report.monetization} />
        <ReportSection title="Go-To-Market" content={report.goToMarket} />
        
        <div className="bg-red-50 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4 text-red-800">Risks</h3>
          <ul className="list-disc list-inside space-y-2">
            {report.risks.map((risk: string, i: number) => (
              <li key={i} className="text-red-700">{risk}</li>
            ))}
          </ul>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4 text-green-800">Final Verdict</h3>
          <p className="text-green-700">{report.verdict}</p>
        </div>
      </div>
    </div>
  )
}

function ScoreCard({ icon, title, score }: any) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-2">
        <div className="text-blue-500">{icon}</div>
        <span className="text-2xl font-bold">{score}/10</span>
      </div>
      <h3 className="text-sm text-gray-600">{title}</h3>
    </div>
  )
}

function ReportSection({ title, content }: any) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-gray-700 whitespace-pre-wrap">{content}</p>
    </div>
  )
}
