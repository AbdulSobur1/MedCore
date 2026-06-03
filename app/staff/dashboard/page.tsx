'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { LogOut, Users, Calendar, Pill, DollarSign, FileText, Menu, X } from 'lucide-react'
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
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

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
        return <AdminSection isHeadAdmin={session.isHeadAdmin} />
      default:
        return <DashboardSection />
    }
  }

  const sections = getAvailableSections()
  const activeSectionLabel = sections.find((section) => section.id === activeSection)?.label || 'Dashboard'

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId)
    setIsMobileNavOpen(false)
  }

  return (
    <div className="min-h-screen bg-background lg:flex">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/50 bg-card px-4 py-3 lg:hidden">
        <div>
          <p className="text-xs text-muted-foreground">MedCore Staff</p>
          <h1 className="text-lg font-semibold text-foreground">{activeSectionLabel}</h1>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileNavOpen((open) => !open)}
          className="glass-sm inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground"
          aria-label="Toggle navigation"
          aria-expanded={isMobileNavOpen}
        >
          {isMobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {isMobileNavOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 max-w-[82vw] bg-sidebar border-r border-white/50 p-4 transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-64 lg:max-w-none lg:translate-x-0 lg:p-6 ${
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
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
                  onClick={() => handleNavigate(section.id)}
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
