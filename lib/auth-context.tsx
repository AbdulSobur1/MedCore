'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session, getSession, setSession, clearSession, initializeSuperAdmin } from './auth'

interface AuthContextType {
  session: Session | null
  isLoading: boolean
  login: (session: Session) => void
  logout: () => void
  isPatient: boolean
  isStaff: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    queueMicrotask(() => {
      initializeSuperAdmin()
      const session = getSession()
      setSessionState(session)
      setIsLoading(false)
    })
  }, [])

  const login = (newSession: Session) => {
    setSession(newSession)
    setSessionState(newSession)
  }

  const logout = () => {
    clearSession()
    setSessionState(null)
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        login,
        logout,
        isPatient: session?.userType === 'patient',
        isStaff: session?.userType === 'staff',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
