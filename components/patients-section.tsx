'use client'

import { useState } from 'react'
import { Plus, Search } from 'lucide-react'

const PATIENT_DATA = [
  { id: 'P001', name: 'John Doe', age: 45, phone: '(555) 123-4567', email: 'john.doe@email.com', bloodType: 'O+', condition: 'Hypertension', lastVisit: '2024-05-28', status: 'Active' as const },
  { id: 'P002', name: 'Jane Smith', age: 32, phone: '(555) 234-5678', email: 'jane.smith@email.com', bloodType: 'A+', condition: 'Diabetes Type 2', lastVisit: '2024-05-20', status: 'Active' as const },
  { id: 'P003', name: 'Mike Johnson', age: 58, phone: '(555) 345-6789', email: 'mike.j@email.com', bloodType: 'B-', condition: 'Cardiac Arrhythmia', lastVisit: '2024-06-01', status: 'Critical' as const },
  { id: 'P004', name: 'Sarah Wilson', age: 28, phone: '(555) 456-7890', email: 'sarah.w@email.com', bloodType: 'AB+', condition: 'Respiratory Infection', lastVisit: '2024-05-25', status: 'Improving' as const },
  { id: 'P005', name: 'David Brown', age: 67, phone: '(555) 567-8901', email: 'david.b@email.com', bloodType: 'O-', condition: 'Joint Arthritis', lastVisit: '2024-05-15', status: 'Stable' as const },
]

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Active': 'badge-success',
    'Stable': 'badge-success',
    'Critical': 'badge-danger',
    'Improving': 'badge-info',
  }
  return <span className={`badge ${styles[status] || 'badge-muted'}`}>{status}</span>
}

export function PatientsSection() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedPatient, setSelectedPatient] = useState<(typeof PATIENT_DATA)[0] | null>(null)

  const filteredPatients = PATIENT_DATA.filter((patient) => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'All' || patient.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Patient Management</h1>
          <p className="caption mt-0.5">Manage and view all patient records</p>
        </div>
        <button className="btn-primary flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          New Patient
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[--text-3]" />
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name or ID..." className="input-field w-full pl-8" />
        </div>
        <div className="flex flex-wrap gap-2">
          {['All', 'Active', 'Stable', 'Critical', 'Improving'].map((status) => (
            <button key={status} onClick={() => setSelectedStatus(status)}
              className={`text-[12px] font-medium px-3 py-1.5 rounded-lg transition-colors ${
                selectedStatus === status ? 'bg-[--accent] text-white' : 'bg-[--surface] border border-[--border-2] text-[--text-2] hover:bg-[--surface-2]'
              }`}>{status}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="divide-x divide-[--border]">
                    <th className="label text-left px-4 py-3 bg-[--surface-2]">ID</th>
                    <th className="label text-left px-4 py-3 bg-[--surface-2]">Name</th>
                    <th className="label text-left px-4 py-3 bg-[--surface-2]">Condition</th>
                    <th className="label text-left px-4 py-3 bg-[--surface-2]">Status</th>
                    <th className="label text-left px-4 py-3 bg-[--surface-2]">Last Visit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[--border]">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} onClick={() => setSelectedPatient(patient)}
                      className="bg-[--surface] hover:bg-[--surface-2] transition-colors cursor-pointer">
                      <td className="px-4 py-3 text-[13px] font-medium text-[--text-1]">{patient.id}</td>
                      <td className="px-4 py-3 text-[13px] text-[--text-1]">{patient.name}</td>
                      <td className="px-4 py-3 text-[13px] text-[--text-2]">{patient.condition}</td>
                      <td className="px-4 py-3"><StatusBadge status={patient.status} /></td>
                      <td className="px-4 py-3 text-[13px] text-[--text-3]">{patient.lastVisit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Patient Details */}
        <div className="card">
          {selectedPatient ? (
            <div>
              <h3 className="section-title mb-4">Patient Details</h3>
              <div className="space-y-3">
                {[
                  ['ID', selectedPatient.id],
                  ['Name', selectedPatient.name],
                  ['Age', selectedPatient.age],
                  ['Blood Type', selectedPatient.bloodType],
                  ['Phone', selectedPatient.phone],
                  ['Email', selectedPatient.email],
                  ['Condition', selectedPatient.condition],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="label mb-0.5">{label}</p>
                    <p className="text-[13px] text-[--text-1]">{value}</p>
                  </div>
                ))}
              </div>
              <button className="btn-primary w-full mt-4">View Full Record</button>
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[300px]">
              <p className="text-[13px] text-[--text-3]">Select a patient to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
