'use client'

import { useState } from 'react'
import { Download, Pill } from 'lucide-react'

const prescriptions = [
  { tab: 'Active', diagnosis: 'Diabetes management', doctor: 'Emily Garcia', date: '02 May 2026', status: 'Ready', drugs: [{ name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '30 days' }, { name: 'Atorvastatin', dosage: '20mg', frequency: 'Nightly', duration: '30 days' }] },
  { tab: 'Past', diagnosis: 'Respiratory infection', doctor: 'James Wilson', date: '16 Apr 2026', status: 'Dispensed', drugs: [{ name: 'Amoxicillin', dosage: '500mg', frequency: 'Three times daily', duration: '7 days' }] },
]

function StatusBadge({ status }: { status: string }) {
  const cls = status === 'Dispensed' ? 'bg-teal-100 text-teal-800' : 'bg-green-100 text-green-800'
  return <span className={`rounded-full px-2 py-1 text-xs font-medium ${cls}`}>{status}</span>
}

export default function PatientPrescriptionsPage() {
  const [tab, setTab] = useState<'Active' | 'Past'>('Active')
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Prescriptions</h1>
        <p className="mt-2 text-muted-foreground">Medication history and pickup status</p>
      </div>
      <div className="flex border-b border-slate-200">
        {(['Active', 'Past'] as const).map((item) => <button key={item} onClick={() => setTab(item)} className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${tab === item ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>{item}</button>)}
      </div>
      {prescriptions.filter((item) => item.tab === tab).map((item) => (
        <div key={item.diagnosis} className="mb-4 rounded-xl border border-slate-100 bg-white p-5">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-slate-700">{item.diagnosis}</p>
              <p className="text-xs text-slate-400">Dr. {item.doctor} · {item.date}</p>
            </div>
            <StatusBadge status={item.status} />
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {item.drugs.map((drug) => (
              <div key={drug.name} className="flex gap-2 rounded-lg bg-slate-50 p-3">
                <Pill className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" />
                <div>
                  <p className="text-sm font-medium">{drug.name} {drug.dosage}</p>
                  <p className="text-xs text-slate-500">{drug.frequency} · {drug.duration}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-3 flex items-center gap-1 text-xs text-teal-600 hover:underline">
            <Download className="h-3 w-3" /> Download prescription
          </button>
        </div>
      ))}
    </div>
  )
}
