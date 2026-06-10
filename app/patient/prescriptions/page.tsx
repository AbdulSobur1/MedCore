'use client'

import { useEffect, useState } from 'react'
import { Download, Pill } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'
import { getPrescriptions } from '@/lib/store'

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Ready': 'badge-warning', 'Dispensed': 'badge-success', 'Active': 'badge-info', 'Pending': 'badge-warning',
  }
  return <span className={`badge ${styles[status] || 'badge-muted'}`}>{status}</span>
}

export default function PatientPrescriptionsPage() {
  const { session } = useAuth()
  const [tab, setTab] = useState<'Active' | 'Dispensed'>('Active')
  const [prescriptions, setPrescriptions] = useState<any[]>([])

  useEffect(() => {
    if (session?.userId) {
      setPrescriptions(getPrescriptions(session.userId))
    }
  }, [session?.userId])

  const filtered = prescriptions.filter((p) => {
    if (tab === 'Active') return p.status === 'Active' || p.status === 'Ready' || p.status === 'Pending'
    return p.status === 'Dispensed'
  })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Prescriptions</h1>
        <p className="caption mt-0.5">Medication history and pickup status</p>
      </div>

      <div className="flex border-b border-[--border]">
        {(['Active', 'Dispensed'] as const).map((item) => (
          <button key={item} onClick={() => setTab(item)}
            className={`px-4 pb-3 text-[13px] font-medium border-b-2 transition-colors ${
              tab === item ? 'border-[--accent] text-[--accent]' : 'border-transparent text-[--text-3] hover:text-[--text-2]'
            }`}>{item}</button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card py-10 text-center">
          <div className="w-10 h-10 rounded-full bg-[--accent-soft] flex items-center justify-center mx-auto mb-3">
            <Pill className="w-5 h-5 text-[--accent]" />
          </div>
          <p className="text-[13px] text-[--text-3]">No {tab.toLowerCase()} prescriptions</p>
        </div>
      )}

      {filtered.map((item: any) => (
        <div key={item.id} className="card">
          <div className="flex items-start justify-between gap-2 mb-4">
            <div>
              <p className="text-[13px] font-semibold text-[--text-1]">{item.diagnosis}</p>
              <p className="caption">{item.doctor} · {item.date}</p>
            </div>
            <StatusBadge status={item.status} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {item.drugs.map((drug: any, i: number) => (
              <div key={i} className="flex items-center gap-2.5 p-3 rounded-lg bg-[--surface-2]">
                <div className="w-7 h-7 rounded-md bg-[--accent-soft] flex items-center justify-center shrink-0">
                  <Pill className="w-3.5 h-3.5 text-[--accent]" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[--text-1]">{drug.name} {drug.dosage}</p>
                  <p className="caption">{drug.frequency} · {drug.duration}</p>
                </div>
              </div>
            ))}
          </div>
          {tab === 'Active' && (
            <button onClick={() => toast.success('Prescription download started')}
              className="mt-3 text-[13px] text-[--accent] font-medium hover:underline flex items-center gap-1">
              <Download className="w-3.5 h-3.5" />
              Download prescription
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
