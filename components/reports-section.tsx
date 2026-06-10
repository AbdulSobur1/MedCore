'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const monthlyPatientData = [
  { month: 'Jan', patients: 320, admitted: 45, discharged: 42 },
  { month: 'Feb', patients: 380, admitted: 52, discharged: 48 },
  { month: 'Mar', patients: 450, admitted: 65, discharged: 61 },
  { month: 'Apr', patients: 520, admitted: 78, discharged: 75 },
  { month: 'May', patients: 580, admitted: 92, discharged: 88 },
  { month: 'Jun', patients: 650, admitted: 105, discharged: 98 },
]

const departmentData = [
  { name: 'Cardiology', value: 285, color: '#1A7F6E' },
  { name: 'Orthopedics', value: 215, color: '#6366F1' },
  { name: 'Neurology', value: 165, color: '#F59E0B' },
  { name: 'Pediatrics', value: 245, color: '#1A56A4' },
  { name: 'General', value: 190, color: '#8B5CF6' },
]

const operationsData = [
  { name: 'Week 1', surgeries: 12, emergencies: 8, procedures: 24 },
  { name: 'Week 2', surgeries: 15, emergencies: 6, procedures: 28 },
  { name: 'Week 3', surgeries: 18, emergencies: 10, procedures: 32 },
  { name: 'Week 4', surgeries: 14, emergencies: 7, procedures: 26 },
]

export function ReportsSection() {
  const [dateRange, setDateRange] = useState('month')

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="caption mt-0.5">Hospital performance metrics and statistics</p>
        </div>
        <div className="flex gap-3">
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}
            className="input-field text-[13px]">
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="btn-primary flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Patients', value: '2,847' },
          { label: 'Avg. Wait Time', value: '24 min' },
          { label: 'Patient Satisfaction', value: '4.6/5.0' },
          { label: 'Bed Occupancy', value: '78%' },
        ].map((metric, idx) => (
          <div key={idx} className="card">
            <p className="label mb-1">{metric.label}</p>
            <p className="text-[24px] font-semibold text-[--text-1]">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="section-title mb-4">Patient Growth Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyPatientData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8ECF0" />
              <XAxis dataKey="month" tick={{ fill: '#8A96A3', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8A96A3', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E8ECF0', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="patients" stroke="#1A7F6E" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="admitted" stroke="#6366F1" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="discharged" stroke="#F59E0B" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="section-title mb-4">Patients by Department</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={departmentData} cx="50%" cy="50%" labelLine={false} label={({ name }) => name} dataKey="value" outerRadius={80}>
                {departmentData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E8ECF0', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card lg:col-span-2">
          <h3 className="section-title mb-4">Operations Overview</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={operationsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8ECF0" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#8A96A3', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8A96A3', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E8ECF0', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="surgeries" fill="#1A7F6E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="emergencies" fill="#C0392B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="procedures" fill="#1A56A4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department stats */}
      <div className="card">
        <h3 className="section-title mb-4">Department Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="divide-x divide-[--border]">
                <th className="label text-left px-4 py-3 bg-[--surface-2]">Department</th>
                <th className="label text-left px-4 py-3 bg-[--surface-2]">Patients</th>
                <th className="label text-left px-4 py-3 bg-[--surface-2]">Staff</th>
                <th className="label text-left px-4 py-3 bg-[--surface-2]">Avg Rating</th>
                <th className="label text-left px-4 py-3 bg-[--surface-2]">Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--border]">
              {[
                { dept: 'Cardiology', patients: 285, staff: 12, rating: 4.8, util: 92 },
                { dept: 'Orthopedics', patients: 215, staff: 8, rating: 4.6, util: 78 },
                { dept: 'Neurology', patients: 165, staff: 6, rating: 4.7, util: 85 },
                { dept: 'Pediatrics', patients: 245, staff: 10, rating: 4.9, util: 88 },
              ].map((row, idx) => (
                <tr key={idx} className="bg-[--surface] hover:bg-[--surface-2] transition-colors">
                  <td className="px-4 py-3 text-[13px] font-medium text-[--text-1]">{row.dept}</td>
                  <td className="px-4 py-3 text-[13px] text-[--text-2]">{row.patients}</td>
                  <td className="px-4 py-3 text-[13px] text-[--text-2]">{row.staff}</td>
                  <td className="px-4 py-3 text-[13px] text-[--text-2]">★ {row.rating}</td>
                  <td className="px-4 py-3">
                    <div className="w-24 bg-[--surface-2] rounded-full h-1.5">
                      <div className="h-full rounded-full bg-[--success]" style={{ width: `${row.util}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
