'use client'

import { useState } from 'react'
import { Calendar, Plus } from 'lucide-react'

const doctors = [
  { name: 'Ahmed Hassan', department: 'Cardiology' },
  { name: 'Emily Garcia', department: 'Endocrinology' },
  { name: 'James Wilson', department: 'Pulmonology' },
]

const appointments = [
  { group: 'Upcoming', date: '15 Jun 2026', doctor: 'Ahmed Hassan', department: 'Cardiology', type: 'Consultation', status: 'Pending', reason: '' },
  { group: 'Past', date: '02 May 2026', doctor: 'Emily Garcia', department: 'Endocrinology', type: 'Follow-Up', status: 'Completed', reason: '' },
  { group: 'Cancelled', date: '20 Apr 2026', doctor: 'James Wilson', department: 'Pulmonology', type: 'Routine', status: 'Cancelled', reason: 'Patient requested reschedule' },
]

export default function PatientAppointmentsPage() {
  const [tab, setTab] = useState<'Upcoming' | 'Past' | 'Cancelled'>('Upcoming')
  const [bookingOpen, setBookingOpen] = useState(false)
  const visible = appointments.filter((item) => item.group === tab)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
          <p className="mt-2 text-muted-foreground">Book and manage your visits</p>
        </div>
        <button onClick={() => setBookingOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          <Plus className="h-4 w-4" /> Book New Appointment
        </button>
      </div>

      <div className="flex border-b border-slate-200">
        {(['Upcoming', 'Past', 'Cancelled'] as const).map((item) => (
          <button key={item} onClick={() => setTab(item)} className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${tab === item ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>{item}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {visible.map((item) => (
          <div key={`${item.date}-${item.doctor}`} className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-white p-4 sm:flex-row sm:items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50"><Calendar className="h-5 w-5 text-teal-600" /></div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-slate-700">{item.type} with Dr. {item.doctor}</p>
              <p className="text-sm text-slate-500">{item.date} · {item.department}</p>
              {item.reason && <p className="text-xs text-red-500">{item.reason}</p>}
            </div>
            <div className="flex gap-2">
              {tab === 'Upcoming' && <><button className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600">Reschedule</button><button className="rounded-lg border border-red-100 px-3 py-2 text-sm text-red-500">Cancel</button></>}
              {tab === 'Past' && <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600">View Summary</button>}
            </div>
          </div>
        ))}
      </div>

      {bookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5">
            <h2 className="text-lg font-semibold">Book Appointment</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm"><option>Consultation</option><option>Follow-Up</option><option>Routine</option><option>Emergency</option></select>
              <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm">{doctors.map((doctor) => <option key={doctor.name}>Dr. {doctor.name}</option>)}</select>
              <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value="Cardiology" readOnly />
              <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" type="date" min={new Date().toISOString().slice(0, 10)} />
              <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm">{Array.from({ length: 21 }, (_, i) => `${String(8 + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`).map((slot) => <option key={slot}>{slot}</option>)}</select>
              <textarea className="rounded-lg border border-slate-200 px-3 py-2 text-sm sm:col-span-2" placeholder="Notes (optional)" />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm" onClick={() => setBookingOpen(false)}>Cancel</button>
              <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" onClick={() => setBookingOpen(false)}>Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
