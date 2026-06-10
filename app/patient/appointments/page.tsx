'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Calendar, Plus, X, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

const doctors = [
  { name: 'Ahmed Hassan', department: 'Cardiology' },
  { name: 'Emily Garcia', department: 'Endocrinology' },
  { name: 'James Wilson', department: 'Pulmonology' },
  { name: 'Lisa Chen', department: 'Neurology' },
]

const appointments = [
  { group: 'Upcoming', date: '15 Jun 2026', doctor: 'Ahmed Hassan', department: 'Cardiology', type: 'Consultation', status: 'Pending', reason: '' },
  { group: 'Past', date: '02 May 2026', doctor: 'Emily Garcia', department: 'Endocrinology', type: 'Follow-Up', status: 'Completed', reason: '' },
  { group: 'Past', date: '16 Apr 2026', doctor: 'James Wilson', department: 'Pulmonology', type: 'Routine', status: 'Completed', reason: '' },
  { group: 'Cancelled', date: '20 Apr 2026', doctor: 'James Wilson', department: 'Pulmonology', type: 'Routine', status: 'Cancelled', reason: 'Patient requested reschedule' },
]

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Completed': 'badge-muted',
    'Pending': 'badge-warning',
    'Confirmed': 'badge-info',
    'Cancelled': 'badge-danger',
  }
  return <span className={`badge ${styles[status] || 'badge-muted'}`}>{status}</span>
}

export default function PatientAppointmentsPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'Upcoming' | 'Past' | 'Cancelled'>('Upcoming')
  const [bookingOpen, setBookingOpen] = useState(false)
  const visible = appointments.filter((item) => item.group === tab)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="caption mt-0.5">Book and manage your visits</p>
        </div>
        <button onClick={() => setBookingOpen(true)} className="btn-primary flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          Book New
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[--border]">
        {(['Upcoming', 'Past', 'Cancelled'] as const).map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`px-4 pb-3 text-[13px] font-medium border-b-2 transition-colors ${
              tab === item
                ? 'border-[--accent] text-[--accent]'
                : 'border-transparent text-[--text-3] hover:text-[--text-2]'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Appointments list */}
      <div className="space-y-3">
        {visible.length === 0 && (
          <div className="card py-10 text-center">
            <div className="w-10 h-10 rounded-full bg-[--accent-soft] flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-5 h-5 text-[--accent]" />
            </div>
            <p className="text-[13px] text-[--text-3]">No {tab.toLowerCase()} appointments</p>
          </div>
        )}
        {visible.map((item) => (
          <div key={`${item.date}-${item.doctor}`} className="card flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-[--accent-soft] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-[--accent]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[13px] font-medium text-[--text-1]">{item.type} with Dr. {item.doctor}</p>
                  <p className="caption">{item.date} · {item.department}</p>
                  {item.reason && <p className="text-[12px] text-[--danger] mt-0.5">{item.reason}</p>}
                </div>
                <StatusBadge status={item.status} />
              </div>
              <div className="flex gap-2 mt-3">
                {tab === 'Upcoming' && (
                  <>
                    <button className="btn-ghost text-[12px] py-1.5">Reschedule</button>
                    <button className="btn-danger text-[12px] py-1.5">Cancel</button>
                  </>
                )}
                {tab === 'Past' && (
                  <button className="btn-ghost text-[12px] py-1.5">View Summary</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking modal */}
      {bookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-lg bg-[--surface] rounded-xl border border-[--border] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Book Appointment</h2>
              <button onClick={() => setBookingOpen(false)} className="p-1 rounded hover:bg-[--surface-2]">
                <X className="w-4 h-4 text-[--text-3]" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select className="input-field col-span-1">
                <option>Consultation</option>
                <option>Follow-Up</option>
                <option>Routine</option>
                <option>Emergency</option>
              </select>
              <select className="input-field col-span-1">
                {doctors.map((doctor) => <option key={doctor.name}>Dr. {doctor.name}</option>)}
              </select>
              <input className="input-field col-span-1" placeholder="Department" value="Cardiology" readOnly />
              <input className="input-field col-span-1" type="date" min={new Date().toISOString().slice(0, 10)} />
              <select className="input-field col-span-1">
                {Array.from({ length: 21 }, (_, i) =>
                  `${String(8 + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`
                ).map((slot) => <option key={slot}>{slot}</option>)}
              </select>
              <textarea className="input-field sm:col-span-2 resize-none" placeholder="Notes (optional)" rows={3} />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setBookingOpen(false)} className="btn-ghost">Cancel</button>
              <button onClick={() => { setBookingOpen(false); toast.success('Appointment request submitted!'); }} className="btn-primary">
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
