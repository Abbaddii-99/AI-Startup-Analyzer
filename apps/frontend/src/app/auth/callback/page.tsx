'use client'

import { useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { Loader2 } from 'lucide-react'
import api from '@/lib/api'

function CallbackHandler() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)

  useEffect(() => {
    // Tokens are now delivered via HttpOnly cookies by the backend.
    // Fetch the current user profile to confirm auth succeeded.
    api.get('/auth/me')
      .then(({ data }) => {
        setAuth(data.accessToken ?? '', '', data.user ?? null)
        router.push('/')
      })
      .catch(() => router.push('/auth/login'))
  }, [router, setAuth])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto" />
        <p className="text-gray-500 text-sm">Logging you in...</p>
      </div>
    </div>
  )
}

export default function CallbackPage() {
  return (
    <Suspense>
      <CallbackHandler />
    </Suspense>
  )
}
