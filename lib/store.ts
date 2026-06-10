// Central data store for all MedCore entities
// All data is persisted to localStorage

// ============== Types ==============

export interface Appointment {
  id: string
  patientId: string
  patientName: string
  doctor: string
  department: string
  type: string
  date: string
  time: string
  room: string
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Scheduled'
  reason?: string
  notes?: string
  createdAt: string
}

export interface Prescription {
  id: string
  patientId: string
  patientName: string
  diagnosis: string
  doctor: string
  date: string
  status: 'Active' | 'Dispensed' | 'Ready' | 'Pending'
  drugs: Drug[]
  createdAt: string
}

export interface Drug {
  name: string
  dosage: string
  frequency: string
  duration: string
}

export interface Invoice {
  id: string
  patientId: string
  patientName: string
  service: string
  amount: number
  date: string
  dueDate: string
  method: string
  status: 'Paid' | 'Pending' | 'Overdue'
  createdAt: string
}

export interface Vitals {
  id: string
  patientId: string
  date: string
  bp: string
  pulse: string
  temp: string
  spo2: string
  recordedBy: string
}

export interface MedicalFlag {
  id: string
  patientId: string
  flag: string
  type: 'allergy' | 'risk' | 'condition'
}

export interface InventoryItem {
  id: string
  name: string
  stock: number
  minStock: number
  unit: string
  supplier: string
}

export interface StaffMember {
  id: string
  name: string
  role: string
  department: string
  status: 'Active' | 'Inactive'
  email: string
  phone: string
  specialization?: string
  qualification?: string
  experience?: string
  rating?: number
  patientsCount?: number
  availability?: string
  room?: string
}

export interface Department {
  id: string
  name: string
  head: string
  beds: number
  staff: number
}

// ============== Generic Helpers ==============

function getStore<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function setStore<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(data))
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
}

// ============== Appointments ==============

export function getAppointments(patientId?: string): Appointment[] {
  const all = getStore<Appointment[]>('appointments', [])
  return patientId ? all.filter((a) => a.patientId === patientId) : all
}

export function saveAppointment(appointment: Appointment): void {
  const all = getStore<Appointment[]>('appointments', [])
  all.push(appointment)
  setStore('appointments', all)
}

export function updateAppointment(id: string, updates: Partial<Appointment>): void {
  const all = getStore<Appointment[]>('appointments', [])
  const idx = all.findIndex((a) => a.id === id)
  if (idx !== -1) {
    all[idx] = { ...all[idx], ...updates }
    setStore('appointments', all)
  }
}

export function cancelAppointment(id: string): void {
  updateAppointment(id, { status: 'Cancelled' })
}

export function bookAppointment(data: {
  patientId: string
  patientName: string
  doctor: string
  department: string
  type: string
  date: string
  time: string
  notes?: string
}): Appointment {
  const appointment: Appointment = {
    id: generateId('APT'),
    ...data,
    room: 'TBD',
    status: 'Pending',
    createdAt: new Date().toISOString(),
  }
  saveAppointment(appointment)
  return appointment
}

// ============== Prescriptions ==============

export function getPrescriptions(patientId?: string): Prescription[] {
  const all = getStore<Prescription[]>('prescriptions', [])
  return patientId ? all.filter((p) => p.patientId === patientId) : all
}

export function savePrescription(prescription: Prescription): void {
  const all = getStore<Prescription[]>('prescriptions', [])
  all.push(prescription)
  setStore('prescriptions', all)
}

export function createPrescription(data: {
  patientId: string
  patientName: string
  diagnosis: string
  doctor: string
  drugs: Drug[]
}): Prescription {
  const prescription: Prescription = {
    id: generateId('RX'),
    ...data,
    date: new Date().toISOString().split('T')[0],
    status: 'Active',
    createdAt: new Date().toISOString(),
  }
  savePrescription(prescription)
  return prescription
}

export function dispensePrescription(id: string): void {
  const all = getStore<Prescription[]>('prescriptions', [])
  const idx = all.findIndex((p) => p.id === id)
  if (idx !== -1) {
    all[idx].status = 'Dispensed'
    setStore('prescriptions', all)
  }
}

// ============== Invoices ==============

export function getInvoices(patientId?: string): Invoice[] {
  const all = getStore<Invoice[]>('invoices', [])
  return patientId ? all.filter((i) => i.patientId === patientId) : all
}

export function saveInvoice(invoice: Invoice): void {
  const all = getStore<Invoice[]>('invoices', [])
  all.push(invoice)
  setStore('invoices', all)
}

export function createInvoice(data: {
  patientId: string
  patientName: string
  service: string
  amount: number
}): Invoice {
  const invoice: Invoice = {
    id: generateId('INV'),
    ...data,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    method: '-',
    status: 'Pending',
    createdAt: new Date().toISOString(),
  }
  saveInvoice(invoice)
  return invoice
}

export function payInvoice(id: string, method: string = 'Transfer'): void {
  const all = getStore<Invoice[]>('invoices', [])
  const idx = all.findIndex((i) => i.id === id)
  if (idx !== -1) {
    all[idx].status = 'Paid'
    all[idx].method = method
    setStore('invoices', all)
  }
}

// ============== Vitals ==============

export function getVitals(patientId: string): Vitals[] {
  return getStore<Vitals[]>('vitals', []).filter((v) => v.patientId === patientId)
}

export function addVitals(vitals: Omit<Vitals, 'id'>): Vitals {
  const all = getStore<Vitals[]>('vitals', [])
  const entry: Vitals = { id: generateId('VIT'), ...vitals }
  all.push(entry)
  setStore('vitals', all)
  return entry
}

// ============== Medical Flags ==============

export function getMedicalFlags(patientId: string): MedicalFlag[] {
  return getStore<MedicalFlag[]>('medicalFlags', []).filter((f) => f.patientId === patientId)
}

export function addMedicalFlag(flag: Omit<MedicalFlag, 'id'>): MedicalFlag {
  const all = getStore<MedicalFlag[]>('medicalFlags', [])
  const entry: MedicalFlag = { id: generateId('FLG'), ...flag }
  all.push(entry)
  setStore('medicalFlags', all)
  return entry
}

// ============== Inventory ==============

export function getInventory(): InventoryItem[] {
  return getStore<InventoryItem[]>('inventory', [])
}

export function updateStock(id: string, delta: number): void {
  const all = getStore<InventoryItem[]>('inventory', [])
  const idx = all.findIndex((i) => i.id === id)
  if (idx !== -1) {
    all[idx].stock = Math.max(0, all[idx].stock + delta)
    setStore('inventory', all)
  }
}

// ============== Staff & Departments ==============

export function getStaffMembers(): StaffMember[] {
  return getStore<StaffMember[]>('staffMembers', [])
}

export function getDepartments(): Department[] {
  return getStore<Department[]>('departments', [])
}

// ============== Seed initial data (for demo usability) ==============

export function seedInitialData(): void {
  // Only seed if no data exists yet
  const appointments = getStore<Appointment[]>('appointments', [])
  if (appointments.length > 0) return

  // Seed some doctors/staff
  const staffMembers: StaffMember[] = [
    { id: 'D001', name: 'Dr. Ahmed Hassan', role: 'Doctor', department: 'Cardiology', status: 'Active', email: 'ahmed@hospital.com', phone: '(555) 111-2222', specialization: 'Cardiology', qualification: 'MD, Board Certified', experience: '15 years', rating: 4.8, patientsCount: 342, availability: 'Available', room: '201' },
    { id: 'D002', name: 'Dr. Emily Garcia', role: 'Doctor', department: 'Endocrinology', status: 'Active', email: 'emily@hospital.com', phone: '(555) 222-3333', specialization: 'Endocrinology', qualification: 'MD, Fellowship', experience: '12 years', rating: 4.9, patientsCount: 298, availability: 'Available', room: '305' },
    { id: 'D003', name: 'Dr. James Wilson', role: 'Doctor', department: 'Pulmonology', status: 'Active', email: 'james@hospital.com', phone: '(555) 333-4444', specialization: 'Pulmonology', qualification: 'MD, Board Certified', experience: '18 years', rating: 4.7, patientsCount: 267, availability: 'In Surgery', room: '402' },
    { id: 'D004', name: 'Dr. Lisa Chen', role: 'Doctor', department: 'Neurology', status: 'Active', email: 'lisa@hospital.com', phone: '(555) 444-5555', specialization: 'Neurology', qualification: 'MD, Fellowship', experience: '10 years', rating: 4.9, patientsCount: 156, availability: 'Available', room: '501' },
  ]
  setStore('staffMembers', staffMembers)

  const departments: Department[] = [
    { id: 'DEPT-001', name: 'Cardiology', head: 'Dr. Ahmed Hassan', beds: 20, staff: 12 },
    { id: 'DEPT-002', name: 'Orthopedics', head: 'Dr. Robert Smith', beds: 15, staff: 8 },
    { id: 'DEPT-003', name: 'Neurology', head: 'Dr. Lisa Chen', beds: 12, staff: 6 },
    { id: 'DEPT-004', name: 'Pediatrics', head: 'Dr. Maria Lopez', beds: 18, staff: 10 },
    { id: 'DEPT-005', name: 'Surgery', head: 'Dr. James Wilson', beds: 25, staff: 15 },
    { id: 'DEPT-006', name: 'Maternity', head: 'Dr. Sarah Johnson', beds: 22, staff: 14 },
  ]
  setStore('departments', departments)

  // Seed inventory
  const inventory: InventoryItem[] = [
    { id: 'INV-001', name: 'Lisinopril 10mg', stock: 450, minStock: 100, unit: 'tablets', supplier: 'PharmaCorp' },
    { id: 'INV-002', name: 'Metformin 500mg', stock: 320, minStock: 150, unit: 'tablets', supplier: 'HealthMeds' },
    { id: 'INV-003', name: 'Digoxin 0.25mg', stock: 45, minStock: 50, unit: 'tablets', supplier: 'CardioMeds' },
    { id: 'INV-004', name: 'Amoxicillin 500mg', stock: 890, minStock: 200, unit: 'tablets', supplier: 'BioPharma' },
    { id: 'INV-005', name: 'Aspirin 100mg', stock: 25, minStock: 100, unit: 'tablets', supplier: 'GenericDrugs' },
  ]
  setStore('inventory', inventory)
}
