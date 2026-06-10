'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { LogOut, Users, Calendar, Pill, DollarSign, FileText, Menu, X, Stethoscope, Activity } from 'lucide-react'
import { DashboardSection } from '@/components/dashboard-section'
import { PatientsSection } from '@/components/patients-section'
import { AppointmentsSection } from '@/components/appointments-section'
import { DoctorsSection } from '@/components/doctors-section'
import { PharmacySection } from '@/components/pharmacy-section'
import { BillingSection } from '@/components/billing-section'
import { ReportsSection } from '@/components/reports-section'
import { AdminSection } from '@/components/admin-section'
import type { StaffProfile } from '@/lib/auth'

type StoredStaffProfile = StaffProfile & { password?: string }

export default function StaffDashboard() {
  const router = useRouter()
  const { session, logout, isLoading } = useAuth()
  const [activeSection, setActiveSection] = useState('dashboard')
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [effectiveIsHeadAdmin, setEffectiveIsHeadAdmin] = useState(false)

  useEffect(() => {
    if (!isLoading && !session) {
      router.push('/login')
    }
  }, [session, isLoading, router])

  useEffect(() => {
    if (!session || session.userType !== 'staff' || session.role !== 'ADMIN') {
      queueMicrotask(() => setEffectiveIsHeadAdmin(false))
      return
    }

    queueMicrotask(() => {
      const staffProfiles = JSON.parse(localStorage.getItem('staffProfiles') || '{}') as Record<string, StoredStaffProfile>
      const staffEntries = Object.entries(staffProfiles)
      const admins = staffEntries.filter(([, staff]) => staff.role === 'ADMIN')
      const hasHeadAdmin = admins.some(([, staff]) => staff.isHeadAdmin)
      const currentEntry = staffEntries.find(([id, staff]) => id === session.userId || staff.email === session.email)
      const currentStaff = currentEntry?.[1]

      if (currentStaff?.isHeadAdmin || session.isHeadAdmin) {
        setEffectiveIsHeadAdmin(true)
        return
      }

      if (!hasHeadAdmin && currentEntry) {
        const [currentId, currentProfile] = currentEntry
        staffProfiles[currentId] = { ...currentProfile, isHeadAdmin: true }
        localStorage.setItem('staffProfiles', JSON.stringify(staffProfiles))
        localStorage.setItem('medcore_session', JSON.stringify({ ...session, isHeadAdmin: true }))
        setEffectiveIsHeadAdmin(true)
        return
      }

      setEffectiveIsHeadAdmin(false)
    })
  }, [session])

  if (isLoading || !session) {
    return (
      <div className="min-h-screen bg-[--bg] flex items-center justify-center">
        <p className="text-[--text-3]">Loading...</p>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const getAvailableSections = () => {
    const baseSection = [
      { id: 'dashboard', label: 'Dashboard', icon: FileText },
    ]

    const roleBasedSections: Record<string, typeof baseSection> = {
      ADMIN: [
        ...baseSection,
        { id: 'patients', label: 'Patients', icon: Users },
        { id: 'appointments', label: 'Appointments', icon: Calendar },
        { id: 'doctors', label: 'Staff', icon: Users },
        { id: 'pharmacy', label: 'Pharmacy', icon: Pill },
        { id: 'billing', label: 'Billing', icon: DollarSign },
        { id: 'reports', label: 'Reports', icon: FileText },
        { id: 'admin', label: 'Administration', icon: Users },
      ],
      DOCTOR: [
        ...baseSection,
        { id: 'patients', label: 'Patients', icon: Users },
        { id: 'appointments', label: 'Appointments', icon: Calendar },
      ],
      PHARMACIST: [
        ...baseSection,
        { id: 'pharmacy', label: 'Pharmacy', icon: Pill },
      ],
      RECEPTIONIST: [
        ...baseSection,
        { id: 'patients', label: 'Patients', icon: Users },
        { id: 'appointments', label: 'Appointments', icon: Calendar },
      ],
      ACCOUNTANT: [
        ...baseSection,
        { id: 'billing', label: 'Billing', icon: DollarSign },
        { id: 'reports', label: 'Reports', icon: FileText },
      ],
    }

    return roleBasedSections[session.role || 'DOCTOR'] || baseSection
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <DashboardSection />
      case 'patients': return <PatientsSection />
      case 'appointments': return <AppointmentsSection />
      case 'doctors': return <DoctorsSection />
      case 'pharmacy': return <PharmacySection />
      case 'billing': return <BillingSection />
      case 'reports': return <ReportsSection />
      case 'admin': return <AdminSection isHeadAdmin={effectiveIsHeadAdmin} />
      default: return <DashboardSection />
    }
  }

  const sections = getAvailableSections()
  const activeSectionLabel = sections.find((s) => s.id === activeSection)?.label || 'Dashboard'

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId)
    setIsMobileNavOpen(false)
  }

  return (
    <div className="min-h-screen bg-[--bg]">
      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-[--surface] border-b border-[--border] px-4 h-14 lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[--accent] flex items-center justify-center">
            <Stethoscope className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[13px] font-semibold text-[--text-1]">MedCore</span>
        </div>
        <button onClick={() => setIsMobileNavOpen((open) => !open)} className="p-1.5 rounded-lg hover:bg-[--surface-2]" aria-label="Toggle navigation">
          {isMobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </header>

      {/* Mobile backdrop */}
      {isMobileNavOpen && (
        <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => setIsMobileNavOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar-nav fixed inset-y-0 left-0 z-40 w-[220px] flex flex-col transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0 ${
        isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-14 flex items-center gap-2.5 px-5 border-b border-[--border]">
          <div className="w-7 h-7 rounded-lg bg-[--accent] flex items-center justify-center shrink-0">
            <Stethoscope className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[13px] font-semibold text-[--text-1]">MedCore</span>
        </div>

        <div className="px-3 py-4 border-b border-[--border]">
          <div className="px-2">
            <p className="text-[12px] text-[--text-3]">Logged in as</p>
            <p className="text-[13px] font-medium text-[--text-1] mt-0.5">{session.name}</p>
            <p className="caption capitalize">{session.role?.toLowerCase()}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 space-y-0.5">
          {sections.map((section) => {
            const Icon = section.icon
            const isActive = activeSection === section.id
            return (
              <button
                key={section.id}
                onClick={() => handleNavigate(section.id)}
                className={`sidebar-nav-item flex items-center gap-3 !mx-2 w-full ${isActive ? 'active' : ''}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{section.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="border-t border-[--border] py-2">
          <button onClick={handleLogout} className="sidebar-nav-item flex items-center gap-3 !mx-2 w-full">
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-[220px]">
        <main className="px-4 lg:px-6 py-6 max-w-[1400px]">
          {renderSection()}
        </main>
      </div>
    </div>
  )
}
