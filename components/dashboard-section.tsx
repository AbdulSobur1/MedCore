'use client'

import { Users, Calendar, Activity, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const weeklyData = [
  { day: 'Mon', patients: 45, appointments: 40 },
  { day: 'Tue', patients: 52, appointments: 42 },
  { day: 'Wed', patients: 48, appointments: 38 },
  { day: 'Thu', patients: 61, appointments: 45 },
  { day: 'Fri', patients: 55, appointments: 50 },
  { day: 'Sat', patients: 40, appointments: 35 },
  { day: 'Sun', patients: 30, appointments: 28 },
]

const deptData = [
  { dept: 'Cardiology', performance: 82 },
  { dept: 'Pediatrics', performance: 78 },
  { dept: 'Neurology', performance: 65 },
  { dept: 'Surgery', performance: 95 },
  { dept: 'Maternity', performance: 74 },
]

const recentPatients = [
  { id: 1, name: 'John Doe', condition: 'Hypertension', status: 'Stable', lastVisit: '2 days ago' },
  { id: 2, name: 'Jane Smith', condition: 'Diabetes', status: 'Monitoring', lastVisit: '1 week ago' },
  { id: 3, name: 'Mike Johnson', condition: 'Cardiac', status: 'Critical', lastVisit: 'Today' },
  { id: 4, name: 'Sarah Wilson', condition: 'Respiratory', status: 'Improving', lastVisit: '3 days ago' },
]

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Stable': 'badge-success',
    'Monitoring': 'badge-warning',
    'Critical': 'badge-danger',
    'Improving': 'badge-info',
  }
  return <span className={`badge ${styles[status] || 'badge-muted'}`}>{status}</span>
}

export function DashboardSection() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <p className="label mb-1">Total Patients</p>
          <p className="text-[24px] font-semibold text-[--text-1]">2,847</p>
          <p className="caption mt-1 text-[--success]">↑ +12% this month</p>
        </div>
        <div className="card">
          <p className="label mb-1">Appointments Today</p>
          <p className="text-[24px] font-semibold text-[--text-1]">24</p>
          <p className="caption mt-1">8 completed</p>
        </div>
        <div className="card">
          <p className="label mb-1">Active Cases</p>
          <p className="text-[24px] font-semibold text-[--text-1]">156</p>
          <p className="caption mt-1">+5 since yesterday</p>
        </div>
        <div className="card">
          <p className="label mb-1">Bed Occupancy</p>
          <p className="text-[24px] font-semibold text-[--text-1]">78%</p>
          <p className="caption mt-1">High capacity</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="section-title mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8ECF0" />
              <XAxis dataKey="day" tick={{ fill: '#8A96A3', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8A96A3', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E8ECF0', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }} />
              <Line type="monotone" dataKey="patients" stroke="#1A7F6E" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="appointments" stroke="#6366F1" strokeWidth={2} dot={false} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="section-title mb-4">Department Performance</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8ECF0" vertical={false} />
              <XAxis dataKey="dept" tick={{ fill: '#8A96A3', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#8A96A3', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E8ECF0', borderRadius: '8px' }} />
              <Bar dataKey="performance" fill="#1A7F6E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Patients */}
      <div className="card">
        <h3 className="section-title mb-4">Recent Patient Visits</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="divide-x divide-[--border]">
                <th className="label text-left px-4 py-3 bg-[--surface-2]">Patient</th>
                <th className="label text-left px-4 py-3 bg-[--surface-2]">Condition</th>
                <th className="label text-left px-4 py-3 bg-[--surface-2]">Status</th>
                <th className="label text-left px-4 py-3 bg-[--surface-2]">Last Visit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--border]">
              {recentPatients.map((patient) => (
                <tr key={patient.id} className="bg-[--surface] hover:bg-[--surface-2] transition-colors">
                  <td className="px-4 py-3 text-[13px] font-medium text-[--text-1]">{patient.name}</td>
                  <td className="px-4 py-3 text-[13px] text-[--text-2]">{patient.condition}</td>
                  <td className="px-4 py-3"><StatusBadge status={patient.status} /></td>
                  <td className="px-4 py-3 text-[13px] text-[--text-3]">{patient.lastVisit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
