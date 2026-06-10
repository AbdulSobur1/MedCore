'use client'

import { useState } from 'react'
import { Search, Star, Phone, Mail, Building2 } from 'lucide-react'

const DOCTORS_DATA = [
  { id: 'D001', name: 'Dr. Ahmed Hassan', specialization: 'Cardiology', qualification: 'MD, Board Certified', experience: '15 years', phone: '(555) 111-2222', email: 'ahmed.hassan@hospital.com', rating: 4.8, patientsCount: 342, availability: 'Available' as const, room: '201' },
  { id: 'D002', name: 'Dr. Emily Garcia', specialization: 'Endocrinology', qualification: 'MD, Fellowship', experience: '12 years', phone: '(555) 222-3333', email: 'emily.garcia@hospital.com', rating: 4.9, patientsCount: 298, availability: 'Available' as const, room: '305' },
  { id: 'D003', name: 'Dr. James Wilson', specialization: 'Pulmonology', qualification: 'MD, Board Certified', experience: '18 years', phone: '(555) 333-4444', email: 'james.wilson@hospital.com', rating: 4.7, patientsCount: 267, availability: 'In Surgery' as const, room: '402' },
  { id: 'D004', name: 'Dr. Lisa Chen', specialization: 'Neurology', qualification: 'MD, Fellowship', experience: '10 years', phone: '(555) 444-5555', email: 'lisa.chen@hospital.com', rating: 4.9, patientsCount: 156, availability: 'Available' as const, room: '501' },
]

function AvailabilityBadge({ status }: { status: string }) {
  return <span className={`badge ${status === 'Available' ? 'badge-success' : 'badge-warning'}`}>{status}</span>
}

export function DoctorsSection() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('All')
  const [selectedDoctor, setSelectedDoctor] = useState<(typeof DOCTORS_DATA)[0] | null>(null)

  const specialties = ['All', 'Cardiology', 'Endocrinology', 'Pulmonology', 'Neurology']
  const filteredDoctors = DOCTORS_DATA.filter((doctor) => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialty = selectedSpecialty === 'All' || doctor.specialization === selectedSpecialty
    return matchesSearch && matchesSpecialty
  })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Doctor Console</h1>
        <p className="caption mt-0.5">Manage medical staff and specialists</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[--text-3]" />
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search doctors..." className="input-field w-full pl-8" />
        </div>
        <div className="flex flex-wrap gap-2">
          {specialties.map((specialty) => (
            <button key={specialty} onClick={() => setSelectedSpecialty(specialty)}
              className={`text-[12px] font-medium px-3 py-1.5 rounded-lg transition-colors ${
                selectedSpecialty === specialty ? 'bg-[--accent] text-white' : 'bg-[--surface] border border-[--border-2] text-[--text-2] hover:bg-[--surface-2]'
              }`}>{specialty}</button>
          ))}
        </div>
      </div>

      {/* Doctor cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredDoctors.map((doctor) => (
          <div key={doctor.id} onClick={() => setSelectedDoctor(doctor)}
            className={`card cursor-pointer ${selectedDoctor?.id === doctor.id ? 'border-[--accent]' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-[--accent] flex items-center justify-center text-white font-bold text-[14px] shrink-0">
                {doctor.name.charAt(4)}{doctor.name.charAt(5)}
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-[--warning] text-[--warning]" />
                <span className="text-[13px] font-semibold text-[--text-1]">{doctor.rating}</span>
              </div>
            </div>
            <h3 className="text-[14px] font-semibold text-[--text-1] mb-0.5">{doctor.name}</h3>
            <p className="text-[13px] text-[--accent] mb-3">{doctor.specialization}</p>
            <div className="text-[12px] text-[--text-3] space-y-0.5 mb-3 pb-3 border-b border-[--border]">
              <p>{doctor.qualification}</p>
              <p>{doctor.experience}</p>
            </div>
            <div className="flex items-center gap-2 text-[13px] text-[--text-2] mb-3">
              <Building2 className="w-3.5 h-3.5" />
              <span>Room {doctor.room}</span>
              <span className="ml-auto"><AvailabilityBadge status={doctor.availability} /></span>
            </div>
            <button className="btn-primary w-full">Book Appointment</button>
          </div>
        ))}
      </div>

      {/* Doctor details */}
      {selectedDoctor && (
        <div className="card">
          <h2 className="section-title mb-4">Doctor Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {[
                ['Name', selectedDoctor.name],
                ['Specialization', selectedDoctor.specialization],
                ['Experience', selectedDoctor.experience],
                ['Total Patients', selectedDoctor.patientsCount],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="label mb-0.5">{label}</p>
                  <p className="text-[14px] font-medium text-[--text-1]">{value}</p>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {[
                ['Qualification', selectedDoctor.qualification],
                ['Rating', `${selectedDoctor.rating} / 5.0`],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="label mb-0.5">{label}</p>
                  <p className="text-[14px] font-medium text-[--text-1]">{value}</p>
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button className="btn-ghost flex items-center gap-1.5 flex-1 justify-center">
                  <Phone className="w-3.5 h-3.5" />
                  Call
                </button>
                <button className="btn-ghost flex items-center gap-1.5 flex-1 justify-center">
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
