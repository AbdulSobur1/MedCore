'use client'

import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { naira } from '@/lib/auth'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'
import { getInvoices, payInvoice } from '@/lib/store'

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Paid': 'badge-success', 'Pending': 'badge-warning', 'Overdue': 'badge-danger',
  }
  return <span className={`badge ${styles[status] || 'badge-muted'}`}>{status}</span>
}

export default function PatientBillingPage() {
  const { session } = useAuth()
  const [invoices, setInvoices] = useState<any[]>([])

  useEffect(() => {
    if (session?.userId) {
      setInvoices(getInvoices(session.userId))
    }
  }, [session?.userId])

  const handlePay = (id: string) => {
    payInvoice(id)
    setInvoices(getInvoices(session?.userId))
    toast.success('Payment completed successfully!')
  }

  const totalPaid = invoices.filter((i) => i.status === 'Paid').reduce((s: number, i: any) => s + i.amount, 0)
  const outstanding = invoices.filter((i) => i.status !== 'Paid').reduce((s: number, i: any) => s + i.amount, 0)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">My Bills</h1>
        <p className="caption mt-0.5">Invoices, receipts, and payment status</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="label mb-1">Total Paid</p>
          <p className="text-[20px] font-semibold text-[--text-1]">{naira(totalPaid)}</p>
        </div>
        <div className="card">
          <p className="label mb-1">Outstanding</p>
          <p className="text-[20px] font-semibold text-[--text-1]">{naira(outstanding)}</p>
        </div>
        <div className="card">
          <p className="label mb-1">Total Bills</p>
          <p className="text-[20px] font-semibold text-[--text-1]">{invoices.length}</p>
        </div>
      </div>

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
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[13px] text-[--text-3]">No invoices yet</td>
                </tr>
              ) : invoices.map((item: any) => (
                <tr key={item.id} className="bg-[--surface] hover:bg-[--surface-2] transition-colors">
                  <td className="px-4 py-3 text-[13px] font-medium text-[--text-1]">{item.id}</td>
                  <td className="px-4 py-3 text-[13px] text-[--text-2]">{item.service}</td>
                  <td className="px-4 py-3 text-[13px] font-medium text-[--text-1]">{naira(item.amount)}</td>
                  <td className="px-4 py-3 text-[13px] text-[--text-3]">{item.date}</td>
                  <td className="px-4 py-3 text-[13px] text-[--text-3]">{item.method}</td>
                  <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                  <td className="px-4 py-3">
                    {item.status === 'Paid' ? (
                      <button onClick={() => toast.success('Receipt downloaded')} className="btn-ghost text-[12px] py-1.5 flex items-center gap-1">
                        <Download className="w-3 h-3" /> Receipt
                      </button>
                    ) : (
                      <button onClick={() => handlePay(item.id)}
                        className={`text-[12px] font-medium px-3 py-1.5 rounded-lg ${
                          item.status === 'Overdue'
                            ? 'border border-[--danger] text-[--danger] hover:bg-[--danger-soft]'
                            : 'bg-[--accent] text-white hover:bg-[--accent-2]'
                        }`}>Pay Now</button>
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
