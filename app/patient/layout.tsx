'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Bell, Calendar, CreditCard, FileText, LayoutDashboard, LogOut, Menu, Pill, Search, User, X, Stethoscope } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { getRoleHome } from '@/lib/auth'

const navItems = [
  { label: 'Home', href: '/patient/dashboard', icon: LayoutDashboard },
  { label: 'My Records', href: '/patient/records', icon: FileText },
  { label: 'Appointments', href: '/patient/appointments', icon: Calendar },
  { label: 'Prescriptions', href: '/patient/prescriptions', icon: Pill },
  { label: 'My Bills', href: '/patient/billing', icon: CreditCard },
  { label: 'Profile', href: '/patient/profile', icon: User },
]

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { session, logout, isLoading } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    if (isLoading) return
    if (!session) router.push('/login')
    if (session?.userType === 'staff') router.push(getRoleHome(session.role))
  }, [isLoading, router, session])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (isLoading || !session || session.userType !== 'patient') {
    return (
      <div className="min-h-screen bg-[--bg] flex items-center justify-center">
        <p className="text-[--text-3]">Loading patient portal...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[--bg]">
      {/* Mobile backdrop */}
      {isOpen && (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[220px] bg-[--surface] border-r border-[--border] flex flex-col transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo area */}
        <div className="h-14 flex items-center gap-2.5 px-5 border-b border-[--border]">
          <div className="w-7 h-7 rounded-lg bg-[--accent] flex items-center justify-center shrink-0">
            <Stethoscope className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[13px] font-semibold text-[--text-1]">MedCore</span>
        </div>

        {/* Patient info */}
        <div className="px-3 py-4 border-b border-[--border]">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-[--accent-soft] flex items-center justify-center text-[--accent] font-semibold text-[13px] shrink-0">
              {session.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-[--text-1] truncate">{session.name}</p>
              <p className="text-[11px] text-[--text-3]">Patient</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`sidebar-nav-item flex items-center gap-3 !mx-2 ${
                  active ? 'active' : ''
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-[--border] py-2">
          <button
            onClick={handleLogout}
            className="sidebar-nav-item flex items-center gap-3 !mx-2 w-full"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="lg:pl-[220px]">
        {/* Topbar */}
        <header className="bg-[--surface] border-b border-[--border] h-14 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 rounded-lg hover:bg-[--surface-2] transition-colors"
              onClick={() => setIsOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4 text-[--text-2]" />
            </button>

            {/* Search - visible on desktop */}
            <div className="hidden sm:block relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[--text-3]" />
              <input
                className="w-[240px] bg-[--surface-2] rounded-lg pl-8 pr-3 py-1.5 text-[13px] text-[--text-1] placeholder:text-[--text-3] outline-none"
                placeholder="Search..."
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile search */}
            <button
              className="sm:hidden p-1.5 rounded-lg hover:bg-[--surface-2]"
              onClick={() => setSearchOpen((v) => !v)}
            >
              {searchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </button>

            <button className="relative p-1.5 rounded-lg hover:bg-[--surface-2]">
              <Bell className="w-4 h-4 text-[--text-2]" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[--danger]" />
            </button>

            <div className="w-8 h-8 rounded-full bg-[--accent-soft] flex items-center justify-center text-[--accent] font-semibold text-[13px]">
              {session.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="sm:hidden bg-[--surface] border-b border-[--border] px-4 py-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[--text-3]" />
              <input
                className="w-full bg-[--surface-2] rounded-lg pl-8 pr-3 py-1.5 text-[13px] text-[--text-1] placeholder:text-[--text-3] outline-none"
                placeholder="Search..."
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="px-4 lg:px-6 py-6 max-w-[1400px]">
          {children}
        </main>
      </div>
    </div>
  )
}
