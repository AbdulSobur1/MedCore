'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Activity, Calendar, CreditCard, FileText, Pill, Plus, Search, Stethoscope, Users, Bed, ChevronRight, Bell
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { getRoleHome, type PatientProfile, type StaffProfile, naira } from '@/lib/auth'
import { format } from 'date-fns'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { toast } from 'sonner'

type StoredStaff = StaffProfile & { password?: string }

const weeklyAdmissions = [
  { day: 'Mon', Admitted: 12, Discharged: 8 },
  { day: 'Tue', Admitted: 15, Discharged: 10 },
  { day: 'Wed', Admitted: 8, Discharged: 14 },
  { day: 'Thu', Admitted: 18, Discharged: 11 },
  { day: 'Fri', Admitted: 14, Discharged: 9 },
  { day: 'Sat', Admitted: 10, Discharged: 7 },
  { day: 'Sun', Admitted: 6, Discharged: 5 },
]

const deptLoad = [
  { dept: 'Cardiology', patients: 82 },
  { dept: 'Pediatrics', patients: 78 },
  { dept: 'Neurology', patients: 65 },
  { dept: 'Surgery', patients: 95 },
  { dept: 'Maternity', patients: 74 },
]

const todaySchedule = [
  { time: '08:00', patient: 'John Doe', type: 'Consultation', doctor: 'Dr. Ahmed Hassan', status: 'Confirmed' as const },
  { time: '09:30', patient: 'Jane Smith', type: 'Follow-Up', doctor: 'Dr. Emily Garcia', status: 'Confirmed' as const },
  { time: '10:00', patient: 'Mike Johnson', type: 'Surgery Prep', doctor: 'Dr. James Wilson', status: 'Pending' as const },
  { time: '11:30', patient: 'Sarah Wilson', type: 'Check-up', doctor: 'Dr. Lisa Chen', status: 'Confirmed' as const },
  { time: '14:00', patient: 'David Brown', type: 'Consultation', doctor: 'Dr. Ahmed Hassan', status: 'Pending' as const },
  { time: '15:30', patient: 'Emma Davis', type: 'Follow-Up', doctor: 'Dr. Emily Garcia', status: 'Pending' as const },
]

const recentPatients = [
  { name: 'John Doe', id: 'PT-0001', doctor: 'Dr. Ahmed', ward: 'Cardiology', status: 'Stable' as const, admitted: 'Today' },
  { name: 'Jane Smith', id: 'PT-0002', doctor: 'Dr. Emily', ward: 'Endocrinology', status: 'Active' as const, admitted: 'Yesterday' },
  { name: 'Mike Johnson', id: 'PT-0003', doctor: 'Dr. James', ward: 'Pulmonology', status: 'Critical' as const, admitted: '2 days ago' },
  { name: 'Sarah Wilson', id: 'PT-0004', doctor: 'Dr. Lisa', ward: 'Neurology', status: 'Improving' as const, admitted: '3 days ago' },
]

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
    })
  }, [])

  const handleNewPatient = () => { toast.success('Opening new patient registration...'); router.push('/register') }

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
      {/* Top row - Page title + actions */}
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Patients', value: patients.length || '2,847', delta: '+12%', icon: Users },
          { label: "Today's Appointments", value: '24', delta: '+8 today', icon: Calendar },
          { label: 'Active Doctors', value: '8', delta: 'On duty', icon: Stethoscope },
          { label: 'Bed Occupancy', value: '78%', delta: '85 beds used', icon: Bed },
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
        {/* Line Chart - Patient Admissions */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[--accent]" />
              <span className="text-[12px] text-[--text-3]">Admitted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[--info]" />
              <span className="text-[12px] text-[--text-3]">Discharged</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyAdmissions}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8ECF0" />
              <XAxis dataKey="day" tick={{ fill: '#8A96A3', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8A96A3', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E8ECF0', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }} />
              <Line type="monotone" dataKey="Admitted" stroke="#1A7F6E" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Discharged" stroke="#1A56A4" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Department Load */}
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
        {/* Recent Patients Table */}
        <div className="card">
          <h3 className="section-title mb-4">Recent Patients</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="divide-x divide-[--border]">
                  <th className="label text-left px-4 py-3 bg-[--surface-2]">Patient</th>
                  <th className="label text-left px-4 py-3 bg-[--surface-2]">ID</th>
                  <th className="label text-left px-4 py-3 bg-[--surface-2]">Doctor</th>
                  <th className="label text-left px-4 py-3 bg-[--surface-2]">Ward</th>
                  <th className="label text-left px-4 py-3 bg-[--surface-2]">Status</th>
                  <th className="label text-left px-4 py-3 bg-[--surface-2]">Admitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[--border]">
                {recentPatients.map((patient) => (
                  <tr key={patient.id} className="bg-[--surface] hover:bg-[--surface-2] transition-colors">
                    <td className="px-4 py-3 text-[13px] font-medium text-[--text-1]">{patient.name}</td>
                    <td className="px-4 py-3 text-[13px] text-[--text-3]">{patient.id}</td>
                    <td className="px-4 py-3 text-[13px] text-[--text-2]">{patient.doctor}</td>
                    <td className="px-4 py-3 text-[13px] text-[--text-2]">{patient.ward}</td>
                    <td className="px-4 py-3"><StatusBadge status={patient.status} /></td>
                    <td className="px-4 py-3 text-[13px] text-[--text-3]">{patient.admitted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="card">
          <h3 className="section-title mb-4">Today's Schedule</h3>
          <div className="space-y-0">
            {todaySchedule.map((item) => (
              <div key={`${item.time}-${item.patient}`} className="flex items-start gap-3 py-3 border-b border-[--border] last:border-0">
                <div className="text-[12px] text-[--text-3] w-14 shrink-0 pt-0.5 font-medium">{item.time}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[--text-1] truncate">{item.patient}</p>
                  <p className="caption truncate">{item.type} · {item.doctor}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
          <button className="mt-3 text-[13px] text-[--accent] font-medium hover:underline flex items-center gap-1">
            View all <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
