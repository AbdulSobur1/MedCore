'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Bell, Calendar, CreditCard, FileText, LayoutDashboard, LogOut, Menu, Pill, Search, User, X } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { getRoleHome } from '@/lib/auth'

const navItems = [
  { label: 'Dashboard', href: '/patient/dashboard', icon: LayoutDashboard },
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading patient portal...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {isOpen && <button aria-label="Close menu" className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setIsOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-200 md:w-16 lg:w-64 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="border-b border-sidebar-border px-5 py-6 md:px-0 lg:px-5">
          <div className="md:flex md:justify-center lg:block">
            <h1 className="text-2xl font-light tracking-tight text-sidebar-foreground md:text-xl lg:text-2xl">{session.name.slice(0, 1)}</h1>
            <div className="hidden lg:block">
              <p className="mt-1 text-sm font-medium text-sidebar-foreground">{session.name}</p>
              <p className="text-xs text-sidebar-foreground/60">Patient</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors md:justify-center lg:justify-start ${
                  active ? 'bg-primary text-primary-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="md:hidden lg:inline">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-sidebar-border px-3 py-4">
          <button onClick={handleLogout} title="Logout" className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent md:justify-center lg:justify-start">
            <LogOut className="h-5 w-5 shrink-0" />
            <span className="md:hidden lg:inline">Logout</span>
          </button>
        </div>
      </aside>

      <div className="md:pl-16 lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card px-4 lg:px-8">
          <button className="rounded-lg p-2 hover:bg-muted md:hidden" onClick={() => setIsOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <button className="rounded-lg p-2 hover:bg-muted sm:hidden" onClick={() => setSearchOpen((value) => !value)} aria-label="Search">
            {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>
          <div className={`${searchOpen ? 'block flex-1' : 'hidden'} sm:block sm:flex-1 sm:min-w-0 sm:max-w-sm`}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input className="w-full rounded-lg border border-border bg-muted py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary" placeholder="Search..." />
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="relative rounded-lg p-2 hover:bg-muted" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
              {session.name.slice(0, 1)}
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
