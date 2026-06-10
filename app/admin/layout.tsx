'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Activity, Calendar, CreditCard, FileText, LogOut, Pill, Plus, Search, Stethoscope, Users, UserPlus, Bell, Menu, X
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { getRoleHome } from '@/lib/auth'

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: Activity },
  { label: 'Patients', href: '/admin/patients', icon: Users },
  { label: 'Appointments', href: '/admin/appointments', icon: Calendar },
  { label: 'Doctors', href: '/admin/doctors', icon: Stethoscope },
  { label: 'Pharmacy', href: '/admin/pharmacy', icon: Pill },
  { label: 'Billing', href: '/admin/billing', icon: CreditCard },
  { label: 'Reports', href: '/admin/reports', icon: FileText },
  { label: 'Users', href: '/admin/users', icon: UserPlus },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { session, logout, isLoading } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isLoading) return
    if (!session) { router.push('/login'); return }
    if (session.role !== 'ADMIN') {
      router.push(session.userType === 'patient' ? '/patient/dashboard' : getRoleHome(session.role))
    }
  }, [isLoading, router, session])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (isLoading || !session || session.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-[--bg] flex items-center justify-center">
        <div className="space-y-3 w-full max-w-sm px-4">
          <div className="h-4 bg-[--surface-2] rounded animate-pulse w-1/2" />
          <div className="h-8 bg-[--surface-2] rounded animate-pulse w-3/4" />
          <div className="h-24 bg-[--surface-2] rounded animate-pulse" />
        </div>
      </div>
    )
  }

  const currentLabel = navItems.find((item) => pathname.startsWith(item.href))?.label || 'Dashboard'

  return (
    <div className="min-h-screen bg-[--bg]">
      {/* Mobile backdrop */}
      {isOpen && (
        <button aria-label="Close menu" className="fixed inset-0 z-40 bg-black/20 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar-nav fixed inset-y-0 left-0 z-50 w-[220px] flex flex-col transition-transform duration-200 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="h-14 flex items-center gap-2.5 px-5 border-b border-[--border]">
          <div className="w-7 h-7 rounded-lg bg-[--accent] flex items-center justify-center shrink-0">
            <Stethoscope className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[13px] font-semibold text-[--text-1]">MedCore</span>
        </div>

        <div className="px-3 py-4 border-b border-[--border]">
          <div className="px-2">
            <p className="text-[12px] text-[--text-3]">Admin</p>
            <p className="text-[13px] font-medium text-[--text-1] mt-0.5 truncate">{session.name}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname.startsWith(item.href)
            return (
              <button
                key={item.href}
                onClick={() => { router.push(item.href); setIsOpen(false) }}
                className={`sidebar-nav-item flex items-center gap-3 !mx-2 w-full ${active ? 'active' : ''}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
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
        {/* Topbar */}
        <header className="bg-[--surface] border-b border-[--border] h-14 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-1.5 rounded-lg hover:bg-[--surface-2]" onClick={() => setIsOpen(true)} aria-label="Open menu">
              <Menu className="w-4 h-4 text-[--text-2]" />
            </button>
            <div className="hidden sm:block relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[--text-3]" />
              <input className="w-[240px] bg-[--surface-2] rounded-lg pl-8 pr-3 py-1.5 text-[13px] text-[--text-1] placeholder:text-[--text-3] outline-none" placeholder="Search..." />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-[--text-3] hidden sm:block">{session.name}</span>
            <button className="relative p-1.5 rounded-lg hover:bg-[--surface-2]">
              <Bell className="w-4 h-4 text-[--text-2]" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[--danger]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-[--accent-soft] flex items-center justify-center text-[--accent] font-semibold text-[13px]">
              {session.name.charAt(0)}
            </div>
          </div>
        </header>

        <main className="px-4 lg:px-6 py-6 max-w-[1400px]">
          {children}
        </main>
      </div>
    </div>
  )
}
