'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Edit2, Trash2, Lock, Users, Building2, ShieldCheck } from 'lucide-react'
import { generateStaffId, type StaffProfile } from '@/lib/auth'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

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

export function AdminSection({ isHeadAdmin = false }: { isHeadAdmin?: boolean }) {
  const [activeTab, setActiveTab] = useState<'staff' | 'departments' | 'settings'>('staff')
  const [searchTerm, setSearchTerm] = useState('')
  const [storedAdmins, setStoredAdmins] = useState<StoredAdmin[]>([])
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false)
  const [adminFormError, setAdminFormError] = useState('')
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  useEffect(() => {
    queueMicrotask(() => {
      const staffProfiles = JSON.parse(localStorage.getItem('staffProfiles') || '{}') as Record<string, StoredAdmin>
      setStoredAdmins(Object.values(staffProfiles).filter((staff) => staff.role === 'admin'))
    })
  }, [])

  const adminRows = storedAdmins.map((admin) => ({
    id: admin.staffId,
    name: admin.name,
    role: admin.isHeadAdmin ? 'Head Admin' : 'Admin',
    department: admin.department || 'Administration',
    status: admin.isActive ? 'Active' : 'Inactive',
    email: admin.email,
    isHeadAdmin: !!admin.isHeadAdmin,
  }))

  const staffRows = [
    ...adminRows,
    ...STAFF_DATA.map((staff) => ({ ...staff, isHeadAdmin: false })),
  ]

  const filteredStaff = staffRows.filter(
    (staff) =>
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredDepartments = DEPARTMENTS_DATA.filter((dept) =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleNewAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewAdmin((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault()
    setAdminFormError('')

    try {
      if (!isHeadAdmin) {
        throw new Error('Only the head admin can create other admin accounts.')
      }

      if (!newAdmin.name || !newAdmin.email || !newAdmin.password || !newAdmin.confirmPassword) {
        throw new Error('Please fill in all fields.')
      }

      if (newAdmin.password !== newAdmin.confirmPassword) {
        throw new Error('Passwords do not match.')
      }

      if (newAdmin.password.length < 6) {
        throw new Error('Password must be at least 6 characters.')
      }

      const staffProfiles = JSON.parse(localStorage.getItem('staffProfiles') || '{}') as Record<string, StoredAdmin>
      const emailExists = Object.values(staffProfiles).some((staff) => staff.email === newAdmin.email)
      if (emailExists) {
        throw new Error('An admin with this email already exists.')
      }

      const staffId = generateStaffId()
      const admin: StoredAdmin = {
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
      setStoredAdmins(Object.values(staffProfiles).filter((staff) => staff.role === 'admin'))
      setNewAdmin({ name: '', email: '', password: '', confirmPassword: '' })
      setIsAddAdminOpen(false)
    } catch (err) {
      setAdminFormError(err instanceof Error ? err.message : 'Unable to create admin account.')
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Administration</h1>
          <p className="text-muted-foreground mt-2">
            {isHeadAdmin
              ? 'Manage staff, departments, and administrator access'
              : 'Manage staff, departments, and system settings'}
          </p>
        </div>
        {activeTab === 'staff' && isHeadAdmin && (
          <Dialog open={isAddAdminOpen} onOpenChange={setIsAddAdminOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center justify-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
                <ShieldCheck className="w-5 h-5" />
                Add Admin
              </button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>Create Admin Account</DialogTitle>
                <DialogDescription>
                  New admins can access the staff dashboard, but only the head admin can create more admins.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                {adminFormError && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                    {adminFormError}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newAdmin.name}
                    onChange={handleNewAdminChange}
                    className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Admin name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={newAdmin.email}
                    onChange={handleNewAdminChange}
                    className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="admin@hospital.com"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-2">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={newAdmin.password}
                      onChange={handleNewAdminChange}
                      className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="Password"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-2">Confirm</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={newAdmin.confirmPassword}
                      onChange={handleNewAdminChange}
                      className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="Confirm password"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
                  >
                    Create Admin
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
        {activeTab === 'departments' && (
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-5 h-5" />
            Add Department
          </button>
        )}
      </div>

      {activeTab === 'staff' && !isHeadAdmin && (
        <div className="glass border border-white/50 rounded-lg p-4 text-sm text-muted-foreground">
          Only the head admin can create new administrator accounts.
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border">
        {(['staff', 'departments', 'settings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === tab
                ? 'border-accent text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'staff' && <Users className="w-4 h-4" />}
            {tab === 'departments' && <Building2 className="w-4 h-4" />}
            {tab === 'settings' && <Lock className="w-4 h-4" />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Staff Management */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Staff Table */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">ID</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Name</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Role</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Department</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Status</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Email</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((staff) => (
                    <tr key={staff.id} className="border-b border-border hover:bg-muted transition-colors">
                      <td className="py-4 px-6 text-foreground text-sm font-medium">{staff.id}</td>
                      <td className="py-4 px-6 text-foreground text-sm">{staff.name}</td>
                      <td className="py-4 px-6 text-foreground text-sm">
                        <span className="inline-flex items-center gap-2">
                          {staff.role}
                          {staff.isHeadAdmin && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                              Owner
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-foreground text-sm">{staff.department}</td>
                      <td className="py-4 px-6">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-success/20 text-success">
                          {staff.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground text-sm">{staff.email}</td>
                      <td className="py-4 px-6 flex gap-2">
                        <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                          <Edit2 className="w-4 h-4 text-foreground" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Department Management */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Department Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDepartments.map((dept) => (
              <div key={dept.id} className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{dept.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Head: {dept.head}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                      <Edit2 className="w-4 h-4 text-foreground" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Beds</p>
                    <p className="text-2xl font-bold text-foreground">{dept.beds}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Staff Count</p>
                    <p className="text-2xl font-bold text-foreground">{dept.staff}</p>
                  </div>
                </div>

                <button className="w-full mt-6 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
                  Manage Department
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Hospital Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Hospital Name</label>
                  <input
                    type="text"
                    defaultValue="MedCore Hospital"
                    className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue="admin@medcore.hospital"
                    className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                  <input
                    type="tel"
                    defaultValue="(555) 123-4567"
                    className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground"
                  />
                </div>
                <button className="w-full px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
                  Save Changes
                </button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">System Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Email Notifications</label>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">SMS Alerts</label>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Maintenance Mode</label>
                  <input type="checkbox" className="w-5 h-5 rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Two-Factor Authentication</label>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
