'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Calendar, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'
import { getAppointments, bookAppointment, cancelAppointment, getStaffMembers } from '@/lib/store'

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Completed': 'badge-muted', 'Pending': 'badge-warning', 'Confirmed': 'badge-info', 'Cancelled': 'badge-danger', 'Scheduled': 'badge-info',
  }
  return <span className={`badge ${styles[status] || 'badge-muted'}`}>{status}</span>
}

export default function PatientAppointmentsPage() {
  const router = useRouter()
  const { session } = useAuth()
  const [tab, setTab] = useState<'Upcoming' | 'Past' | 'Cancelled'>('Upcoming')
  const [bookingOpen, setBookingOpen] = useState(false)
  const [appointments, setAppointments] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [bookingForm, setBookingForm] = useState({ type: 'Consultation', doctor: '', date: '', time: '09:00', notes: '' })

  useEffect(() => {
    const all = getAppointments(session?.userId)
    setAppointments(all)
    setDoctors(getStaffMembers().filter((s) => s.role === 'Doctor'))
  }, [session?.userId])

  const visible = appointments.filter((item) => {
    if (tab === 'Upcoming') return item.status === 'Pending' || item.status === 'Confirmed' || item.status === 'Scheduled'
    if (tab === 'Past') return item.status === 'Completed'
    if (tab === 'Cancelled') return item.status === 'Cancelled'
    return true
  })

  const handleBook = () => {
    if (!bookingForm.doctor || !bookingForm.date) {
      toast.error('Please select a doctor and date')
      return
    }
    const doctor = doctors.find((d) => d.name === bookingForm.doctor)
    const appt = bookAppointment({
      patientId: session?.userId || '',
      patientName: session?.name || 'Patient',
      doctor: bookingForm.doctor,
      department: doctor?.department || 'General',
      type: bookingForm.type,
      date: bookingForm.date,
      time: bookingForm.time,
      notes: bookingForm.notes,
    })
    setAppointments(getAppointments(session?.userId))
    setBookingOpen(false)
    toast.success(`Appointment booked with ${bookingForm.doctor} on ${bookingForm.date}`)
  }

  const handleCancel = (id: string) => {
    cancelAppointment(id)
    setAppointments(getAppointments(session?.userId))
    toast.success('Appointment cancelled')
  }

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

      <div className="flex border-b border-[--border]">
        {(['Upcoming', 'Past', 'Cancelled'] as const).map((item) => (
          <button key={item} onClick={() => setTab(item)}
            className={`px-4 pb-3 text-[13px] font-medium border-b-2 transition-colors ${
              tab === item ? 'border-[--accent] text-[--accent]' : 'border-transparent text-[--text-3] hover:text-[--text-2]'
            }`}>{item}</button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.length === 0 && (
          <div className="card py-10 text-center">
            <div className="w-10 h-10 rounded-full bg-[--accent-soft] flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-5 h-5 text-[--accent]" />
            </div>
            <p className="text-[13px] text-[--text-3]">No {tab.toLowerCase()} appointments</p>
          </div>
        )}
        {visible.map((item: any) => (
          <div key={item.id} className="card flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-[--accent-soft] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-[--accent]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[13px] font-medium text-[--text-1]">{item.type} with {item.doctor}</p>
                  <p className="caption">{item.date} · {item.time} · {item.department}</p>
                  {item.notes && <p className="text-[12px] text-[--text-3] mt-0.5">{item.notes}</p>}
                </div>
                <StatusBadge status={item.status} />
              </div>
              <div className="flex gap-2 mt-3">
                {tab === 'Upcoming' && (
                  <>
                    <button className="btn-ghost text-[12px] py-1.5">Reschedule</button>
                    <button onClick={() => handleCancel(item.id)} className="btn-danger text-[12px] py-1.5">Cancel</button>
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
              <select className="input-field" value={bookingForm.type}
                onChange={(e) => setBookingForm({ ...bookingForm, type: e.target.value })}>
                <option>Consultation</option>
                <option>Follow-Up</option>
                <option>Routine</option>
                <option>Emergency</option>
              </select>
              <select className="input-field" value={bookingForm.doctor}
                onChange={(e) => setBookingForm({ ...bookingForm, doctor: e.target.value })}>
                <option value="">Select doctor</option>
                {doctors.map((d) => <option key={d.id} value={d.name}>{d.name} ({d.department})</option>)}
              </select>
              <input className="input-field" type="date" value={bookingForm.date}
                onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                min={new Date().toISOString().slice(0, 10)} />
              <select className="input-field" value={bookingForm.time}
                onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}>
                {Array.from({ length: 21 }, (_, i) =>
                  `${String(8 + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`
                ).map((slot) => <option key={slot}>{slot}</option>)}
              </select>
              <textarea className="input-field sm:col-span-2 resize-none" placeholder="Notes (optional)" rows={3}
                value={bookingForm.notes}
                onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setBookingOpen(false)} className="btn-ghost">Cancel</button>
              <button onClick={handleBook} className="btn-primary">Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
