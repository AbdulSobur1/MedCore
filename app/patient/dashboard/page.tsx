'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { LogOut, Calendar, FileText, Heart, Pill, CreditCard, Plus } from 'lucide-react'
import { getRoleHome } from '@/lib/auth'

export default function PatientDashboard() {
  const router = useRouter()
  const { session, logout, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !session) {
      router.push('/auth/landing')
      return
    }
    if (!isLoading && session?.userType === 'staff') {
      router.push(getRoleHome(session.role))
    }
  }, [session, isLoading, router])

  if (isLoading || !session || session.userType !== 'patient') {
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
      <header className="border-b border-white/50 bg-card sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light tracking-tight text-foreground">Patient Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome, {session.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 text-foreground glass-sm hover:bg-white/40 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="bg-card border border-white/50 rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">Patient ID</p>
            <p className="break-all text-xl font-light text-foreground">{session.userId}</p>
          </div>

          <div className="bg-card border border-white/50 rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">Email</p>
            <p className="break-all text-lg font-medium text-foreground">{session.email}</p>
          </div>

          <div className="bg-card border border-white/50 rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <p className="font-medium text-foreground">Active</p>
            </div>
          </div>

          <div className="bg-card border border-white/50 rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">Blood Type</p>
            <p className="text-lg font-medium text-foreground">Available after profile sync</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-light tracking-tight text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Appointments */}
            <div className="bg-card border border-white/50 rounded-lg p-6 hover:border-primary/50 transition-colors cursor-pointer">
              <Calendar className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-medium text-foreground mb-1">Appointments</h3>
              <p className="text-sm text-muted-foreground">View and manage your appointments</p>
            </div>

            {/* Medical Records */}
            <div className="bg-card border border-white/50 rounded-lg p-6 hover:border-primary/50 transition-colors cursor-pointer">
              <FileText className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-medium text-foreground mb-1">Medical Records</h3>
              <p className="text-sm text-muted-foreground">Access your health documents</p>
            </div>

            {/* Health Status */}
            <div className="bg-card border border-white/50 rounded-lg p-6 hover:border-primary/50 transition-colors cursor-pointer">
              <Heart className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-medium text-foreground mb-1">Health Status</h3>
              <p className="text-sm text-muted-foreground">View your health metrics</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-card border border-white/50 rounded-lg p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-medium text-foreground">Upcoming Appointments</h3>
              <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
                <Plus className="h-4 w-4" />
                Book
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="rounded-lg bg-muted p-3">
                <p className="font-medium text-foreground">General consultation</p>
                <p className="text-muted-foreground">No confirmed appointment yet</p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <p className="font-medium text-foreground">Annual wellness check</p>
                <p className="text-muted-foreground">Recommended for active patients</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-white/50 rounded-lg p-6">
            <h3 className="mb-4 font-medium text-foreground">Care Summary</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-muted p-3">
                <Pill className="mb-2 h-5 w-5 text-primary" />
                <p className="font-medium text-foreground">Prescriptions</p>
                <p className="text-sm text-muted-foreground">No active prescriptions</p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <CreditCard className="mb-2 h-5 w-5 text-primary" />
                <p className="font-medium text-foreground">Invoices</p>
                <p className="text-sm text-muted-foreground">No outstanding bills</p>
              </div>
              <div className="rounded-lg bg-muted p-3 sm:col-span-2">
                <FileText className="mb-2 h-5 w-5 text-primary" />
                <p className="font-medium text-foreground">Medical History</p>
                <p className="text-sm text-muted-foreground">Your personal medical records will appear here once connected to Neon.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
