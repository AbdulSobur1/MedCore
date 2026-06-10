'use client'

import { useState } from 'react'
import { Plus, Search, Download, DollarSign } from 'lucide-react'

const INVOICES_DATA = [
  { id: 'INV001', patientName: 'John Doe', patientId: 'P001', amount: 2500, services: ['Consultation', 'Lab Tests', 'Medications'], date: '2024-06-01', dueDate: '2024-06-15', status: 'Paid' as const },
  { id: 'INV002', patientName: 'Jane Smith', patientId: 'P002', amount: 1850, services: ['Consultation', 'Ultrasound'], date: '2024-05-28', dueDate: '2024-06-11', status: 'Paid' as const },
  { id: 'INV003', patientName: 'Mike Johnson', patientId: 'P003', amount: 5200, services: ['Surgery', 'Hospital Admission (3 days)', 'ICU Care'], date: '2024-05-20', dueDate: '2024-06-03', status: 'Overdue' as const },
  { id: 'INV004', patientName: 'Sarah Wilson', patientId: 'P004', amount: 950, services: ['Consultation', 'X-Ray'], date: '2024-05-25', dueDate: '2024-06-08', status: 'Pending' as const },
]

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Paid': 'badge-success',
    'Pending': 'badge-warning',
    'Overdue': 'badge-danger',
  }
  return <span className={`badge ${styles[status] || 'badge-muted'}`}>{status}</span>
}

export function BillingSection() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')

  const filteredInvoices = INVOICES_DATA.filter((invoice) => {
    const matchesSearch = invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'All' || invoice.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const totalRevenue = INVOICES_DATA.reduce((sum, inv) => (inv.status === 'Paid' ? sum + inv.amount : sum), 0)
  const pendingAmount = INVOICES_DATA.reduce((sum, inv) => (inv.status === 'Pending' ? sum + inv.amount : sum), 0)
  const overdueAmount = INVOICES_DATA.reduce((sum, inv) => (inv.status === 'Overdue' ? sum + inv.amount : sum), 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Billing & Payments</h1>
          <p className="caption mt-0.5">Manage invoices and financial records</p>
        </div>
        <button className="btn-primary flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          New Invoice
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <p className="label mb-1">Total Revenue</p>
          <p className="text-[24px] font-semibold text-[--text-1]">${totalRevenue.toLocaleString()}</p>
          <p className="caption mt-1">From paid invoices</p>
        </div>
        <div className="card">
          <p className="label mb-1">Pending Payment</p>
          <p className="text-[24px] font-semibold text-[--text-1]">${pendingAmount.toLocaleString()}</p>
          <p className="caption mt-1">{INVOICES_DATA.filter(i => i.status === 'Pending').length} invoices</p>
        </div>
        <div className="card">
          <p className="label mb-1">Overdue Payment</p>
          <p className="text-[24px] font-semibold text-[--text-1]">${overdueAmount.toLocaleString()}</p>
          <p className="caption mt-1">{INVOICES_DATA.filter(i => i.status === 'Overdue').length} invoices</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[--text-3]" />
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by patient or invoice ID..." className="input-field w-full pl-8" />
        </div>
        <div className="flex flex-wrap gap-2">
          {['All', 'Paid', 'Pending', 'Overdue'].map((status) => (
            <button key={status} onClick={() => setSelectedStatus(status)}
              className={`text-[12px] font-medium px-3 py-1.5 rounded-lg transition-colors ${
                selectedStatus === status ? 'bg-[--accent] text-white' : 'bg-[--surface] border border-[--border-2] text-[--text-2] hover:bg-[--surface-2]'
              }`}>{status}</button>
          ))}
        </div>
      </div>

      {/* Invoices table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="divide-x divide-[--border]">
                <th className="label text-left px-4 py-3 bg-[--surface-2]">Invoice ID</th>
                <th className="label text-left px-4 py-3 bg-[--surface-2]">Patient</th>
                <th className="label text-left px-4 py-3 bg-[--surface-2]">Amount</th>
                <th className="label text-left px-4 py-3 bg-[--surface-2]">Services</th>
                <th className="label text-left px-4 py-3 bg-[--surface-2]">Date</th>
                <th className="label text-left px-4 py-3 bg-[--surface-2]">Due Date</th>
                <th className="label text-left px-4 py-3 bg-[--surface-2]">Status</th>
                <th className="label text-left px-4 py-3 bg-[--surface-2]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--border]">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="bg-[--surface] hover:bg-[--surface-2] transition-colors">
                  <td className="px-4 py-3 text-[13px] font-medium text-[--text-1]">{invoice.id}</td>
                  <td className="px-4 py-3 text-[13px] text-[--text-1]">{invoice.patientName}</td>
                  <td className="px-4 py-3 text-[13px] font-semibold text-[--text-1]">${invoice.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-[13px] text-[--text-2] max-w-[150px] truncate">{invoice.services.join(', ')}</td>
                  <td className="px-4 py-3 text-[13px] text-[--text-3]">{invoice.date}</td>
                  <td className="px-4 py-3 text-[13px] text-[--text-3]">{invoice.dueDate}</td>
                  <td className="px-4 py-3"><StatusBadge status={invoice.status} /></td>
                  <td className="px-4 py-3">
                    <button className="p-1.5 rounded-lg hover:bg-[--surface-2]">
                      <Download className="w-3.5 h-3.5 text-[--text-2]" />
                    </button>
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
