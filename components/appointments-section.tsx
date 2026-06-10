'use client'

import { useState } from 'react'
import { Plus, Clock, MapPin, User } from 'lucide-react'

const APPOINTMENTS_DATA = [
  { id: 'APT001', patientName: 'John Doe', patientId: 'P001', doctor: 'Dr. Ahmed Hassan', department: 'Cardiology', date: '2024-06-15', time: '09:00 AM', room: '201', status: 'Scheduled' as const, type: 'Consultation' },
  { id: 'APT002', patientName: 'Jane Smith', patientId: 'P002', doctor: 'Dr. Emily Garcia', department: 'Endocrinology', date: '2024-06-15', time: '10:30 AM', room: '305', status: 'Confirmed' as const, type: 'Follow-up' },
  { id: 'APT003', patientName: 'Mike Johnson', patientId: 'P003', doctor: 'Dr. Ahmed Hassan', department: 'Cardiology', date: '2024-06-16', time: '02:00 PM', room: '201', status: 'Pending' as const, type: 'Consultation' },
  { id: 'APT004', patientName: 'Sarah Wilson', patientId: 'P004', doctor: 'Dr. James Wilson', department: 'Pulmonology', date: '2024-06-14', time: '04:00 PM', room: '402', status: 'Completed' as const, type: 'Check-up' },
]

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Completed': 'badge-muted',
    'Confirmed': 'badge-info',
    'Pending': 'badge-warning',
    'Scheduled': 'badge-info',
  }
  return <span className={`badge ${styles[status] || 'badge-muted'}`}>{status}</span>
}

export function AppointmentsSection() {
  const [selectedDate, setSelectedDate] = useState('2024-06-15')
  const filteredAppointments = APPOINTMENTS_DATA.filter((apt) => apt.date === selectedDate)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="caption mt-0.5">Schedule and manage patient appointments</p>
        </div>
        <button className="btn-primary flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          New Appointment
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Date selector */}
        <div className="card">
          <h3 className="section-title mb-4">Select Date</h3>
          <div className="space-y-2">
            {['2024-06-14', '2024-06-15', '2024-06-16', '2024-06-17'].map((date) => (
              <button key={date} onClick={() => setSelectedDate(date)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                  selectedDate === date ? 'bg-[--accent] text-white' : 'bg-[--surface-2] text-[--text-2] hover:bg-[--surface-2]'
                }`}>
                {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </button>
            ))}
          </div>
        </div>

        {/* Appointments list */}
        <div className="lg:col-span-3 space-y-3">
          {filteredAppointments.length === 0 ? (
            <div className="card py-10 text-center">
              <p className="text-[13px] text-[--text-3]">No appointments for this date</p>
            </div>
          ) : filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-[13px] font-semibold text-[--text-1]">{appointment.patientName}</h4>
                  <p className="caption">{appointment.type}</p>
                </div>
                <StatusBadge status={appointment.status} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-[13px]">
                <div className="flex items-center gap-2 text-[--text-2]">
                  <User className="w-3.5 h-3.5 text-[--text-3]" />
                  <span>{appointment.doctor}</span>
                </div>
                <div className="flex items-center gap-2 text-[--text-2]">
                  <Clock className="w-3.5 h-3.5 text-[--text-3]" />
                  <span>{appointment.time}</span>
                </div>
                <div className="flex items-center gap-2 text-[--text-2]">
                  <MapPin className="w-3.5 h-3.5 text-[--text-3]" />
                  <span>Room {appointment.room}</span>
                </div>
                <div className="text-[--text-2]">{appointment.department}</div>
              </div>
              <button className="btn-ghost w-full mt-3 text-[12px]">View Details</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
