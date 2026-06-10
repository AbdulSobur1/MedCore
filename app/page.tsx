'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Loader } from 'lucide-react'
import { getRoleHome } from '@/lib/auth'

export default function Home() {
  const router = useRouter()
  const { session, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return

    if (session) {
      if (session.userType === 'patient') {
        router.push('/patient/dashboard')
      } else if (session.userType === 'staff') {
        router.push(getRoleHome(session.role))
      }
    } else {
      router.push('/login')
    }
  }, [session, isLoading, router])

  return (
    <div className="min-h-screen bg-[--bg] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader className="w-6 h-6 animate-spin text-[--accent]" />
        <p className="text-[13px] text-[--text-3]">Loading...</p>
      </div>
    </div>
  )
}
