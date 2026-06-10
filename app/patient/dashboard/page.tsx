'use client'

import Link from 'next/link'
import { Calendar, ChevronRight, Pill, Plus } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import type { PatientProfile } from '@/lib/auth'
import { naira } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getAppointments, getPrescriptions, getInvoices, getVitals } from '@/lib/store'

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Confirmed': 'badge-info', 'Completed': 'badge-muted', 'Pending': 'badge-warning',
    'Cancelled': 'badge-danger', 'Collected': 'badge-success', 'Ready': 'badge-warning',
    'Paid': 'badge-success', 'Overdue': 'badge-danger', 'Active': 'badge-info', 'Dispensed': 'badge-success',
  }
  return <span className={`badge ${styles[status] || 'badge-muted'}`}>{status}</span>
}

export default function PatientDashboard() {
  const router = useRouter()
  const { session } = useAuth()
  const [patient, setPatient] = useState<PatientProfile | undefined>()
  const [appointments, setAppointments] = useState<any[]>([])
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [vitals, setVitals] = useState<any[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined' && session?.userId) {
      const patients = JSON.parse(localStorage.getItem('patients') || '{}') as Record<string, PatientProfile>
      setPatient(Object.values(patients).find((p) => p.patientId === session.userId))
      setAppointments(getAppointments(session.userId))
      setPrescriptions(getPrescriptions(session.userId))
      setInvoices(getInvoices(session.userId))
      setVitals(getVitals(session.userId))
    }
  }, [session?.userId])

  const firstName = (patient?.name || session?.name || 'Patient').split(' ')[0]
  const lastName = (patient?.name || session?.name || 'Patient').split(' ').slice(1).join(' ')
  const initials = ((patient?.name || session?.name || 'P').match(/\b\w/g) || []).slice(0, 2).join('').toUpperCase()

  const nextAppointment = appointments.find((a) => a.status === 'Confirmed' || a.status === 'Pending')
  const activePrescriptions = prescriptions.filter((p) => p.status === 'Active' || p.status === 'Ready')
  const outstandingTotal = invoices.filter((b) => b.status === 'Pending' || b.status === 'Overdue').reduce((s: number, b: any) => s + b.amount, 0)
  const lastVisit = vitals.length > 0 ? vitals[vitals.length - 1] : null
  const recentAppts = appointments.slice(-5).reverse()

  return (
    <div className="space-y-5">
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

      {/* KPI row - real data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <p className="label mb-1">Next Appointment</p>
          <p className="text-[18px] font-semibold text-[--text-1]">{nextAppointment ? nextAppointment.date : 'None'}</p>
          <p className="caption mt-1">{nextAppointment ? nextAppointment.time : 'Book now'}</p>
        </div>
        <div className="card">
          <p className="label mb-1">Active Prescriptions</p>
          <p className="text-[18px] font-semibold text-[--text-1]">{activePrescriptions.length}</p>
          <p className="caption mt-1">{activePrescriptions.length > 0 ? 'Ready for pickup' : 'No active Rx'}</p>
        </div>
        <div className="card">
          <p className="label mb-1">Outstanding Bills</p>
          <p className="text-[18px] font-semibold text-[--text-1]">{naira(outstandingTotal)}</p>
          <p className="caption mt-1">{invoices.filter((b) => b.status === 'Pending' || b.status === 'Overdue').length} pending</p>
        </div>
        <div className="card">
          <p className="label mb-1">Last Visit</p>
          <p className="text-[18px] font-semibold text-[--text-1]">{lastVisit ? lastVisit.date : '—'}</p>
          <p className="caption mt-1">{lastVisit ? lastVisit.recordedBy : 'No visits'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-5">
          {/* Next Appointment - real data */}
          <div className="card">
            <h3 className="section-title mb-3">Next Appointment</h3>
            {nextAppointment ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[--accent-soft] flex items-center justify-center text-[--accent] font-semibold text-[14px]">
                    {nextAppointment.doctor.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-[--text-1]">{nextAppointment.doctor}</p>
                    <p className="caption">{nextAppointment.department}</p>
                  </div>
                  <div className="ml-auto"><StatusBadge status={nextAppointment.status} /></div>
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

          {/* Recent Appointments - real data */}
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
                  {recentAppts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-[13px] text-[--text-3]">No appointments yet</td>
                    </tr>
                  ) : recentAppts.map((apt: any) => (
                    <tr key={apt.id} className="bg-[--surface] hover:bg-[--surface-2] transition-colors">
                      <td className="px-4 py-2.5 text-[13px] text-[--text-1]">{apt.date}</td>
                      <td className="px-4 py-2.5 text-[13px] text-[--text-2]">{apt.doctor}</td>
                      <td className="px-4 py-2.5 text-[13px] text-[--text-2]">{apt.type}</td>
                      <td className="px-4 py-2.5"><StatusBadge status={apt.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Medical History Timeline - real vitals */}
          <div className="card">
            <h3 className="section-title mb-4">Vitals History</h3>
            {vitals.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-[13px] text-[--text-3]">No vitals recorded yet</p>
              </div>
            ) : (
              <div className="relative pl-5 border-l-2 border-[--border] space-y-5">
                {vitals.slice(-6).reverse().map((item: any) => (
                  <div key={item.id} className="relative">
                    <div className="absolute -left-[25px] top-0.5 w-2 h-2 rounded-full bg-[--accent] border-2 border-[--surface]" />
                    <p className="caption">{item.date}</p>
                    <p className="text-[13px] font-medium text-[--text-1]">BP: {item.bp} · Pulse: {item.pulse}</p>
                    <p className="caption">Temp: {item.temp} · SpO₂: {item.spo2} · By: {item.recordedBy}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          {/* Active Prescriptions - real data */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="section-title">Prescriptions</h3>
              <span className="badge badge-info">{activePrescriptions.length} active</span>
            </div>
            {activePrescriptions.length === 0 ? (
              <div className="py-6 text-center">
                <Pill className="w-5 h-5 text-[--text-3] mx-auto mb-2" />
                <p className="text-[13px] text-[--text-3]">No active prescriptions</p>
              </div>
            ) : activePrescriptions.slice(0, 3).map((rx: any) => (
              <div key={rx.id} className="flex items-center gap-3 py-2.5 border-b border-[--border] last:border-0">
                <div className="w-7 h-7 rounded-md bg-[--accent-soft] flex items-center justify-center shrink-0">
                  <Pill className="w-3.5 h-3.5 text-[--accent]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate text-[--text-1]">{rx.diagnosis}</p>
                  <p className="caption">{rx.doctor}</p>
                </div>
                <StatusBadge status={rx.status} />
              </div>
            ))}
            <Link href="/patient/prescriptions" className="mt-3 text-[13px] text-[--accent] font-medium hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Outstanding Bills - real data */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="section-title">Bills</h3>
              <span className="badge badge-warning">{naira(outstandingTotal)} due</span>
            </div>
            {invoices.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-[13px] text-[--text-3]">No bills yet</p>
              </div>
            ) : invoices.slice(0, 3).map((bill: any) => (
              <div key={bill.id} className="flex items-center justify-between py-2.5 border-b border-[--border] last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-[--text-1] truncate">{bill.service}</p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-[13px] font-medium text-[--text-1]">{naira(bill.amount)}</span>
                  <StatusBadge status={bill.status} />
                </div>
              </div>
            ))}
            {invoices.some((b: any) => b.status === 'Pending' || b.status === 'Overdue') && (
              <button className="mt-3 btn-primary w-full text-center">Pay Now</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
