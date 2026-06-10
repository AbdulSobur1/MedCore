'use client'

import { useState, useEffect, useRef } from 'react'
import { Edit2, X } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import type { PatientProfile } from '@/lib/auth'
import { toast } from 'sonner'

export default function PatientProfilePage() {
  const { session } = useAuth()
  const [editing, setEditing] = useState(false)
  const [patient, setPatient] = useState<PatientProfile | undefined>()
  const phoneRef = useRef<HTMLInputElement>(null)
  const emergencyRef = useRef<HTMLInputElement>(null)
  const addressRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const patients = JSON.parse(localStorage.getItem('patients') || '{}') as Record<string, PatientProfile>
      setPatient(Object.values(patients).find((p) => p.patientId === session?.userId))
    }
  }, [session?.userId])

  const name = patient?.name || session?.name || 'Patient'

  const handleSave = () => {
    if (!patient || !session?.userId) return
    const patients = JSON.parse(localStorage.getItem('patients') || '{}') as Record<string, PatientProfile>
    const updated = {
      ...patients[session.userId],
      phone: phoneRef.current?.value || patient.phone,
      emergencyContact: emergencyRef.current?.value || patient.emergencyContact,
      address: addressRef.current?.value || patient.address,
    }
    patients[session.userId] = updated
    localStorage.setItem('patients', JSON.stringify(patients))
    setPatient(updated)
    setEditing(false)
    toast.success('Profile updated successfully!')
  }

  const fields = [
    ['Email', patient?.email || session?.email],
    ['Phone', patient?.phone || 'Not recorded'],
    ['Blood Type', patient?.bloodType || 'Not recorded'],
    ['Gender', patient?.gender || 'Not recorded'],
    ['Date of Birth', patient?.dateOfBirth || 'Not recorded'],
    ['Address', patient?.address || 'Not recorded'],
    ['Emergency Contact', patient?.emergencyContact || 'Not recorded'],
    ['Patient ID', patient?.patientId || session?.userId || '--'],
  ]

  return (
    <div className="max-w-2xl space-y-5">
      <div className="card">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-[--accent] flex items-center justify-center text-white text-xl font-bold shrink-0">
            {name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="page-title">{name}</h1>
            <p className="text-[13px] text-[--text-3]">{patient?.patientId || session?.userId}</p>
            <span className="badge badge-success mt-2 inline-block">Active</span>
          </div>
          <button onClick={() => setEditing(true)} className="btn-ghost flex items-center gap-1.5">
            <Edit2 className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {fields.map(([label, value]) => (
            <div key={label} className="p-3 rounded-lg bg-[--surface-2]">
              <p className="label mb-0.5">{label}</p>
              <p className="text-[13px] font-medium text-[--text-1]">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="section-title mb-4">Security</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-[13px]">
            <span className="text-[--text-3]">Email</span>
            <span className="font-medium text-[--text-1]">{patient?.email || session?.email}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-[--text-3]">Login method</span>
            <span className="font-medium text-[--text-1]">
              Email OTP (passwordless)
              <span className="badge badge-success ml-2">Active</span>
            </span>
          </div>
          <button className="text-[13px] text-[--accent] font-medium hover:underline">Change email</button>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-lg bg-[--surface] rounded-xl border border-[--border] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Edit Profile</h2>
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
              <button onClick={handleSave} className="btn-primary">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
