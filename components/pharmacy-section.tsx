'use client'

import { useState } from 'react'
import { Plus, Search, TrendingDown } from 'lucide-react'

const PRESCRIPTIONS_DATA = [
  { id: 'RX001', patientName: 'John Doe', patientId: 'P001', medication: 'Lisinopril 10mg', dosage: 'Once daily', quantity: 30, prescribedBy: 'Dr. Ahmed Hassan', date: '2024-06-01', status: 'Dispensed' as const, expiryDate: '2024-12-01' },
  { id: 'RX002', patientName: 'Jane Smith', patientId: 'P002', medication: 'Metformin 500mg', dosage: 'Twice daily', quantity: 60, prescribedBy: 'Dr. Emily Garcia', date: '2024-05-28', status: 'Pending' as const, expiryDate: '2024-11-28' },
  { id: 'RX003', patientName: 'Mike Johnson', patientId: 'P003', medication: 'Digoxin 0.25mg', dosage: 'Once daily', quantity: 30, prescribedBy: 'Dr. Ahmed Hassan', date: '2024-06-01', status: 'Ready' as const, expiryDate: '2024-12-01' },
  { id: 'RX004', patientName: 'Sarah Wilson', patientId: 'P004', medication: 'Amoxicillin 500mg', dosage: 'Three times daily', quantity: 21, prescribedBy: 'Dr. James Wilson', date: '2024-05-25', status: 'Dispensed' as const, expiryDate: '2025-05-25' },
]

const INVENTORY_DATA = [
  { name: 'Lisinopril 10mg', stock: 450, minStock: 100, unit: 'tablets', supplier: 'PharmaCorp' },
  { name: 'Metformin 500mg', stock: 320, minStock: 150, unit: 'tablets', supplier: 'HealthMeds' },
  { name: 'Digoxin 0.25mg', stock: 45, minStock: 50, unit: 'tablets', supplier: 'CardioMeds' },
  { name: 'Amoxicillin 500mg', stock: 890, minStock: 200, unit: 'tablets', supplier: 'BioPharma' },
  { name: 'Aspirin 100mg', stock: 25, minStock: 100, unit: 'tablets', supplier: 'GenericDrugs' },
]

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Dispensed': 'badge-success',
    'Ready': 'badge-warning',
    'Pending': 'badge-warning',
  }
  return <span className={`badge ${styles[status] || 'badge-muted'}`}>{status}</span>
}

export function PharmacySection() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [activeTab, setActiveTab] = useState<'prescriptions' | 'inventory'>('prescriptions')

  const filteredPrescriptions = PRESCRIPTIONS_DATA.filter((rx) => {
    const matchesSearch = rx.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || rx.medication.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'All' || rx.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const filteredInventory = INVENTORY_DATA.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Pharmacy Management</h1>
          <p className="caption mt-0.5">Manage prescriptions and inventory</p>
        </div>
        <button className="btn-primary flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          New Prescription
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[--border]">
        {(['prescriptions', 'inventory'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 pb-3 text-[13px] font-medium border-b-2 transition-colors ${
              activeTab === tab ? 'border-[--accent] text-[--accent]' : 'border-transparent text-[--text-3] hover:text-[--text-2]'
            }`}>{tab === 'prescriptions' ? 'Prescriptions' : 'Inventory'}</button>
        ))}
      </div>

      {/* Prescriptions tab */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[--text-3]" />
              <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by patient or medication..." className="input-field w-full pl-8" />
            </div>
            <div className="flex flex-wrap gap-2">
              {['All', 'Pending', 'Ready', 'Dispensed'].map((status) => (
                <button key={status} onClick={() => setSelectedStatus(status)}
                  className={`text-[12px] font-medium px-3 py-1.5 rounded-lg transition-colors ${
                    selectedStatus === status ? 'bg-[--accent] text-white' : 'bg-[--surface] border border-[--border-2] text-[--text-2] hover:bg-[--surface-2]'
                  }`}>{status}</button>
              ))}
            </div>
          </div>

          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="divide-x divide-[--border]">
                    <th className="label text-left px-4 py-3 bg-[--surface-2]">ID</th>
                    <th className="label text-left px-4 py-3 bg-[--surface-2]">Patient</th>
                    <th className="label text-left px-4 py-3 bg-[--surface-2]">Medication</th>
                    <th className="label text-left px-4 py-3 bg-[--surface-2]">Dosage</th>
                    <th className="label text-left px-4 py-3 bg-[--surface-2]">Prescribed By</th>
                    <th className="label text-left px-4 py-3 bg-[--surface-2]">Status</th>
                    <th className="label text-left px-4 py-3 bg-[--surface-2]">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[--border]">
                  {filteredPrescriptions.map((rx) => (
                    <tr key={rx.id} className="bg-[--surface] hover:bg-[--surface-2] transition-colors">
                      <td className="px-4 py-3 text-[13px] font-medium text-[--text-1]">{rx.id}</td>
                      <td className="px-4 py-3 text-[13px] text-[--text-1]">{rx.patientName}</td>
                      <td className="px-4 py-3 text-[13px] text-[--text-2]">{rx.medication}</td>
                      <td className="px-4 py-3 text-[13px] text-[--text-2]">{rx.dosage}</td>
                      <td className="px-4 py-3 text-[13px] text-[--text-2]">{rx.prescribedBy}</td>
                      <td className="px-4 py-3"><StatusBadge status={rx.status} /></td>
                      <td className="px-4 py-3 text-[13px] text-[--text-3]">{rx.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Inventory tab */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[--text-3]" />
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search medications..." className="input-field w-full pl-8" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInventory.map((item, idx) => {
              const isLowStock = item.stock <= item.minStock
              return (
                <div key={idx} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-[13px] font-semibold text-[--text-1]">{item.name}</h3>
                    {isLowStock && <TrendingDown className="w-4 h-4 text-[--danger]" />}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="label mb-0.5">Current Stock</p>
                      <p className="text-[20px] font-semibold text-[--text-1]">{item.stock} <span className="text-[13px] text-[--text-3]">{item.unit}</span></p>
                    </div>
                    <div>
                      <p className="label mb-0.5">Min Stock</p>
                      <p className="text-[13px] text-[--text-2]">{item.minStock} {item.unit}</p>
                    </div>
                    <div>
                      <p className="label mb-0.5">Supplier</p>
                      <p className="text-[13px] text-[--text-2]">{item.supplier}</p>
                    </div>
                    {/* Stock bar */}
                    <div className="w-full bg-[--surface-2] rounded-full h-1.5 overflow-hidden mt-2">
                      <div className={`h-full rounded-full ${isLowStock ? 'bg-[--danger]' : 'bg-[--success]'}`}
                        style={{ width: `${Math.min((item.stock / (item.minStock * 2)) * 100, 100)}%` }} />
                    </div>
                    <button className="btn-primary w-full mt-2">Reorder</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
