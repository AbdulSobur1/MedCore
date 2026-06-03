'use client'

import { Users, Calendar, Activity, TrendingUp } from 'lucide-react'
import { StatCard } from './stat-card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const weeklyData = [
  { day: 0, patients: 45, appointments: 40 },
  { day: 1, patients: 52, appointments: 42 },
  { day: 2, patients: 48, appointments: 38 },
  { day: 3, patients: 61, appointments: 45 },
  { day: 4, patients: 55, appointments: 50 },
  { day: 5, patients: 40, appointments: 35 },
  { day: 6, patients: 30, appointments: 28 },
]

const deptData = [
  { index: 0, dept: 'Cardiology', performance: 82 },
  { index: 1, dept: 'Pediatrics', performance: 78 },
  { index: 2, dept: 'Neurology', performance: 65 },
  { index: 3, dept: 'Surgery', performance: 95 },
  { index: 4, dept: 'Maternity', performance: 74 },
]

const recentPatients = [
  { id: 1, name: 'John Doe', condition: 'Hypertension', status: 'Stable', lastVisit: '2 days ago' },
  { id: 2, name: 'Jane Smith', condition: 'Diabetes', status: 'Monitoring', lastVisit: '1 week ago' },
  { id: 3, name: 'Mike Johnson', condition: 'Cardiac', status: 'Critical', lastVisit: 'Today' },
  { id: 4, name: 'Sarah Wilson', condition: 'Respiratory', status: 'Improving', lastVisit: '3 days ago' },
]

export function DashboardSection() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-foreground">Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Patients" value="2,847" change="+12% from last month" icon={Users} color="teal" />
        <StatCard
          title="Appointments Today"
          value="24"
          change="8 completed"
          icon={Calendar}
          color="emerald"
        />
        <StatCard title="Active Cases" value="156" change="+5 since yesterday" icon={Activity} color="rose" />
        <StatCard title="Hospital Occupancy" value="78%" change="High capacity" icon={TrendingUp} color="amber" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Line Chart */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-5">
          <h3 className="font-semibold text-foreground mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="patients" stroke="#0d9488" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="appointments" stroke="#6366f1" strokeWidth={2} dot={false} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-5">
          <h3 className="font-semibold text-foreground mb-4">Department Performance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="index" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="performance" fill="#0d9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Patients */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <h3 className="text-sm sm:text-lg font-semibold text-foreground mb-4">Recent Patient Visits</h3>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[640px] text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-medium text-muted-foreground">Patient</th>
                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-medium text-muted-foreground hidden sm:table-cell">Condition</th>
                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-medium text-muted-foreground hidden md:table-cell">Last Visit</th>
              </tr>
            </thead>
            <tbody>
              {recentPatients.map((patient) => (
                <tr key={patient.id} className="border-b border-border hover:bg-muted transition-colors">
                  <td className="py-2 sm:py-3 px-3 sm:px-4 text-foreground">
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">{patient.condition}</p>
                    </div>
                  </td>
                  <td className="py-2 sm:py-3 px-3 sm:px-4 text-foreground hidden sm:table-cell">{patient.condition}</td>
                  <td className="py-2 sm:py-3 px-3 sm:px-4">
                    <span
                      className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                        patient.status === 'Critical'
                          ? 'bg-destructive/20 text-destructive'
                          : patient.status === 'Stable'
                            ? 'bg-success/20 text-success'
                            : patient.status === 'Monitoring'
                              ? 'bg-warning/20 text-warning'
                              : 'bg-info/20 text-info'
                      }`}
                    >
                      {patient.status}
                    </span>
                  </td>
                  <td className="py-2 sm:py-3 px-3 sm:px-4 text-muted-foreground hidden md:table-cell">{patient.lastVisit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
