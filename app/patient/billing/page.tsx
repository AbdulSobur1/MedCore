'use client'

import { Download } from 'lucide-react'

const invoices = [
  { id: 'INV-1001', service: 'Consultation', amount: 45000, date: '02 May 2026', method: 'Transfer', status: 'Paid' },
  { id: 'INV-1002', service: 'Lab screening', amount: 18000, date: '02 May 2026', method: '-', status: 'Pending' },
  { id: 'INV-1003', service: 'Medication', amount: 27000, date: '16 Apr 2026', method: '-', status: 'Overdue' },
]

function naira(value: number) {
  return `₦${value.toLocaleString('en-NG')}`
}

function StatCard({ label, value, color }: { label: string; value: string; color: 'teal' | 'amber' | 'green' }) {
  const colors = { teal: 'text-teal-700 bg-teal-50', amber: 'text-amber-700 bg-amber-50', green: 'text-green-700 bg-green-50' }
  return <div className={`rounded-xl border border-slate-100 p-4 ${colors[color]}`}><p className="text-sm opacity-80">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></div>
}

export default function PatientBillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Bills</h1>
        <p className="mt-2 text-muted-foreground">Invoices, receipts, and payment status</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Total Paid" value={naira(45000)} color="teal" />
        <StatCard label="Outstanding" value={naira(45000)} color="amber" />
        <StatCard label="Ins. Covered" value={naira(80000)} color="green" />
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr><th className="px-4 py-3">Invoice #</th><th>Service</th><th>Amount</th><th>Date</th><th>Method</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {invoices.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium">{item.id}</td><td>{item.service}</td><td>{naira(item.amount)}</td><td>{item.date}</td><td>{item.method}</td>
                <td><span className={`rounded-full px-2 py-1 text-xs font-medium ${item.status === 'Paid' ? 'bg-teal-100 text-teal-800' : item.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-700'}`}>{item.status}</span></td>
                <td>{item.status === 'Paid' ? <button className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs"><Download className="h-3 w-3" />Receipt</button> : <button className={`rounded-lg px-3 py-1.5 text-xs font-medium ${item.status === 'Overdue' ? 'border border-red-200 text-red-600' : 'bg-teal-600 text-white'}`}>Pay Now</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
