'use client'

import Link from 'next/link'
import { Calendar, CreditCard, FileText, Pill, Plus } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import type { PatientProfile } from '@/lib/auth'

const appointments = [
  { date: '15 Jun 2026', doctor: 'Ahmed Hassan', specialty: 'Cardiology', type: 'Consultation', time: '09:00 AM', room: 'Room 201', status: 'Confirmed' },
  { date: '02 May 2026', doctor: 'Emily Garcia', specialty: 'Endocrinology', type: 'Follow-Up', time: '11:30 AM', room: 'Room 305', status: 'Completed' },
  { date: '16 Apr 2026', doctor: 'James Wilson', specialty: 'Pulmonology', type: 'Routine', time: '02:00 PM', room: 'Room 402', status: 'Completed' },
]

const prescriptions = [
  { drug: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '30 days', dispensed: false },
  { drug: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '14 days', dispensed: true },
]

const bills = [
  { service: 'Cardiology consultation', amount: 45000, status: 'Pending' },
  { service: 'Lab screening', amount: 18000, status: 'Overdue' },
]

const history = [
  { date: '02 May 2026', diagnosis: 'Diabetes review', doctor: 'Emily Garcia', dept: 'Endocrinology' },
  { date: '16 Apr 2026', diagnosis: 'Respiratory infection', doctor: 'James Wilson', dept: 'Pulmonology' },
  { date: '14 Mar 2026', diagnosis: 'Annual wellness check', doctor: 'Ahmed Hassan', dept: 'General Medicine' },
]

function naira(value: number) {
  return `₦${value.toLocaleString('en-NG')}`
}

function Badge({ status }: { status: string }) {
  const cls = status === 'Confirmed' || status === 'Collected' ? 'bg-teal-100 text-teal-800' : status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
  return <span className={`rounded-full px-2 py-1 text-xs font-medium ${cls}`}>{status}</span>
}

export default function PatientDashboard() {
  const { session } = useAuth()
  const patient = typeof window !== 'undefined'
    ? (Object.values(JSON.parse(localStorage.getItem('patients') || '{}')) as PatientProfile[]).find((item) => item.patientId === session?.userId)
    : undefined
  const [firstName, ...rest] = (patient?.name || session?.name || 'Patient').split(' ')
  const lastName = rest.join(' ')
  const nextAppointment = appointments[0]

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-teal-600 p-5 text-white">
        <p className="mb-1 text-sm text-teal-100">Welcome back,</p>
        <h1 className="text-xl font-bold">{firstName} {lastName}</h1>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-teal-100">
          <span>ID: {patient?.patientId || session?.userId}</span>
          <span>Blood Type: {patient?.bloodType || 'Not recorded'}</span>
          <span>Status: Active</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ['Next Appointment', nextAppointment.date, Calendar],
          ['Active Prescriptions', prescriptions.length, Pill],
          ['Outstanding Bills', naira(bills.reduce((sum, bill) => sum + bill.amount, 0)), CreditCard],
          ['Last Visit', history[0].date, FileText],
        ].map(([label, value, Icon]) => {
          const CardIcon = Icon as typeof Calendar
          return (
            <div key={label as string} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4">
              <div className="min-w-0">
                <p className="text-sm text-slate-500">{label as string}</p>
                <p className="mt-1 truncate text-lg font-bold text-slate-800">{value as string}</p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-500">
                <CardIcon className="h-5 w-5 text-white" />
              </div>
            </div>
          )
        })}
      </div>

      <section className="rounded-xl border border-slate-100 bg-white p-5">
        <div className="mb-3 flex items-start justify-between">
          <h3 className="font-semibold text-slate-700">Next Appointment</h3>
          <Badge status={nextAppointment.status} />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-sm font-bold text-teal-700">AH</div>
          <div>
            <p className="text-sm font-medium">Dr. {nextAppointment.doctor}</p>
            <p className="text-xs text-slate-500">{nextAppointment.specialty}</p>
          </div>
          <div className="sm:ml-auto sm:text-right">
            <p className="text-sm font-semibold text-slate-700">{nextAppointment.date}</p>
            <p className="text-xs text-slate-400">{nextAppointment.time} · {nextAppointment.room}</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">Reschedule</button>
          <button className="flex-1 rounded-lg border border-red-100 px-3 py-2 text-sm text-red-500 hover:bg-red-50">Cancel</button>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-100 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-700">Recent Appointments</h3>
            <Link href="/patient/appointments" className="text-xs font-medium text-teal-600 hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="text-left text-slate-500"><tr><th className="py-2">Date</th><th>Doctor</th><th>Type</th><th>Status</th></tr></thead>
              <tbody>{appointments.map((item) => <tr key={`${item.date}-${item.doctor}`} className="border-t border-slate-100"><td className="py-3">{item.date}</td><td>Dr. {item.doctor}</td><td>{item.type}</td><td><Badge status={item.status} /></td></tr>)}</tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-slate-100 bg-white p-5">
          <h3 className="mb-4 font-semibold text-slate-700">Active Prescriptions</h3>
          {prescriptions.map((item) => (
            <div key={item.drug} className="mb-2 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50"><Pill className="h-4 w-4 text-teal-600" /></div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.drug} {item.dosage}</p>
                <p className="text-xs text-slate-500">{item.frequency} · {item.duration}</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-xs ${item.dispensed ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'}`}>{item.dispensed ? 'Collected' : 'Ready'}</span>
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-slate-100 bg-white p-5">
          <h3 className="mb-4 font-semibold text-slate-700">Outstanding Bills</h3>
          {bills.map((bill) => (
            <div key={bill.service} className="mb-3 flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3 text-sm">
              <div><p className="font-medium text-slate-700">{bill.service}</p><p className="text-slate-500">{naira(bill.amount)}</p></div>
              <button className="rounded-lg bg-teal-600 px-3 py-2 text-xs font-medium text-white">Pay Now</button>
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-slate-100 bg-white p-5">
          <h3 className="mb-4 font-semibold text-slate-700">Medical History</h3>
          <div className="relative border-l-2 border-slate-100 pl-5">
            {history.map((item) => (
              <div key={item.date} className="relative mb-4">
                <div className="absolute -left-[27px] mt-1 h-3 w-3 rounded-full border-2 border-white bg-teal-500" />
                <p className="text-xs text-slate-400">{item.date}</p>
                <p className="text-sm font-medium text-slate-700">{item.diagnosis}</p>
                <p className="text-xs text-slate-500">Dr. {item.doctor} · {item.dept}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
