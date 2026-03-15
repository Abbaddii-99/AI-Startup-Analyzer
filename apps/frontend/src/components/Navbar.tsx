'use client'

import { useRouter } from 'next/navigation'
import { Sparkles, Plus, LogOut, ArrowLeft } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/lib/store'

interface NavbarProps {
  variant?: 'dashboard' | 'analysis' | 'minimal'
  onBack?: () => void
  rightSlot?: React.ReactNode
}

export function Navbar({ variant = 'dashboard', onBack, rightSlot }: NavbarProps) {
  const router = useRouter()
  const { refreshToken, logout: storeLogout } = useAuthStore()

  const logout = async () => {
    if (refreshToken) {
      try { await api.post('/auth/logout', { refreshToken }) } catch {}
    }
    storeLogout()
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    router.push('/auth/login')
  }

  return (
    <nav className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      {variant === 'analysis' ? (
        <button
          onClick={onBack ?? (() => router.push('/dashboard'))}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </button>
      ) : (
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
          <Sparkles className="w-6 h-6 text-blue-500" />
          <span className="font-bold text-lg">AI Startup Analyzer</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        {rightSlot}
        {variant === 'dashboard' && (
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> New Analysis
          </button>
        )}
        {variant !== 'minimal' && (
          <button onClick={logout} className="text-gray-500 hover:text-gray-700 transition" title="Logout">
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </nav>
  )
}
