'use client'

import { useState } from 'react'
import { Edit2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import type { PatientProfile } from '@/lib/auth'

export default function PatientProfilePage() {
  const { session } = useAuth()
  const [editing, setEditing] = useState(false)
  const patient = typeof window !== 'undefined'
    ? (Object.values(JSON.parse(localStorage.getItem('patients') || '{}')) as PatientProfile[]).find((item) => item.patientId === session?.userId)
    : undefined
  const name = patient?.name || session?.name || 'Patient'

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <section className="rounded-xl border border-slate-100 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-teal-600 text-xl font-bold text-white">{name.slice(0, 1)}</div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-slate-800">{name}</h1>
            <p className="break-all text-sm text-slate-500">{patient?.patientId || session?.userId}</p>
            <span className="mt-2 inline-block rounded-full bg-teal-100 px-2 py-1 text-xs font-medium text-teal-800">Active</span>
          </div>
          <button onClick={() => setEditing(true)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            <Edit2 className="h-4 w-4" /> Edit
          </button>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            ['Email', patient?.email || session?.email],
            ['Phone', patient?.phone || 'Not recorded'],
            ['Blood Type', patient?.bloodType || 'Not recorded'],
            ['Gender', patient?.gender || 'Not recorded'],
            ['Address', patient?.address || 'Not recorded'],
            ['Emergency Contact', patient?.emergencyContact || 'Not recorded'],
          ].map(([label, value]) => <div key={label} className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-sm font-medium text-slate-700">{value}</p></div>)}
        </div>
      </section>

      <section className="rounded-xl border border-slate-100 bg-white p-5">
        <h2 className="mb-4 font-semibold text-slate-700">Security</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between gap-3"><span className="text-slate-500">Email</span><span className="break-all text-right font-medium">{patient?.email || session?.email}</span></div>
          <div className="flex justify-between gap-3"><span className="text-slate-500">Login method</span><span className="font-medium">Email OTP (passwordless) <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">Active</span></span></div>
          <button className="text-sm font-medium text-teal-600 hover:underline">Change email</button>
        </div>
      </section>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5">
            <h2 className="text-lg font-semibold">Edit Profile</h2>
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
