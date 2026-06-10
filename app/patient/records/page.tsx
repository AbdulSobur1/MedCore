'use client'

import { useState, useEffect, useRef } from 'react'
import { Edit2, X } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import type { PatientProfile } from '@/lib/auth'
import { toast } from 'sonner'
import { getVitals, getMedicalFlags } from '@/lib/store'

export default function PatientRecordsPage() {
  const { session } = useAuth()
  const [editing, setEditing] = useState(false)
  const [patient, setPatient] = useState<PatientProfile | undefined>()
  const [vitals, setVitals] = useState<any[]>([])
  const [medicalFlags, setMedicalFlags] = useState<any[]>([])
  const phoneRef = useRef<HTMLInputElement>(null)
  const emergencyRef = useRef<HTMLInputElement>(null)
  const addressRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && session?.userId) {
      const patients = JSON.parse(localStorage.getItem('patients') || '{}') as Record<string, PatientProfile>
      setPatient(Object.values(patients).find((p) => p.patientId === session.userId))
      setVitals(getVitals(session.userId))
      setMedicalFlags(getMedicalFlags(session.userId))
    }
  }, [session?.userId])

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
    ['Patient ID', patient?.patientId || session?.userId],
    ['Registration Date', patient?.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'Not recorded'],
    ['Status', 'Active'],
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">My Records</h1>
          <p className="caption mt-0.5">Your biodata and clinical summary</p>
        </div>
        <button onClick={() => setEditing(true)} className="btn-ghost flex items-center gap-1.5">
          <Edit2 className="w-3.5 h-3.5" />
          Edit
        </button>
      </div>

      {/* Biodata - REAL PATIENT DATA */}
      <div className="card">
        <h3 className="section-title mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {fields.map(([label, value]) => (
            <div key={label as string} className="p-3 rounded-lg bg-[--surface-2]">
              <p className="label mb-0.5">{label as string}</p>
              <p className="text-[13px] font-medium text-[--text-1]">{value as string | number}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Vitals History - REAL DATA */}
      <div className="card">
        <h3 className="section-title mb-4">Vitals History</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="divide-x divide-[--border]">
                <th className="label text-left px-4 py-3 bg-[--surface-2]">Date</th>
                <th className="label text-left px-4 py-3 bg-[--surface-2]">BP</th>
                <th className="label text-left px-4 py-3 bg-[--surface-2]">Pulse</th>
                <th className="label text-left px-4 py-3 bg-[--surface-2]">Temp</th>
                <th className="label text-left px-4 py-3 bg-[--surface-2]">SpO₂</th>
                <th className="label text-left px-4 py-3 bg-[--surface-2]">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--border]">
              {vitals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[13px] text-[--text-3]">No vitals recorded yet</td>
                </tr>
              ) : vitals.slice().reverse().map((row: any) => (
                <tr key={row.id} className="bg-[--surface] hover:bg-[--surface-2] transition-colors">
                  <td className="px-4 py-3 text-[13px] text-[--text-1]">{row.date}</td>
                  <td className="px-4 py-3 text-[13px] text-[--text-2]">{row.bp}</td>
                  <td className="px-4 py-3 text-[13px] text-[--text-2]">{row.pulse}</td>
                  <td className="px-4 py-3 text-[13px] text-[--text-2]">{row.temp}</td>
                  <td className="px-4 py-3 text-[13px] text-[--text-2]">{row.spo2}</td>
                  <td className="px-4 py-3 text-[13px] text-[--text-3]">{row.recordedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Medical Flags */}
      <div className="card">
        <h3 className="section-title mb-4">Medical Flags</h3>
        {medicalFlags.length === 0 ? (
          <p className="text-[13px] text-[--text-3] py-2">No medical flags recorded</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {medicalFlags.map((f: any) => (
              <span key={f.id} className="px-3 py-1.5 rounded-full border border-[--danger-soft] bg-[--danger-soft] text-[12px] font-medium text-[--danger]">{f.flag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-lg bg-[--surface] rounded-xl border border-[--border] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Edit Contact Details</h2>
              <button onClick={() => setEditing(false)} className="p-1 rounded hover:bg-[--surface-2]">
                <X className="w-4 h-4 text-[--text-3]" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input ref={phoneRef} className="input-field" defaultValue={patient?.phone} placeholder="Phone" />
              <input ref={emergencyRef} className="input-field" defaultValue={patient?.emergencyContact} placeholder="Emergency contact" />
              <input ref={addressRef} className="input-field sm:col-span-2" defaultValue={patient?.address} placeholder="Address" />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setEditing(false)} className="btn-ghost">Cancel</button>
              <button onClick={() => {
                if (!patient || !session?.userId) return
                const patients = JSON.parse(localStorage.getItem('patients') || '{}') as Record<string, PatientProfile>
                patients[session.userId] = {
                  ...patients[session.userId],
                  phone: phoneRef.current?.value || patient.phone,
                  emergencyContact: emergencyRef.current?.value || patient.emergencyContact,
                  address: addressRef.current?.value || patient.address,
                }
                localStorage.setItem('patients', JSON.stringify(patients))
                setPatient(patients[session.userId])
                setEditing(false)
                toast.success('Contact details updated!')
              }} className="btn-primary">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
