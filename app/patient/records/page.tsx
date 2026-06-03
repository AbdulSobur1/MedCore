'use client'

import { useState } from 'react'
import { Edit2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import type { PatientProfile } from '@/lib/auth'

const vitals = [
  { date: '02 May 2026', bp: '122/78', pulse: '78', temp: '36.8°C', spo2: '98%', by: 'Nurse Ada' },
  { date: '16 Apr 2026', bp: '128/82', pulse: '81', temp: '37.1°C', spo2: '97%', by: 'Nurse Musa' },
]

export default function PatientRecordsPage() {
  const { session } = useAuth()
  const [editing, setEditing] = useState(false)
  const patient = typeof window !== 'undefined'
    ? (Object.values(JSON.parse(localStorage.getItem('patients') || '{}')) as PatientProfile[]).find((item) => item.patientId === session?.userId)
    : undefined
  const dob = patient?.dateOfBirth ? new Date(patient.dateOfBirth) : null
  const age = dob ? new Date().getFullYear() - dob.getFullYear() : 'Not recorded'
  const fields = [
    ['Full Name', patient?.name || session?.name],
    ['DOB', patient?.dateOfBirth || 'Not recorded'],
    ['Age', age],
    ['Gender', patient?.gender || 'Not recorded'],
    ['Blood Type', patient?.bloodType || 'Not recorded'],
    ['Phone', patient?.phone || 'Not recorded'],
    ['Address', patient?.address || 'Not recorded'],
    ['Emergency Contact', patient?.emergencyContact || 'Not recorded'],
    ['Insurance/HMO', 'Not recorded'],
    ['Patient ID', patient?.patientId || session?.userId],
    ['Registration Date', patient?.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'Not recorded'],
    ['Assigned Doctor', 'Dr. Ahmed Hassan'],
    ['Status', 'Active'],
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Records</h1>
          <p className="mt-2 text-muted-foreground">Your biodata and clinical summary</p>
        </div>
        <button onClick={() => setEditing(true)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          <Edit2 className="h-4 w-4" /> Edit
        </button>
      </div>

      <section className="rounded-xl border border-slate-100 bg-white p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {fields.map(([label, value]) => (
            <div key={label} className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-1 text-sm font-medium text-slate-700">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-100 bg-white p-5">
        <h3 className="mb-4 font-semibold text-slate-700">Vitals History</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="text-left text-slate-500"><tr><th className="py-2">Date</th><th>BP</th><th>Pulse</th><th>Temp</th><th>SpO₂</th><th>Recorded By</th></tr></thead>
            <tbody>{vitals.map((row) => <tr key={row.date} className="border-t border-slate-100"><td className="py-3">{row.date}</td><td>{row.bp}</td><td>{row.pulse}</td><td>{row.temp}</td><td>{row.spo2}</td><td>{row.by}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-slate-100 bg-white p-5">
        <h3 className="mb-4 font-semibold text-slate-700">Allergy / Medical Flags</h3>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-medium text-red-700">Penicillin allergy</span>
          <span className="rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-medium text-red-700">Hypertension risk</span>
        </div>
      </section>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5">
            <h2 className="text-lg font-semibold">Edit Contact Details</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" defaultValue={patient?.phone} placeholder="Phone" />
              <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" defaultValue={patient?.emergencyContact} placeholder="Emergency contact" />
              <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm sm:col-span-2" defaultValue={patient?.address} placeholder="Address" />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm" onClick={() => setEditing(false)}>Cancel</button>
              <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" onClick={() => setEditing(false)}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
