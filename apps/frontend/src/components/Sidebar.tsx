'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard, TrendingUp, Users, Globe, Briefcase, Cpu,
  AlertTriangle, Map, DollarSign, Palette, Eye, ChevronDown,
  ChevronRight, Sparkles, LogOut, MessageCircle, Lock
} from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/lib/store'

interface SidebarSection {
  id: string
  label: string
  icon: React.ReactNode
  pro?: boolean
  children?: { id: string; label: string; icon: React.ReactNode }[]
}

const SECTIONS: SidebarSection[] = [
  { id: 'summary', label: 'Summary', icon: <LayoutDashboard className="w-4 h-4" /> },
  {
    id: 'analysis', label: 'Analysis', icon: <TrendingUp className="w-4 h-4" />,
    children: [
      { id: 'target-audience', label: 'Customers', icon: <Users className="w-4 h-4" /> },
      { id: 'market-size', label: 'Market Potential', icon: <Globe className="w-4 h-4" /> },
      { id: 'competitors', label: 'Competition', icon: <Briefcase className="w-4 h-4" /> },
      { id: 'mvp', label: 'MVP', icon: <Cpu className="w-4 h-4" /> },
      { id: 'business-model', label: 'Business Model', icon: <DollarSign className="w-4 h-4" /> },
      { id: 'risks', label: 'Risk Assessment', icon: <AlertTriangle className="w-4 h-4" /> },
    ],
  },
  { id: 'roadmap', label: 'Roadmap', icon: <Map className="w-4 h-4" /> },
  { id: 'brand', label: 'Brand', icon: <Palette className="w-4 h-4" /> },
  { id: 'vision', label: 'Vision & Mission', icon: <Eye className="w-4 h-4" /> },
  { id: 'budget', label: 'Budget', icon: <DollarSign className="w-4 h-4" /> },
  { id: 'financial-plan', label: 'Financial Plan', icon: <DollarSign className="w-4 h-4" />, pro: true },
]

interface SidebarProps {
  analysis: any
  activeSection: string
  onSectionClick: (id: string) => void
  onChatOpen: () => void
}

export default function Sidebar({ analysis, activeSection, onSectionClick, onChatOpen }: SidebarProps) {
  const router = useRouter()
  const { user, refreshToken, logout: storeLogout } = useAuthStore()
  const [analysisExpanded, setAnalysisExpanded] = useState(true)

  const logout = async () => {
    if (refreshToken) {
      try { await api.post('/auth/logout', { refreshToken }) } catch {}
    }
    storeLogout()
    // Clear any leftover localStorage tokens (backwards compat)
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    router.push('/auth/login')
  }

  const isActive = (id: string) => activeSection === id
  const isChildActive = (section: SidebarSection) =>
    section.children?.some(c => c.id === activeSection)

  return (
    <aside className="w-56 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="p-4 border-b border-gray-800">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-white hover:text-blue-400 transition w-full"
        >
          <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />
          <span className="font-bold text-sm truncate">AI Startup Analyzer</span>
        </button>
      </div>

      {/* Back to dashboard */}
      <div className="px-3 pt-3">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition px-2 py-1.5 rounded-lg hover:bg-gray-800 w-full"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          All Ideas
        </button>
      </div>

      {/* Idea title */}
      {analysis?.idea && (
        <div className="px-3 pt-2 pb-3 border-b border-gray-800">
          <p className="text-xs text-gray-500 px-2 mb-1">Current idea</p>
          <p className="text-xs text-gray-300 px-2 line-clamp-2 leading-relaxed">{analysis.idea}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {SECTIONS.map((section) => {
          if (section.children) {
            const expanded = analysisExpanded || isChildActive(section)
            return (
              <div key={section.id}>
                <button
                  onClick={() => {
                    setAnalysisExpanded(!expanded)
                    onSectionClick(section.id)
                  }}
                  className={`flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm transition ${
                    isActive(section.id) || isChildActive(section)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {section.icon}
                  <span className="flex-1 text-left">{section.label}</span>
                  {expanded
                    ? <ChevronDown className="w-3 h-3" />
                    : <ChevronRight className="w-3 h-3" />
                  }
                </button>
                {expanded && (
                  <div className="ml-3 mt-0.5 space-y-0.5 border-l border-gray-700 pl-3">
                    {section.children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => onSectionClick(child.id)}
                        className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs transition ${
                          isActive(child.id)
                            ? 'bg-blue-600/80 text-white'
                            : 'text-gray-500 hover:text-white hover:bg-gray-800'
                        }`}
                      >
                        {child.icon}
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          return (
            <button
              key={section.id}
              onClick={() => !section.pro && onSectionClick(section.id)}
              disabled={section.pro}
              className={`flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm transition ${
                section.pro
                  ? 'text-gray-600 cursor-not-allowed opacity-60'
                  : isActive(section.id)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {section.icon}
              <span className="flex-1 text-left">{section.label}</span>
              {section.pro && (
                <span className="flex items-center gap-1 text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full">
                  <Lock className="w-2.5 h-2.5" /> PRO
                </span>
              )}
            </button>
          )
        })}

        {/* Ask AI button */}
        <button
          onClick={onChatOpen}
          className="flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm text-purple-400 hover:text-white hover:bg-purple-600/30 transition mt-2"
        >
          <MessageCircle className="w-4 h-4" />
          Ask AI
        </button>
      </nav>

      {/* User info */}
      <div className="p-3 border-t border-gray-800">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white truncate">{user?.name ?? user?.email}</p>
            <span className="text-xs text-gray-500 capitalize">{user?.plan?.toLowerCase() ?? 'free'}</span>
          </div>
          <button onClick={logout} className="text-gray-500 hover:text-red-400 transition" title="Logout">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
