'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { LogOut, Users, Calendar, Pill, DollarSign, FileText } from 'lucide-react'
import { DashboardSection } from '@/components/dashboard-section'
import { PatientsSection } from '@/components/patients-section'
import { AppointmentsSection } from '@/components/appointments-section'
import { DoctorsSection } from '@/components/doctors-section'
import { PharmacySection } from '@/components/pharmacy-section'
import { BillingSection } from '@/components/billing-section'
import { ReportsSection } from '@/components/reports-section'
import { AdminSection } from '@/components/admin-section'

export default function StaffDashboard() {
  const router = useRouter()
  const { session, logout, isLoading } = useAuth()
  const [activeSection, setActiveSection] = useState('dashboard')

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

  // Define available sections based on role
  const getAvailableSections = () => {
    const baseSection = [
      { id: 'dashboard', label: 'Dashboard', icon: FileText },
    ]

    const roleBasedSections: Record<string, typeof baseSection> = {
      admin: [
        ...baseSection,
        { id: 'patients', label: 'Patients', icon: Users },
        { id: 'appointments', label: 'Appointments', icon: Calendar },
        { id: 'doctors', label: 'Staff', icon: Users },
        { id: 'pharmacy', label: 'Pharmacy', icon: Pill },
        { id: 'billing', label: 'Billing', icon: DollarSign },
        { id: 'reports', label: 'Reports', icon: FileText },
        { id: 'admin', label: 'Administration', icon: Users },
      ],
      doctor: [
        ...baseSection,
        { id: 'patients', label: 'Patients', icon: Users },
        { id: 'appointments', label: 'Appointments', icon: Calendar },
      ],
      pharmacist: [
        ...baseSection,
        { id: 'pharmacy', label: 'Pharmacy', icon: Pill },
      ],
      receptionist: [
        ...baseSection,
        { id: 'patients', label: 'Patients', icon: Users },
        { id: 'appointments', label: 'Appointments', icon: Calendar },
      ],
      accountant: [
        ...baseSection,
        { id: 'billing', label: 'Billing', icon: DollarSign },
        { id: 'reports', label: 'Reports', icon: FileText },
      ],
    }

    return roleBasedSections[session.role || 'doctor'] || baseSection
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection />
      case 'patients':
        return <PatientsSection />
      case 'appointments':
        return <AppointmentsSection />
      case 'doctors':
        return <DoctorsSection />
      case 'pharmacy':
        return <PharmacySection />
      case 'billing':
        return <BillingSection />
      case 'reports':
        return <ReportsSection />
      case 'admin':
        return <AdminSection />
      default:
        return <DashboardSection />
    }
  }

  const sections = getAvailableSections()

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-sidebar border-b lg:border-b-0 lg:border-r border-white/50 p-4 lg:p-6">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-light tracking-tight text-foreground">MedCore</h1>
            <p className="text-xs text-muted-foreground mt-2">Staff Dashboard</p>
          </div>

          {/* User Info */}
          <div className="p-4 bg-card border border-white/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Logged in as</p>
            <p className="font-medium text-foreground text-sm">{session.name}</p>
            <p className="text-xs text-muted-foreground mt-1 capitalize">{session.role}</p>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {sections.map((section) => {
              const Icon = section.icon
              const isActive = activeSection === section.id
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-white/30'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{section.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-foreground hover:bg-white/30 transition-colors font-medium text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        {renderSection()}
      </main>
    </div>
  )
}
