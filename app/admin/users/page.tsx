'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Calendar, Pill, CreditCard, FileText, Ban, RefreshCw, ChevronRight, User } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { getRoleHome, naira, type PatientProfile, type StaffProfile } from '@/lib/auth'
import { toast } from 'sonner'

type StoredStaff = StaffProfile & { password?: string }

type UserRow = {
  id: string
  name: string
  email: string
  role: string
  department: string
  phone: string
  registeredAt: string
  status: 'Active' | 'Inactive'
  isHeadAdmin?: boolean
  userType: 'staff' | 'patient'
}

const mockAppointments = [
  { date: '15 Jun 2026', doctor: 'Dr. Ahmed Hassan', type: 'Consultation', status: 'Confirmed' },
  { date: '02 May 2026', doctor: 'Dr. Emily Garcia', type: 'Follow-Up', status: 'Completed' },
  { date: '16 Apr 2026', doctor: 'Dr. James Wilson', type: 'Routine', status: 'Completed' },
]

const mockPrescriptions = [
  { drug: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '30 days', status: 'Active' },
  { drug: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '14 days', status: 'Dispensed' },
]

const mockInvoices = [
  { service: 'Consultation', amount: 45000, date: '02 May 2026', status: 'Paid' },
  { service: 'Lab screening', amount: 18000, date: '02 May 2026', status: 'Pending' },
]

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Active': 'badge-success',
    'Inactive': 'badge-muted',
    'Confirmed': 'badge-info',
    'Completed': 'badge-muted',
    'Paid': 'badge-success',
    'Pending': 'badge-warning',
    'Dispensed': 'badge-success',
  }
  return <span className={`badge ${styles[status] || 'badge-muted'}`}>{status}</span>
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { session, isLoading } = useAuth()
  const [patients, setPatients] = useState<PatientProfile[]>([])
  const [staff, setStaff] = useState<StoredStaff[]>([])
  const [query, setQuery] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null)

  useEffect(() => {
    if (isLoading) return
    if (!session) { router.push('/login'); return }
    if (session.role !== 'ADMIN') {
      router.push(session.userType === 'patient' ? '/patient/dashboard' : getRoleHome(session.role))
    }
  }, [isLoading, router, session])

  useEffect(() => {
    queueMicrotask(() => {
      const storedPatients = JSON.parse(localStorage.getItem('patients') || '{}') as Record<string, PatientProfile>
      const storedStaff = JSON.parse(localStorage.getItem('staffProfiles') || '{}') as Record<string, StoredStaff>
      setPatients(Object.values(storedPatients))
      setStaff(Object.values(storedStaff))
    })
  }, [])

  const users = useMemo<UserRow[]>(() => {
    const staffRows = staff.map((member) => ({
      id: member.staffId,
      name: member.name,
      email: member.email,
      role: member.isHeadAdmin ? 'HEAD ADMIN' : member.role,
      department: member.department || 'General',
      phone: member.phone || 'Not provided',
      registeredAt: member.createdAt,
      status: member.isActive ? 'Active' as const : 'Inactive' as const,
      isHeadAdmin: member.isHeadAdmin,
      userType: 'staff' as const,
    }))

    const patientRows = patients.map((p) => ({
      id: p.patientId,
      name: p.name,
      email: p.email,
      role: 'PATIENT',
      department: 'Patient Portal',
      phone: p.phone,
      registeredAt: p.createdAt,
      status: 'Active' as const,
      userType: 'patient' as const,
    }))

    return [...staffRows, ...patientRows]
  }, [patients, staff])

  const filteredUsers = users.filter((user) =>
    [user.name, user.email, user.role, user.department].some((v) =>
      v.toLowerCase().includes(query.toLowerCase())
    )
  )

  if (isLoading || !session || session.role !== 'ADMIN') {
    return (
      <div className="space-y-4">
        <div className="h-5 bg-[--surface-2] rounded animate-pulse w-1/3" />
        <div className="h-8 bg-[--surface-2] rounded animate-pulse w-1/2" />
        <div className="h-64 bg-[--surface-2] rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">User Management</h1>
        <p className="caption mt-0.5">All patient and staff accounts ({users.length} total)</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[--text-3]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, or role..."
          className="input-field w-full pl-8"
        />
      </div>

      {/* Users Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="divide-x divide-[--border]">
                <th className="label text-left px-4 py-3 bg-[--surface-2]">Name</th>
                <th className="label text-left px-4 py-3 bg-[--surface-2]">Email</th>
                <th className="label text-left px-4 py-3 bg-[--surface-2]">Role</th>
                <th className="label text-left px-4 py-3 bg-[--surface-2]">Department</th>
                <th className="label text-left px-4 py-3 bg-[--surface-2]">Phone</th>
                <th className="label text-left px-4 py-3 bg-[--surface-2]">Registered</th>
                <th className="label text-left px-4 py-3 bg-[--surface-2]">Status</th>
                <th className="label text-left px-4 py-3 bg-[--surface-2]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--border]">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="bg-[--surface] hover:bg-[--surface-2] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[--accent-soft] flex items-center justify-center text-[--accent] font-semibold text-[12px] shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <span className="text-[13px] font-medium text-[--text-1]">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[--text-2]">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${user.role === 'PATIENT' ? 'badge-info' : 'badge-success'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[--text-2]">{user.department}</td>
                  <td className="px-4 py-3 text-[13px] text-[--text-3]">{user.phone}</td>
                  <td className="px-4 py-3 text-[13px] text-[--text-3]">
                    {new Date(user.registeredAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={user.status} /></td>
                  <td className="px-4 py-3">
                    {user.userType === 'patient' ? (
                      <button
                        onClick={() => {
                          const p = patients.find((p) => p.patientId === user.id)
                          if (p) setSelectedPatient(p)
                        }}
                        className="btn-ghost text-[12px] py-1.5"
                      >
                        View Profile
                      </button>
                    ) : (
                      <span className="text-[12px] text-[--text-3]">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[13px] text-[--text-3]">
                    <div className="w-10 h-10 rounded-full bg-[--accent-soft] flex items-center justify-center mx-auto mb-3">
                      <User className="w-5 h-5 text-[--accent]" />
                    </div>
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Detail Drawer */}
      {selectedPatient && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setSelectedPatient(null)} />
          <div className="fixed top-0 right-0 z-50 h-full w-[480px] max-w-[90vw] bg-[--surface] border-l border-[--border] shadow-lg overflow-y-auto">
            <div className="sticky top-0 bg-[--surface] border-b border-[--border] px-5 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-[15px] font-semibold text-[--text-1]">{selectedPatient.name}</h2>
                <p className="caption">{selectedPatient.patientId}</p>
              </div>
              <button onClick={() => setSelectedPatient(null)} className="p-1 rounded hover:bg-[--surface-2]">
                <X className="w-4 h-4 text-[--text-3]" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Biodata */}
              <div className="card">
                <h3 className="section-title mb-3">Biodata</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['Email', selectedPatient.email],
                    ['Phone', selectedPatient.phone],
                    ['Blood Type', selectedPatient.bloodType || '—'],
                    ['Gender', selectedPatient.gender],
                    ['DOB', selectedPatient.dateOfBirth || '—'],
                    ['Address', selectedPatient.address || '—'],
                    ['Emergency', selectedPatient.emergencyContact || '—'],
                    ['Registered', new Date(selectedPatient.createdAt).toLocaleDateString()],
                  ].map(([label, value]) => (
                    <div key={label} className="p-2.5 rounded-lg bg-[--surface-2]">
                      <p className="label mb-0.5">{label}</p>
                      <p className="text-[13px] text-[--text-1]">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Appointment History */}
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="section-title">Appointments</h3>
                  <Calendar className="w-4 h-4 text-[--text-3]" />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="divide-x divide-[--border]">
                        <th className="label text-left px-3 py-2 bg-[--surface-2]">Date</th>
                        <th className="label text-left px-3 py-2 bg-[--surface-2]">Doctor</th>
                        <th className="label text-left px-3 py-2 bg-[--surface-2]">Type</th>
                        <th className="label text-left px-3 py-2 bg-[--surface-2]">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[--border]">
                      {mockAppointments.map((apt, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2 text-[--text-1]">{apt.date}</td>
                          <td className="px-3 py-2 text-[--text-2]">{apt.doctor}</td>
                          <td className="px-3 py-2 text-[--text-2]">{apt.type}</td>
                          <td className="px-3 py-2"><StatusBadge status={apt.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Prescriptions */}
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="section-title">Prescriptions</h3>
                  <Pill className="w-4 h-4 text-[--text-3]" />
                </div>
                {mockPrescriptions.map((rx, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 border-b border-[--border] last:border-0">
                    <div className="w-7 h-7 rounded-md bg-[--accent-soft] flex items-center justify-center shrink-0">
                      <Pill className="w-3.5 h-3.5 text-[--accent]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[--text-1]">{rx.drug} {rx.dosage}</p>
                      <p className="caption">{rx.frequency} · {rx.duration}</p>
                    </div>
                    <StatusBadge status={rx.status} />
                  </div>
                ))}
              </div>

              {/* Invoices */}
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="section-title">Invoices</h3>
                  <CreditCard className="w-4 h-4 text-[--text-3]" />
                </div>
                {mockInvoices.map((inv, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b border-[--border] last:border-0">
                    <div>
                      <p className="text-[13px] text-[--text-1]">{inv.service}</p>
                      <p className="caption">{inv.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-[--text-1]">{naira(inv.amount)}</span>
                      <StatusBadge status={inv.status} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="btn-danger flex items-center gap-1.5 flex-1 justify-center">
                  <Ban className="w-3.5 h-3.5" />
                  Disable Account
                </button>
                <button
                  onClick={() => {
                    toast.success('OTP reset successfully')
                    setSelectedPatient(null)
                  }}
                  className="btn-ghost flex items-center gap-1.5 flex-1 justify-center"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset OTP
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
