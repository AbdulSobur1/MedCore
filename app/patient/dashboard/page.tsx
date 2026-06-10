'use client'

import Link from 'next/link'
import { Calendar, ChevronRight, CreditCard, FileText, Pill, Plus } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import type { PatientProfile } from '@/lib/auth'
import { naira } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'

const mockAppointments = [
  { date: '15 Jun 2026', doctor: 'Ahmed Hassan', specialty: 'Cardiology', type: 'Consultation', time: '09:00 AM', room: 'Room 201', status: 'Confirmed' as const },
  { date: '02 May 2026', doctor: 'Emily Garcia', specialty: 'Endocrinology', type: 'Follow-Up', time: '11:30 AM', room: 'Room 305', status: 'Completed' as const },
  { date: '16 Apr 2026', doctor: 'James Wilson', specialty: 'Pulmonology', type: 'Routine', time: '02:00 PM', room: 'Room 402', status: 'Completed' as const },
  { date: '14 Mar 2026', doctor: 'Lisa Chen', specialty: 'Neurology', type: 'Consultation', time: '10:00 AM', room: 'Room 501', status: 'Completed' as const },
  { date: '20 Feb 2026', doctor: 'Ahmed Hassan', specialty: 'Cardiology', type: 'Follow-Up', time: '03:30 PM', room: 'Room 201', status: 'Completed' as const },
]

const mockPrescriptions = [
  { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '30 days', dispensed: false },
  { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '14 days', dispensed: true },
  { name: 'Atorvastatin', dosage: '20mg', frequency: 'Nightly', duration: '30 days', dispensed: false },
]

const mockBills = [
  { service: 'Cardiology consultation', amount: 45000, status: 'Pending' as const },
  { service: 'Lab screening', amount: 18000, status: 'Overdue' as const },
  { service: 'Medication - Metformin', amount: 7500, status: 'Paid' as const },
]

const mockHistory = [
  { date: '02 May 2026', diagnosis: 'Diabetes review', doctor: 'Emily Garcia', dept: 'Endocrinology' },
  { date: '16 Apr 2026', diagnosis: 'Respiratory infection', doctor: 'James Wilson', dept: 'Pulmonology' },
  { date: '14 Mar 2026', diagnosis: 'Annual wellness check', doctor: 'Ahmed Hassan', dept: 'General Medicine' },
  { date: '20 Feb 2026', diagnosis: 'Chest pain evaluation', doctor: 'Ahmed Hassan', dept: 'Cardiology' },
  { date: '15 Jan 2026', diagnosis: 'Migraine assessment', doctor: 'Lisa Chen', dept: 'Neurology' },
  { date: '10 Dec 2025', diagnosis: 'Routine blood work', doctor: 'Emily Garcia', dept: 'Endocrinology' },
]

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Confirmed': 'badge-info',
    'Completed': 'badge-muted',
    'Pending': 'badge-warning',
    'Cancelled': 'badge-danger',
    'Collected': 'badge-success',
    'Ready': 'badge-warning',
    'Paid': 'badge-success',
    'Overdue': 'badge-danger',
  }
  return <span className={`badge ${styles[status] || 'badge-muted'}`}>{status}</span>
}

export default function PatientDashboard() {
  const router = useRouter()
  const { session } = useAuth()
  const [patient, setPatient] = useState<PatientProfile | undefined>()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const patients = JSON.parse(localStorage.getItem('patients') || '{}') as Record<string, PatientProfile>
      setPatient(Object.values(patients).find((p) => p.patientId === session?.userId))
    }
  }, [session?.userId])

  const firstName = (patient?.name || session?.name || 'Patient').split(' ')[0]
  const lastName = (patient?.name || session?.name || 'Patient').split(' ').slice(1).join(' ')
  const initials = ((patient?.name || session?.name || 'P').match(/\b\w/g) || []).slice(0, 2).join('').toUpperCase()
  const nextAppointment = mockAppointments.find((a) => a.status === 'Confirmed')
  const outstandingTotal = mockBills.filter((b) => b.status === 'Pending' || b.status === 'Overdue').reduce((s, b) => s + b.amount, 0)
  const lastVisit = mockHistory[0]

  return (
    <div className="space-y-5">
      {/* Welcome strip */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="caption">Good morning,</p>
          <h1 className="page-title">{firstName} {lastName}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="caption">Patient ID</p>
            <p className="text-[13px] font-semibold text-[--text-1]">{patient?.patientId || session?.userId || '--'}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[--accent-soft] flex items-center justify-center text-[--accent] font-semibold text-[14px]">
            {initials}
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <p className="label mb-1">Next Appointment</p>
          <p className="text-[18px] font-semibold text-[--text-1]">{nextAppointment ? nextAppointment.date : 'None'}</p>
          <p className="caption mt-1">{nextAppointment ? `${nextAppointment.time}` : 'Book now'}</p>
        </div>
        <div className="card">
          <p className="label mb-1">Active Prescriptions</p>
          <p className="text-[18px] font-semibold text-[--text-1]">{mockPrescriptions.filter((p) => !p.dispensed).length}</p>
          <p className="caption mt-1">Ready for pickup</p>
        </div>
        <div className="card">
          <p className="label mb-1">Outstanding Bills</p>
          <p className="text-[18px] font-semibold text-[--text-1]">{naira(outstandingTotal)}</p>
          <p className="caption mt-1">{mockBills.filter((b) => b.status === 'Pending' || b.status === 'Overdue').length} pending</p>
        </div>
        <div className="card">
          <p className="label mb-1">Last Visit</p>
          <p className="text-[18px] font-semibold text-[--text-1]">{lastVisit.date}</p>
          <p className="caption mt-1">{lastVisit.doctor}</p>
        </div>
      </div>

      {/* Main content - grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        {/* Left column */}
        <div className="space-y-5">
          {/* Next Appointment */}
          <div className="card">
            <h3 className="section-title mb-3">Next Appointment</h3>
            {nextAppointment ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[--accent-soft] flex items-center justify-center text-[--accent] font-semibold text-[14px]">
                    {nextAppointment.doctor.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-[--text-1]">Dr. {nextAppointment.doctor}</p>
                    <p className="caption">{nextAppointment.specialty}</p>
                  </div>
                  <div className="ml-auto">
                    <StatusBadge status={nextAppointment.status} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[13px] mb-4">
                  <div><span className="text-[--text-3]">Date: </span><span className="text-[--text-1]">{nextAppointment.date}</span></div>
                  <div><span className="text-[--text-3]">Time: </span><span className="text-[--text-1]">{nextAppointment.time}</span></div>
                </div>
                <div className="flex gap-2">
                  <button className="btn-ghost flex-1">Reschedule</button>
                  <button className="btn-danger flex-1">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="w-10 h-10 rounded-full bg-[--accent-soft] flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-5 h-5 text-[--accent]" />
                </div>
                <p className="text-[13px] text-[--text-3] mb-3">No upcoming appointments</p>
                <button onClick={() => router.push('/patient/appointments')} className="btn-primary inline-flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Book Appointment
                </button>
              </div>
            )}
          </div>

          {/* Recent Appointments */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title">Recent Appointments</h3>
              <Link href="/patient/appointments" className="text-[13px] text-[--accent] font-medium hover:underline flex items-center gap-0.5">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="divide-x divide-[--border]">
                    <th className="label text-left px-4 py-2.5 bg-[--surface-2]">Date</th>
                    <th className="label text-left px-4 py-2.5 bg-[--surface-2]">Doctor</th>
                    <th className="label text-left px-4 py-2.5 bg-[--surface-2]">Type</th>
                    <th className="label text-left px-4 py-2.5 bg-[--surface-2]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[--border]">
                  {mockAppointments.slice(0, 5).map((apt) => (
                    <tr key={`${apt.date}-${apt.doctor}`} className="bg-[--surface] hover:bg-[--surface-2] transition-colors">
                      <td className="px-4 py-2.5 text-[13px] text-[--text-1]">{apt.date}</td>
                      <td className="px-4 py-2.5 text-[13px] text-[--text-2]">Dr. {apt.doctor}</td>
                      <td className="px-4 py-2.5 text-[13px] text-[--text-2]">{apt.type}</td>
                      <td className="px-4 py-2.5"><StatusBadge status={apt.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Medical History Timeline */}
          <div className="card">
            <h3 className="section-title mb-4">Medical History</h3>
            <div className="relative pl-5 border-l-2 border-[--border] space-y-5">
              {mockHistory.slice(0, 6).map((item) => (
                <div key={item.date} className="relative">
                  <div className="absolute -left-[25px] top-0.5 w-2 h-2 rounded-full bg-[--accent] border-2 border-[--surface]" />
                  <p className="caption">{item.date}</p>
                  <p className="text-[13px] font-medium text-[--text-1]">{item.diagnosis}</p>
                  <p className="caption">{item.doctor} · {item.dept}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Active Prescriptions */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="section-title">Prescriptions</h3>
              <span className="badge badge-info">{mockPrescriptions.filter((p) => !p.dispensed).length} active</span>
            </div>
            {mockPrescriptions.map((rx) => (
              <div key={rx.name} className="flex items-center gap-3 py-2.5 border-b border-[--border] last:border-0">
                <div className="w-7 h-7 rounded-md bg-[--accent-soft] flex items-center justify-center shrink-0">
                  <Pill className="w-3.5 h-3.5 text-[--accent]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate text-[--text-1]">{rx.name} {rx.dosage}</p>
                  <p className="caption">{rx.frequency} · {rx.duration}</p>
                </div>
                <StatusBadge status={rx.dispensed ? 'Collected' : 'Ready'} />
              </div>
            ))}
            <Link href="/patient/prescriptions" className="mt-3 text-[13px] text-[--accent] font-medium hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Outstanding Bills */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="section-title">Bills</h3>
              <span className="badge badge-warning">{naira(outstandingTotal)} due</span>
            </div>
            {mockBills.map((bill) => (
              <div key={bill.service} className="flex items-center justify-between py-2.5 border-b border-[--border] last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-[--text-1] truncate">{bill.service}</p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-[13px] font-medium text-[--text-1]">{naira(bill.amount)}</span>
                  <StatusBadge status={bill.status} />
                </div>
              </div>
            ))}
            {(mockBills.some((b) => b.status === 'Pending' || b.status === 'Overdue')) && (
              <button className="mt-3 btn-primary w-full text-center">Pay Now</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
