'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Activity,
  Ban,
  Calendar,
  CreditCard,
  Database,
  FileText,
  LogOut,
  Pill,
  Plus,
  Search,
  ShieldCheck,
  Stethoscope,
  Users,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { generateStaffId, getRoleHome, type PatientProfile, type StaffProfile } from '@/lib/auth'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type StoredStaff = StaffProfile & { password?: string }
type AdminUserRow = {
  id: string
  name: string
  email: string
  role: string
  department: string
  phone: string
  registeredAt: string
  lastLogin: string
  status: 'Active' | 'Inactive'
  isHeadAdmin?: boolean
}

const activityFeed = [
  { label: 'Patient registration completed', detail: 'New patient profile created', time: 'Just now', icon: Users },
  { label: 'Appointment booked', detail: 'Cardiology consultation scheduled', time: '18 min ago', icon: Calendar },
  { label: 'Prescription dispensed', detail: 'Pharmacy completed medication pickup', time: '42 min ago', icon: Pill },
  { label: 'Invoice payment received', detail: 'Outstanding bill partially settled', time: '1 hr ago', icon: CreditCard },
]

export default function AdminDashboardPage() {
  const router = useRouter()
  const { session, logout, isLoading } = useAuth()
  const [patients, setPatients] = useState<PatientProfile[]>([])
  const [staff, setStaff] = useState<StoredStaff[]>([])
  const [query, setQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<AdminUserRow | null>(null)
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false)
  const [effectiveIsHeadAdmin, setEffectiveIsHeadAdmin] = useState(false)
  const [adminFormError, setAdminFormError] = useState('')
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', confirmPassword: '' })

  useEffect(() => {
    if (isLoading) return
    if (!session) {
      router.push('/auth/landing')
      return
    }
    if (session.role !== 'admin') {
      router.push(session.userType === 'patient' ? '/patient/dashboard' : getRoleHome(session.role))
    }
  }, [isLoading, router, session])

  useEffect(() => {
    queueMicrotask(() => {
      const storedPatients = JSON.parse(localStorage.getItem('patients') || '{}') as Record<string, PatientProfile>
      const storedStaff = JSON.parse(localStorage.getItem('staffProfiles') || '{}') as Record<string, StoredStaff>
      const staffEntries = Object.entries(storedStaff)
      const admins = staffEntries.filter(([, member]) => member.role === 'admin')
      const hasHeadAdmin = admins.some(([, member]) => member.isHeadAdmin)
      const currentEntry = staffEntries.find(([id, member]) => id === session?.userId || member.email === session?.email)

      if (session?.role === 'admin' && currentEntry && !hasHeadAdmin) {
        const [currentId, currentProfile] = currentEntry
        storedStaff[currentId] = { ...currentProfile, isHeadAdmin: true, isActive: true }
        localStorage.setItem('staffProfiles', JSON.stringify(storedStaff))
        localStorage.setItem('medcore_session', JSON.stringify({ ...session, isHeadAdmin: true }))
        setEffectiveIsHeadAdmin(true)
      } else {
        setEffectiveIsHeadAdmin(!!session?.isHeadAdmin || session?.userId === 'super-admin-001' || !!currentEntry?.[1].isHeadAdmin)
      }

      setPatients(Object.values(storedPatients))
      setStaff(Object.values(storedStaff))
    })
  }, [session])

  const isHeadAdmin = effectiveIsHeadAdmin

  const users = useMemo<AdminUserRow[]>(() => {
    const patientRows = patients.map((patient) => ({
      id: patient.patientId,
      name: patient.name,
      email: patient.email,
      role: 'PATIENT',
      department: 'Patient Portal',
      phone: patient.phone,
      registeredAt: patient.createdAt,
      lastLogin: 'Current browser session',
      status: 'Active' as const,
    }))

    const staffRows = staff.map((member) => ({
      id: member.staffId,
      name: member.name,
      email: member.email,
      role: member.isHeadAdmin ? 'HEAD ADMIN' : member.role.toUpperCase(),
      department: member.department || 'General',
      phone: member.phone || 'Not provided',
      registeredAt: member.createdAt,
      lastLogin: member.email === session?.email ? 'Active now' : 'Mock session data',
      status: member.isActive ? ('Active' as const) : ('Inactive' as const),
      isHeadAdmin: member.isHeadAdmin,
    }))

    return [...staffRows, ...patientRows]
  }, [patients, session?.email, staff])

  const filteredUsers = users.filter((user) =>
    [user.name, user.email, user.role, user.department].some((value) =>
      value.toLowerCase().includes(query.toLowerCase()),
    ),
  )

  const handleLogout = () => {
    logout()
    router.push('/auth/landing')
  }

  const handleNewAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewAdmin((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault()
    setAdminFormError('')

    try {
      if (!isHeadAdmin) throw new Error('Only the head admin can create administrators.')
      if (!newAdmin.name || !newAdmin.email || !newAdmin.password || !newAdmin.confirmPassword) {
        throw new Error('Please fill in all fields.')
      }
      if (newAdmin.password !== newAdmin.confirmPassword) throw new Error('Passwords do not match.')
      if (newAdmin.password.length < 6) throw new Error('Password must be at least 6 characters.')

      const staffProfiles = JSON.parse(localStorage.getItem('staffProfiles') || '{}') as Record<string, StoredStaff>
      if (Object.values(staffProfiles).some((member) => member.email === newAdmin.email)) {
        throw new Error('An account with this email already exists.')
      }

      const staffId = generateStaffId()
      const admin: StoredStaff = {
        staffId,
        email: newAdmin.email,
        name: newAdmin.name,
        role: 'admin',
        password: newAdmin.password,
        department: 'Administration',
        createdAt: new Date().toISOString(),
        isActive: true,
        isHeadAdmin: false,
      }

      staffProfiles[staffId] = admin
      localStorage.setItem('staffProfiles', JSON.stringify(staffProfiles))
      setStaff(Object.values(staffProfiles))
      setNewAdmin({ name: '', email: '', password: '', confirmPassword: '' })
      setIsAddAdminOpen(false)
    } catch (err) {
      setAdminFormError(err instanceof Error ? err.message : 'Unable to create admin.')
    }
  }

  if (isLoading || !session || session.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading admin console...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="bg-sidebar border-r border-white/50 p-6 lg:sticky lg:top-0 lg:h-screen lg:w-72">
        <div className="space-y-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">MedCore</p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground">Admin Console</h1>
          </div>
          <nav className="space-y-1 text-sm">
            {[
              ['Overview', Activity],
              ['All Users', Users],
              ['All Patients', FileText],
              ['All Appointments', Calendar],
              ['Doctors & Schedules', Stethoscope],
              ['Pharmacy', Pill],
              ['Billing & Invoices', CreditCard],
              ['Reports', Database],
              ['System Settings', ShieldCheck],
            ].map(([label, Icon]) => {
              const NavIcon = Icon as typeof Activity
              return (
                <button key={label as string} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-foreground hover:bg-white/30">
                  <NavIcon className="h-4 w-4 text-primary" />
                  <span>{label as string}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </aside>

      <main className="flex-1 p-4 lg:p-8">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-foreground">System Overview</h2>
            <p className="mt-1 text-sm text-muted-foreground">Logged in as {session.name}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {isHeadAdmin && (
              <button
                type="button"
                onClick={() => setIsAddAdminOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                Add Administrator
              </button>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 rounded-lg glass-sm px-4 py-2 text-sm font-medium text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {[
            ['Total Users', users.length, Users],
            ['Patients', patients.length, FileText],
            ['Doctors Today', 8, Stethoscope],
            ["Today's Appointments", 24, Calendar],
            ['Pending Rx', 12, Pill],
            ['Outstanding', '₦1.8M', CreditCard],
          ].map(([label, value, Icon]) => {
            const CardIcon = Icon as typeof Users
            return (
              <div key={label as string} className="bg-card border border-white/50 rounded-lg p-4">
                <CardIcon className="mb-3 h-5 w-5 text-primary" />
                <p className="text-xs text-muted-foreground">{label as string}</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">{value as string | number}</p>
              </div>
            )
          })}
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="bg-card border border-white/50 rounded-lg p-4 sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-foreground">All Users</h3>
                <p className="text-sm text-muted-foreground">Every patient and staff account visible to admins.</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search users..."
                  className="w-full rounded-lg border border-white/50 bg-muted py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary sm:w-64"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-sm">
                <thead className="border-b border-white/50 text-left text-muted-foreground">
                  <tr>
                    <th className="py-3 pr-4">Avatar</th>
                    <th className="py-3 pr-4">Name</th>
                    <th className="py-3 pr-4">Email</th>
                    <th className="py-3 pr-4">Role</th>
                    <th className="py-3 pr-4">Department</th>
                    <th className="py-3 pr-4">Phone</th>
                    <th className="py-3 pr-4">Registered</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-white/40 hover:bg-white/20">
                      <td className="py-3 pr-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 font-semibold text-primary">
                          {user.name.slice(0, 1)}
                        </div>
                      </td>
                      <td className="py-3 pr-4 font-medium text-foreground">{user.name}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{user.email}</td>
                      <td className="py-3 pr-4">
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">{user.role}</span>
                      </td>
                      <td className="py-3 pr-4">{user.department}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{user.phone}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{new Date(user.registeredAt).toLocaleDateString()}</td>
                      <td className="py-3 pr-4">
                        <span className="rounded-full bg-success/15 px-2 py-1 text-xs font-medium text-success">{user.status}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <button onClick={() => setSelectedUser(user)} className="rounded-lg glass-sm px-3 py-1.5 text-xs font-medium">
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-white/50 rounded-lg p-5">
              <h3 className="mb-4 text-lg font-semibold text-foreground">Recent Activity</h3>
              <div className="space-y-4">
                {activityFeed.map((item) => {
                  const FeedIcon = item.icon
                  return (
                    <div key={item.label} className="flex gap-3">
                      <div className="glass-sm flex h-9 w-9 items-center justify-center rounded-lg">
                        <FeedIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.detail}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{item.time}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-card border border-white/50 rounded-lg p-5">
              <h3 className="mb-4 text-lg font-semibold text-foreground">System Health</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span>Users table</span><span>{users.length} records</span></div>
                <div className="flex justify-between"><span>Patients table</span><span>{patients.length} records</span></div>
                <div className="flex justify-between"><span>Staff table</span><span>{staff.length} records</span></div>
                <div className="flex justify-between"><span>Active sessions</span><span>1 mock</span></div>
                <div className="flex justify-between"><span>Last backup</span><span>Today, 02:00</span></div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>{selectedUser?.name}</DialogTitle>
            <DialogDescription>{selectedUser?.role} account profile and activity</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-muted p-3"><p className="text-muted-foreground">Email</p><p>{selectedUser.email}</p></div>
                <div className="rounded-lg bg-muted p-3"><p className="text-muted-foreground">Department</p><p>{selectedUser.department}</p></div>
                <div className="rounded-lg bg-muted p-3"><p className="text-muted-foreground">Phone</p><p>{selectedUser.phone}</p></div>
                <div className="rounded-lg bg-muted p-3"><p className="text-muted-foreground">Last Login</p><p>{selectedUser.lastLogin}</p></div>
              </div>
              <div className="rounded-lg border border-white/50 p-3">
                <p className="font-medium text-foreground">Activity Log</p>
                <p className="mt-2 text-muted-foreground">Mock role-scoped activity: appointments, prescriptions, invoices, and profile updates will live here once Neon is connected.</p>
              </div>
              <button className="inline-flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                <Ban className="h-4 w-4" />
                Disable Account
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAddAdminOpen} onOpenChange={setIsAddAdminOpen}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Add Administrator</DialogTitle>
            <DialogDescription>Create an admin account directly from the admin console.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            {adminFormError && <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{adminFormError}</div>}
            <input name="name" value={newAdmin.name} onChange={handleNewAdminChange} placeholder="Full name" className="w-full rounded-lg border border-white/50 bg-muted px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
            <input name="email" type="email" value={newAdmin.email} onChange={handleNewAdminChange} placeholder="Email address" className="w-full rounded-lg border border-white/50 bg-muted px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="password" type="password" value={newAdmin.password} onChange={handleNewAdminChange} placeholder="Password" className="w-full rounded-lg border border-white/50 bg-muted px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
              <input name="confirmPassword" type="password" value={newAdmin.confirmPassword} onChange={handleNewAdminChange} placeholder="Confirm password" className="w-full rounded-lg border border-white/50 bg-muted px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <DialogFooter>
              <button type="submit" className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground sm:w-auto">
                Create Admin
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
