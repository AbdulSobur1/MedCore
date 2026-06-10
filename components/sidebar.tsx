'use client'

import { useState } from 'react'
import { LayoutDashboard, Users, Calendar, Pill, DollarSign, BarChart3, Settings, LogOut, Menu, X, Stethoscope } from 'lucide-react'

const NAVIGATION_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, id: 'dashboard' },
  { label: 'Patients', icon: Users, id: 'patients' },
  { label: 'Appointments', icon: Calendar, id: 'appointments' },
  { label: 'Doctors', icon: Stethoscope, id: 'doctors' },
  { label: 'Pharmacy', icon: Pill, id: 'pharmacy' },
  { label: 'Billing', icon: DollarSign, id: 'billing' },
  { label: 'Reports', icon: BarChart3, id: 'reports' },
  { label: 'Admin', icon: Settings, id: 'admin' },
]

export function Sidebar({ activeSection, onNavigate }: { activeSection: string; onNavigate: (id: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleNavigation = (id: string) => {
    onNavigate(id)
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-5 left-5 z-50 lg:hidden p-2 hover:bg-[--surface-2] rounded-lg transition-colors"
        aria-label="Toggle navigation"
      >
        {isOpen ? <X className="w-4 h-4 text-[--text-2]" /> : <Menu className="w-4 h-4 text-[--text-2]" />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/10 z-30 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar-nav fixed left-0 top-0 h-screen w-[220px] z-40 flex flex-col transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo */}
        <div className="h-14 flex items-center gap-2.5 px-5 border-b border-[--border]">
          <div className="w-7 h-7 rounded-lg bg-[--accent] flex items-center justify-center shrink-0">
            <Stethoscope className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[13px] font-semibold text-[--text-1]">MedCore</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-0.5">
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`sidebar-nav-item flex items-center gap-3 !mx-2 w-full ${isActive ? 'active' : ''}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-[--border] py-2 space-y-0.5">
          <button className="sidebar-nav-item flex items-center gap-3 !mx-2 w-full">
            <Settings className="w-4 h-4 shrink-0" />
            <span>Settings</span>
          </button>
          <button className="sidebar-nav-item flex items-center gap-3 !mx-2 w-full">
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Desktop Spacer */}
      <div className="hidden lg:block w-[220px] flex-shrink-0" />
    </>
  )
}
