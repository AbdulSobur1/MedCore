'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { LogOut, Calendar, FileText, Heart } from 'lucide-react'

export default function PatientDashboard() {
  const router = useRouter()
  const { session, logout, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !session) {
      router.push('/auth/landing')
    }
  }, [session, isLoading, router])

  if (isLoading || !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    router.push('/auth/landing')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Topbar */}
      <header className="border-b border-border bg-card sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light tracking-tight text-foreground">Patient Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome, {session.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Patient ID Card */}
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">Patient ID</p>
            <p className="text-2xl font-light text-foreground">{session.userId}</p>
          </div>

          {/* Email */}
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">Email</p>
            <p className="text-lg font-medium text-foreground">{session.email}</p>
          </div>

          {/* Status */}
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <p className="font-medium text-foreground">Active</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-light tracking-tight text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Appointments */}
            <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/40 transition-colors cursor-pointer">
              <Calendar className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-medium text-foreground mb-1">Appointments</h3>
              <p className="text-sm text-muted-foreground">View and manage your appointments</p>
            </div>

            {/* Medical Records */}
            <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/40 transition-colors cursor-pointer">
              <FileText className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-medium text-foreground mb-1">Medical Records</h3>
              <p className="text-sm text-muted-foreground">Access your health documents</p>
            </div>

            {/* Health Status */}
            <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/40 transition-colors cursor-pointer">
              <Heart className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-medium text-foreground mb-1">Health Status</h3>
              <p className="text-sm text-muted-foreground">View your health metrics</p>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 p-6 bg-info/10 border border-info/20 rounded-lg">
          <h3 className="font-medium text-foreground mb-2">Welcome to MedCore</h3>
          <p className="text-sm text-info-foreground">
            This is your patient dashboard. You can view your appointments, medical records, and health information. For any urgent concerns, please contact the hospital directly.
          </p>
        </div>
      </main>
    </div>
  )
}
