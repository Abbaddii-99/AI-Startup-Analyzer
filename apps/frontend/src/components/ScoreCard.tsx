interface ScoreCardProps {
  score: number
  label: string
  icon: React.ReactNode
  size?: 'sm' | 'lg'
}

export function scoreColor(score: number) {
  if (score >= 7) return 'text-green-600'
  if (score >= 5) return 'text-yellow-600'
  return 'text-red-600'
}

export function scoreBg(score: number) {
  if (score >= 7) return 'bg-green-50 border-green-200'
  if (score >= 5) return 'bg-yellow-50 border-yellow-200'
  return 'bg-red-50 border-red-200'
}

export function ScoreCard({ score, label, icon, size = 'lg' }: ScoreCardProps) {
  return (
    <div className={`rounded-xl border ${scoreBg(score)} ${size === 'lg' ? 'p-5' : 'p-3'}`}>
      <div className={`mb-2 ${scoreColor(score)}`}>{icon}</div>
      <div className={`font-bold ${scoreColor(score)} ${size === 'lg' ? 'text-3xl' : 'text-xl'}`}>
        {score}
        <span className="text-sm font-normal text-gray-400">/10</span>
      </div>
      <div className={`text-gray-600 mt-1 ${size === 'lg' ? 'text-sm' : 'text-xs'}`}>{label}</div>
    </div>
  )
}

export function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, string> = {
    PRO:  'bg-purple-100 text-purple-700',
    TEAM: 'bg-blue-100 text-blue-700',
    FREE: 'bg-gray-100 text-gray-600',
  }
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${styles[plan] ?? styles.FREE}`}>
      {plan}
    </span>
  )
}
