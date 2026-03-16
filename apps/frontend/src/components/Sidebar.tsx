'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard, Search, ChevronDown, ChevronRight,
  Users, Swords, BarChart2, Briefcase, Rocket, Shield,
  DollarSign, Palette, FileText, Wallet, MoreHorizontal,
  ArrowLeft, Lock, Sparkles
} from 'lucide-react'

export type SidebarSection =
  | 'summary'
  | 'customers'
  | 'competition'
  | 'market'
  | 'business-model'
  | 'mvp'
  | 'risk'
  | 'financial'
  | 'brand'
  | 'business-plan'
  | 'budget'

interface SidebarProps {
  active: SidebarSection
  onChange: (section: SidebarSection) => void
  projectName: string
  userEmail: string
  userPlan: 'FREE' | 'PRO' | 'TEAM'
}

const analysisSubItems: { key: SidebarSection; label: string; icon: React.ReactNode; pro?: boolean }[] = [
  { key: 'customers',       label: 'Customers',        icon: <Users className="w-3.5 h-3.5" /> },
  { key: 'competition',     label: 'Competition',       icon: <Swords className="w-3.5 h-3.5" /> },
  { key: 'market',          label: 'Market Potential',  icon: <BarChart2 className="w-3.5 h-3.5" /> },
  { key: 'business-model',  label: 'Business Model',    icon: <Briefcase className="w-3.5 h-3.5" /> },
  { key: 'mvp',             label: 'MVP',               icon: <Rocket className="w-3.5 h-3.5" /> },
  { key: 'risk',            label: 'Risk Assessment',   icon: <Shield className="w-3.5 h-3.5" /> },
  { key: 'financial',       label: 'Financial Plan',    icon: <DollarSign className="w-3.5 h-3.5" />, pro: true },
]

export default function Sidebar({ active, onChange, projectName, userEmail, userPlan }: SidebarProps) {
  const router = useRouter()
  const [analysisOpen, setAnalysisOpen] = useState(
    ['customers','competition','market','business-model','mvp','risk','financial'].includes(active)
  )

  const isAnalysisChild = analysisSubItems.some(i => i.key === active)

  const navItem = (
    key: SidebarSection,
    label: string,
    icon: React.ReactNode,
    pro?: boolean
  ) => {
    const isActive = active === key
    const locked = pro && userPlan === 'FREE'
    return (
      <button
        key={key}
        onClick={() => !locked && onChange(key)}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition text-left
          ${isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}
          ${locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span className={isActive ? 'text-blue-600' : 'text-gray-400'}>{icon}</span>
        <span className="flex-1">{label}</span>
        {locked && <Lock className="w-3 h-3 text-gray-400" />}
      </button>
    )
  }

  return (
    <aside className="w-56 shrink-0 h-screen sticky top-0 bg-white border-r border-gray-100 flex flex-col overflow-y-auto">
      {/* Back button */}
      <div className="p-3 border-b border-gray-100">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-800 transition w-full px-2 py-1.5 rounded-lg hover:bg-gray-50"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          جميع الأفكار
        </button>
      </div>

      {/* Project name */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {projectName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-800 truncate">{projectName}</p>
            <p className="text-[10px] text-gray-400">تحليل الفكرة</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {/* ملخص */}
        {navItem('summary', 'ملخص', <LayoutDashboard className="w-4 h-4" />)}

        {/* تحليل - collapsible */}
        <div>
          <button
            onClick={() => setAnalysisOpen(!analysisOpen)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition
              ${isAnalysisChild && !analysisOpen ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}
            `}
          >
            <Search className={`w-4 h-4 ${isAnalysisChild && !analysisOpen ? 'text-blue-600' : 'text-gray-400'}`} />
            <span className="flex-1 text-left">تحليل</span>
            {analysisOpen
              ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            }
          </button>

          {analysisOpen && (
            <div className="mt-1 ml-3 pl-3 border-l border-gray-100 space-y-0.5">
              {analysisSubItems.map(item =>
                navItem(item.key, item.label, item.icon, item.pro)
              )}
            </div>
          )}
        </div>

        {/* ماركة */}
        {navItem('brand', 'ماركة', <Palette className="w-4 h-4" />)}

        {/* خطة العمل */}
        {navItem('business-plan', 'خطة العمل', <FileText className="w-4 h-4" />)}

        {/* بجفذ */}
        {navItem('budget', 'بجفذ', <Wallet className="w-4 h-4" />)}

        {/* أكثر */}
        <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-50 transition">
          <MoreHorizontal className="w-4 h-4" />
          <span>أكثر</span>
        </button>
      </nav>

      {/* User info + upgrade */}
      <div className="p-3 border-t border-gray-100 space-y-2">
        {userPlan === 'FREE' && (
          <button className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-semibold py-2 rounded-lg hover:opacity-90 transition">
            <Sparkles className="w-3.5 h-3.5" />
            قم بترقية خطتك
          </button>
        )}
        <div className="flex items-center gap-2 px-1">
          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-gray-500 truncate">{userEmail}</p>
            <p className="text-[10px] text-gray-400">خطة {userPlan === 'FREE' ? 'مجانية' : userPlan}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
