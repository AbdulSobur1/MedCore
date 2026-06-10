'use client'

import { Download } from 'lucide-react'
import { naira } from '@/lib/auth'
import { toast } from 'sonner'

const invoices = [
  { id: 'INV-1001', service: 'Consultation', amount: 45000, date: '02 May 2026', method: 'Transfer', status: 'Paid' as const },
  { id: 'INV-1002', service: 'Lab screening', amount: 18000, date: '02 May 2026', method: '-', status: 'Pending' as const },
  { id: 'INV-1003', service: 'Medication', amount: 27000, date: '16 Apr 2026', method: '-', status: 'Overdue' as const },
]

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Paid': 'badge-success',
    'Pending': 'badge-warning',
    'Overdue': 'badge-danger',
  }
  return <span className={`badge ${styles[status] || 'badge-muted'}`}>{status}</span>
}

export default function PatientBillingPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">My Bills</h1>
        <p className="caption mt-0.5">Invoices, receipts, and payment status</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Paid', value: naira(invoices.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.amount, 0)) },
          { label: 'Outstanding', value: naira(invoices.filter((i) => i.status !== 'Paid').reduce((s, i) => s + i.amount, 0)) },
          { label: 'Ins. Covered', value: naira(80000) },
        ].map((item) => (
          <div key={item.label} className="card">
            <p className="label mb-1">{item.label}</p>
            <p className="text-[20px] font-semibold text-[--text-1]">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Invoices table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="divide-x divide-[--border]">
                <th className="label text-left px-4 py-3 bg-[--surface-2]">Invoice #</th>
                <th className="label text-left px-4 py-3 bg-[--surface-2]">Service</th>
                <th className="label text-left px-4 py-3 bg-[--surface-2]">Amount</th>
                <th className="label text-left px-4 py-3 bg-[--surface-2]">Date</th>
                <th className="label text-left px-4 py-3 bg-[--surface-2]">Method</th>
                <th className="label text-left px-4 py-3 bg-[--surface-2]">Status</th>
                <th className="label text-left px-4 py-3 bg-[--surface-2]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--border]">
              {invoices.map((item) => (
                <tr key={item.id} className="bg-[--surface] hover:bg-[--surface-2] transition-colors">
                  <td className="px-4 py-3 text-[13px] font-medium text-[--text-1]">{item.id}</td>
                  <td className="px-4 py-3 text-[13px] text-[--text-2]">{item.service}</td>
                  <td className="px-4 py-3 text-[13px] font-medium text-[--text-1]">{naira(item.amount)}</td>
                  <td className="px-4 py-3 text-[13px] text-[--text-3]">{item.date}</td>
                  <td className="px-4 py-3 text-[13px] text-[--text-3]">{item.method}</td>
                  <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                  <td className="px-4 py-3">
                    {item.status === 'Paid' ? (
                      <button className="btn-ghost text-[12px] py-1.5 flex items-center gap-1">
                        <Download className="w-3 h-3" /> Receipt
                      </button>
                    ) : (
                      <button
                        onClick={() => toast.success('Payment initiated!')}
                        className={`text-[12px] font-medium px-3 py-1.5 rounded-lg ${
                          item.status === 'Overdue'
                            ? 'border border-[--danger] text-[--danger] hover:bg-[--danger-soft]'
                            : 'bg-[--accent] text-white hover:bg-[--accent-2]'
                        }`}
                      >
                        Pay Now
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
