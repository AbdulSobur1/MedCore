'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Edit2, Trash2, ShieldCheck, Users, Building2, Lock } from 'lucide-react'
import { generateStaffId, type StaffProfile } from '@/lib/auth'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

const STAFF_DATA = [
  { id: 'S001', name: 'Dr. Ahmed Hassan', role: 'Doctor', department: 'Cardiology', status: 'Active', email: 'ahmed@hospital.com' },
  { id: 'S002', name: 'Dr. Emily Garcia', role: 'Doctor', department: 'Endocrinology', status: 'Active', email: 'emily@hospital.com' },
  { id: 'S003', name: 'Sarah Johnson', role: 'Nurse', department: 'Cardiology', status: 'Active', email: 'sarah.j@hospital.com' },
  { id: 'S004', name: 'Mike Thompson', role: 'Pharmacist', department: 'Pharmacy', status: 'Active', email: 'mike.t@hospital.com' },
  { id: 'S005', name: 'Lisa Anderson', role: 'Administrator', department: 'Admin', status: 'Active', email: 'lisa.a@hospital.com' },
]

const DEPARTMENTS_DATA = [
  { id: 'D001', name: 'Cardiology', head: 'Dr. Ahmed Hassan', beds: 20, staff: 12 },
  { id: 'D002', name: 'Orthopedics', head: 'Dr. Robert Smith', beds: 15, staff: 8 },
  { id: 'D003', name: 'Neurology', head: 'Dr. Lisa Chen', beds: 12, staff: 6 },
  { id: 'D004', name: 'Pediatrics', head: 'Dr. Maria Lopez', beds: 18, staff: 10 },
]

type StoredAdmin = StaffProfile & { password: string }

function StatusBadge({ status }: { status: string }) {
  return <span className="badge badge-success">{status}</span>
}

export function AdminSection({ isHeadAdmin = false }: { isHeadAdmin?: boolean }) {
  const [activeTab, setActiveTab] = useState<'staff' | 'departments' | 'settings'>('staff')
  const [searchTerm, setSearchTerm] = useState('')
  const [storedAdmins, setStoredAdmins] = useState<StoredAdmin[]>([])
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false)
  const [adminFormError, setAdminFormError] = useState('')
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', confirmPassword: '' })

  useEffect(() => {
    queueMicrotask(() => {
      const staffProfiles = JSON.parse(localStorage.getItem('staffProfiles') || '{}') as Record<string, StoredAdmin>
      setStoredAdmins(Object.values(staffProfiles).filter((staff) => staff.role === 'ADMIN'))
    })
  }, [])

  const adminRows = storedAdmins.map((admin) => ({
    id: admin.staffId,
    name: admin.name,
    role: admin.isHeadAdmin ? 'Head Admin' : 'Admin',
    department: admin.department || 'Administration',
    status: admin.isActive ? 'Active' as const : 'Inactive' as const,
    email: admin.email,
    isHeadAdmin: !!admin.isHeadAdmin,
  }))

  const staffRows = [...adminRows, ...STAFF_DATA.map((staff) => ({ ...staff, isHeadAdmin: false }))]
  const filteredStaff = staffRows.filter((s) =>
    [s.name, s.role, s.email].some((v) => v.toLowerCase().includes(searchTerm.toLowerCase()))
  )
  const filteredDepartments = DEPARTMENTS_DATA.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleNewAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewAdmin((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault()
    setAdminFormError('')
    try {
      if (!isHeadAdmin) throw new Error('Only the head admin can create other admin accounts.')
      if (!newAdmin.name || !newAdmin.email || !newAdmin.password || !newAdmin.confirmPassword)
        throw new Error('Please fill in all fields.')
      if (newAdmin.password !== newAdmin.confirmPassword) throw new Error('Passwords do not match.')
      if (newAdmin.password.length < 6) throw new Error('Password must be at least 6 characters.')
      const staffProfiles = JSON.parse(localStorage.getItem('staffProfiles') || '{}') as Record<string, StoredAdmin>
      if (Object.values(staffProfiles).some((staff) => staff.email === newAdmin.email))
        throw new Error('An admin with this email already exists.')
      const staffId = generateStaffId()
      const admin: StoredAdmin = {
        staffId, email: newAdmin.email, name: newAdmin.name, role: 'ADMIN', password: newAdmin.password,
        department: 'Administration', createdAt: new Date().toISOString(), isActive: true, isHeadAdmin: false,
      }
      staffProfiles[staffId] = admin
      localStorage.setItem('staffProfiles', JSON.stringify(staffProfiles))
      setStoredAdmins(Object.values(staffProfiles).filter((staff) => staff.role === 'ADMIN'))
      setNewAdmin({ name: '', email: '', password: '', confirmPassword: '' })
      setIsAddAdminOpen(false)
    } catch (err) {
      setAdminFormError(err instanceof Error ? err.message : 'Unable to create admin account.')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Administration</h1>
          <p className="caption mt-0.5">
            {isHeadAdmin ? 'Manage staff, departments, and administrator access' : 'Manage staff, departments, and system settings'}
          </p>
        </div>
        {activeTab === 'staff' && isHeadAdmin && (
          <Dialog open={isAddAdminOpen} onOpenChange={setIsAddAdminOpen}>
            <DialogTrigger asChild>
              <button className="btn-primary flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Add Admin
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Admin Account</DialogTitle>
                <DialogDescription>New admins can access the staff dashboard, but only the head admin can create more admins.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                {adminFormError && <div className="p-3 rounded-lg bg-[--danger-soft] text-[13px] text-[--danger]">{adminFormError}</div>}
                <div>
                  <label className="label block mb-1.5">Full Name</label>
                  <input type="text" name="name" value={newAdmin.name} onChange={handleNewAdminChange} className="input-field w-full" placeholder="Admin name" required />
                </div>
                <div>
                  <label className="label block mb-1.5">Email</label>
                  <input type="email" name="email" value={newAdmin.email} onChange={handleNewAdminChange} className="input-field w-full" placeholder="admin@hospital.com" required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label block mb-1.5">Password</label>
                    <input type="password" name="password" value={newAdmin.password} onChange={handleNewAdminChange} className="input-field w-full" placeholder="Password" required />
                  </div>
                  <div>
                    <label className="label block mb-1.5">Confirm</label>
                    <input type="password" name="confirmPassword" value={newAdmin.confirmPassword} onChange={handleNewAdminChange} className="input-field w-full" placeholder="Confirm" required />
                  </div>
                </div>
                <DialogFooter>
                  <button type="submit" className="btn-primary">Create Admin</button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
        {activeTab === 'departments' && (
          <button className="btn-primary flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Add Department
          </button>
        )}
      </div>

      {activeTab === 'staff' && !isHeadAdmin && (
        <div className="p-3 rounded-lg bg-[--surface-2] text-[13px] text-[--text-3]">
          Only the head admin can create new administrator accounts.
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[--border] gap-4">
        {(['staff', 'departments', 'settings'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 pb-3 text-[13px] font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === tab ? 'border-[--accent] text-[--accent]' : 'border-transparent text-[--text-3] hover:text-[--text-2]'
            }`}>
            {tab === 'staff' && <Users className="w-3.5 h-3.5" />}
            {tab === 'departments' && <Building2 className="w-3.5 h-3.5" />}
            {tab === 'settings' && <Lock className="w-3.5 h-3.5" />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Staff tab */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[--text-3]" />
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name or role..." className="input-field w-full pl-8" />
          </div>
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="divide-x divide-[--border]">
                    <th className="label text-left px-4 py-3 bg-[--surface-2]">Name</th>
                    <th className="label text-left px-4 py-3 bg-[--surface-2]">Role</th>
                    <th className="label text-left px-4 py-3 bg-[--surface-2]">Department</th>
                    <th className="label text-left px-4 py-3 bg-[--surface-2]">Status</th>
                    <th className="label text-left px-4 py-3 bg-[--surface-2]">Email</th>
                    <th className="label text-left px-4 py-3 bg-[--surface-2]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[--border]">
                  {filteredStaff.map((staff) => (
                    <tr key={staff.id} className="bg-[--surface] hover:bg-[--surface-2] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium text-[--text-1]">{staff.name}</span>
                          {staff.isHeadAdmin && <span className="badge badge-info">Owner</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[--text-2]">{staff.role}</td>
                      <td className="px-4 py-3 text-[13px] text-[--text-2]">{staff.department}</td>
                      <td className="px-4 py-3"><StatusBadge status={staff.status} /></td>
                      <td className="px-4 py-3 text-[13px] text-[--text-3]">{staff.email}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button className="p-1.5 rounded hover:bg-[--surface-2]"><Edit2 className="w-3.5 h-3.5 text-[--text-2]" /></button>
                          <button className="p-1.5 rounded hover:bg-[--surface-2]"><Trash2 className="w-3.5 h-3.5 text-[--danger]" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Departments tab */}
      {activeTab === 'departments' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[--text-3]" />
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search departments..." className="input-field w-full pl-8" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDepartments.map((dept) => (
              <div key={dept.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-[14px] font-semibold text-[--text-1]">{dept.name}</h3>
                    <p className="caption">Head: {dept.head}</p>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded hover:bg-[--surface-2]"><Edit2 className="w-3.5 h-3.5 text-[--text-2]" /></button>
                    <button className="p-1.5 rounded hover:bg-[--surface-2]"><Trash2 className="w-3.5 h-3.5 text-[--danger]" /></button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="label mb-0.5">Total Beds</p><p className="text-[22px] font-semibold text-[--text-1]">{dept.beds}</p></div>
                  <div><p className="label mb-0.5">Staff Count</p><p className="text-[22px] font-semibold text-[--text-1]">{dept.staff}</p></div>
                </div>
                <button className="btn-primary w-full mt-4">Manage Department</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings tab */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="card">
            <h3 className="section-title mb-4">Hospital Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="label block mb-1.5">Hospital Name</label>
                <input type="text" defaultValue="MedCore Hospital" className="input-field w-full" />
              </div>
              <div>
                <label className="label block mb-1.5">Email</label>
                <input type="email" defaultValue="admin@medcore.hospital" className="input-field w-full" />
              </div>
              <div>
                <label className="label block mb-1.5">Phone</label>
                <input type="tel" defaultValue="(555) 123-4567" className="input-field w-full" />
              </div>
              <button className="btn-primary w-full">Save Changes</button>
            </div>
          </div>
          <div className="card">
            <h3 className="section-title mb-4">System Preferences</h3>
            <div className="space-y-4">
              {['Email Notifications', 'SMS Alerts', 'Maintenance Mode', 'Two-Factor Authentication'].map((label, i) => (
                <div key={label} className="flex items-center justify-between">
                  <label className="text-[13px] text-[--text-1]">{label}</label>
                  <input type="checkbox" defaultChecked={i !== 2} className="w-4 h-4 rounded accent-[--accent]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
