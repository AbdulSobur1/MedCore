'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Calendar, Plus, Stethoscope, Users, Bed, ChevronRight
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { getRoleHome, type PatientProfile, type StaffProfile } from '@/lib/auth'
import { format } from 'date-fns'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { toast } from 'sonner'
import { getAppointments, getStaffMembers, getDepartments } from '@/lib/store'

type StoredStaff = StaffProfile & { password?: string }

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Stable': 'badge-success', 'Active': 'badge-success', 'Critical': 'badge-danger',
    'Improving': 'badge-info', 'Confirmed': 'badge-info', 'Pending': 'badge-warning', 'Completed': 'badge-muted',
  }
  return <span className={`badge ${styles[status] || 'badge-muted'}`}>{status}</span>
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { session, isLoading } = useAuth()
  const [patients, setPatients] = useState<PatientProfile[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [staffMembers, setStaffMembers] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])

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
      setPatients(Object.values(storedPatients))
      setAppointments(getAppointments())
      setStaffMembers(getStaffMembers())
      setDepartments(getDepartments())
    })
  }, [])

  const handleNewPatient = () => { toast.success('Opening new patient registration...'); router.push('/register') }

  // Real computed values
  const totalPatients = patients.length
  const todayAppts = appointments.filter((a) => a.date === new Date().toISOString().split('T')[0])
  const activeDoctors = staffMembers.filter((s) => s.role === 'Doctor' && s.availability === 'Available').length
  const totalBeds = departments.reduce((sum, d) => sum + d.beds, 0)
  const bedOccupancy = totalBeds > 0 ? Math.round((patients.length / totalBeds) * 100) : 0

  // Chart data from actual appointments
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const weeklyData = days.map((day, i) => {
    const dayAppts = appointments.filter((a) => {
      const d = new Date(a.date)
      return d.getDay() === i
    })
    return {
      day,
      Appointments: dayAppts.length,
      Completed: dayAppts.filter((a) => a.status === 'Completed').length,
    }
  })

  // Department load from real data
  const deptLoad = departments.map((d) => ({
    dept: d.name,
    patients: appointments.filter((a) => a.department === d.name).length,
  }))

  // Today's schedule
  const todaySchedule = todayAppts.slice(0, 6).map((a) => ({
    time: a.time,
    patient: a.patientName,
    type: a.type,
    doctor: a.doctor,
    status: a.status as any,
  }))

  // Recent patients (from registered patients)
  const recentPatients = patients.slice(-4).reverse().map((p) => ({
    name: p.name,
    id: p.patientId,
    doctor: 'Assigned',
    ward: 'General',
    status: 'Active' as const,
    admitted: new Date(p.createdAt).toLocaleDateString(),
  }))

  if (isLoading || !session || session.role !== 'ADMIN') {
    return (
      <div className="space-y-4">
        <div className="h-5 bg-[--surface-2] rounded animate-pulse w-1/3" />
        <div className="h-8 bg-[--surface-2] rounded animate-pulse w-1/2" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-[--surface-2] rounded-xl animate-pulse" />)}
        </div>
      </div>
    )
  }

  const today = format(new Date(), 'EEEE, dd MMM yyyy')

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="caption mt-0.5">{today}</p>
        </div>
        <button onClick={handleNewPatient} className="btn-primary flex items-center gap-2">
          <Plus className="w-3.5 h-3.5" />
          New Patient
        </button>
      </div>

      {/* KPI Cards - ALL REAL VALUES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Patients', value: totalPatients.toLocaleString(), delta: `Registered to date`, icon: Users },
          { label: "Today's Appointments", value: todayAppts.length.toString(), delta: `${todayAppts.filter(a => a.status === 'Confirmed' || a.status === 'Pending').length} remaining`, icon: Calendar },
          { label: 'Active Doctors', value: activeDoctors.toString(), delta: `${staffMembers.filter(s => s.role === 'Doctor').length} total`, icon: Stethoscope },
          { label: 'Bed Occupancy', value: `${bedOccupancy}%`, delta: `${totalBeds} total beds`, icon: Bed },
        ].map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="card flex items-start justify-between">
              <div>
                <p className="label mb-2">{item.label}</p>
                <p className="text-[28px] font-semibold text-[--text-1] leading-tight">{item.value}</p>
                <p className="caption mt-1 text-[--success]">↑ {item.delta}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-[--accent-soft] flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-[--accent]" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[--accent]" />
              <span className="text-[12px] text-[--text-3]">Appointments</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[--info]" />
              <span className="text-[12px] text-[--text-3]">Completed</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8ECF0" />
              <XAxis dataKey="day" tick={{ fill: '#8A96A3', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8A96A3', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E8ECF0', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="Appointments" stroke="#1A7F6E" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Completed" stroke="#1A56A4" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="section-title mb-4">Department Load</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptLoad}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8ECF0" vertical={false} />
              <XAxis dataKey="dept" tick={{ fill: '#8A96A3', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8A96A3', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E8ECF0', borderRadius: '8px' }} />
              <Bar dataKey="patients" fill="#1A7F6E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
        <div className="card p-0 overflow-hidden">
          <div className="p-5 pb-0">
            <h3 className="section-title mb-4">Recent Patients</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="divide-x divide-[--border]">
                  <th className="label text-left px-4 py-3 bg-[--surface-2]">Patient</th>
                  <th className="label text-left px-4 py-3 bg-[--surface-2]">ID</th>
                  <th className="label text-left px-4 py-3 bg-[--surface-2]">Status</th>
                  <th className="label text-left px-4 py-3 bg-[--surface-2]">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[--border]">
                {recentPatients.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-[13px] text-[--text-3]">
                      <div className="w-10 h-10 rounded-full bg-[--accent-soft] flex items-center justify-center mx-auto mb-3">
                        <Users className="w-5 h-5 text-[--accent]" />
                      </div>
                      No patients registered yet
                    </td>
                  </tr>
                ) : recentPatients.map((patient) => (
                  <tr key={patient.id} className="bg-[--surface] hover:bg-[--surface-2] transition-colors">
                    <td className="px-4 py-3 text-[13px] font-medium text-[--text-1]">{patient.name}</td>
                    <td className="px-4 py-3 text-[13px] text-[--text-3]">{patient.id}</td>
                    <td className="px-4 py-3"><StatusBadge status={patient.status} /></td>
                    <td className="px-4 py-3 text-[13px] text-[--text-3]">{patient.admitted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 className="section-title mb-4">Today's Schedule</h3>
          {todaySchedule.length === 0 ? (
            <div className="py-8 text-center">
              <Calendar className="w-6 h-6 text-[--text-3] mx-auto mb-2" />
              <p className="text-[13px] text-[--text-3]">No appointments today</p>
            </div>
          ) : (
            <div className="space-y-0">
              {todaySchedule.map((item, i) => (
                <div key={i} className="flex items-start gap-3 py-3 border-b border-[--border] last:border-0">
                  <div className="text-[12px] text-[--text-3] w-14 shrink-0 pt-0.5 font-medium">{item.time}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[--text-1] truncate">{item.patient}</p>
                    <p className="caption truncate">{item.type} · {item.doctor}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
