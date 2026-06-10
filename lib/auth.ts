// Auth types
export type UserRole = 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST' | 'PHARMACIST' | 'ACCOUNTANT' | 'PATIENT'

export const SUPER_ADMIN = {
  email: 'abdullahabdulsobur@gmail.com',
  password: 'Abdulsobur1.',
  name: 'Abdulsobur',
  role: 'ADMIN' as const,
  id: 'super-admin-001',
}

export const ROLE_HOME: Record<string, string> = {
  ADMIN: '/admin/dashboard',
  DOCTOR: '/doctor/dashboard',
  RECEPTIONIST: '/receptionist/dashboard',
  PHARMACIST: '/pharmacy/dashboard',
  ACCOUNTANT: '/billing/dashboard',
  PATIENT: '/patient/dashboard',
}

export function getRoleHome(role?: string): string {
  if (!role) return '/login'
  return ROLE_HOME[role] || '/login'
}

export interface PatientProfile {
  patientId: string
  email: string
  password?: string
  name: string
  phone: string
  dateOfBirth: string
  gender: 'M' | 'F' | 'Other'
  bloodType: string
  address?: string
  emergencyContact?: string
  createdAt: string
}

export interface StaffProfile {
  staffId: string
  email: string
  name: string
  role: Exclude<UserRole, 'PATIENT'>
  phone?: string
  department?: string
  createdAt: string
  invitedAt?: string
  acceptedAt?: string
  isActive: boolean
  isHeadAdmin?: boolean
}

export interface Session {
  userType: 'patient' | 'staff'
  userId: string
  email: string
  name: string
  role?: UserRole
  isHeadAdmin?: boolean
  token: string
  expiresAt: number
}

// Generate unique IDs
export function generatePatientId(): string {
  return `PT-${Date.now().toString(36).toUpperCase().slice(-4)}`
}

export function generateStaffId(): string {
  return `STAFF-${Date.now().toString(36).toUpperCase().slice(-4)}`
}

export function generateInviteToken(): string {
  return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2)
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Session management
export function createSession(data: Omit<Session, 'expiresAt'>): Session {
  return {
    ...data,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  }
}

export function isSessionValid(session: Session | null): boolean {
  if (!session) return false
  return Date.now() < session.expiresAt
}

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null
  const session = localStorage.getItem('medcore_session')
  if (!session) return null
  try {
    const parsed = JSON.parse(session)
    return isSessionValid(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function setSession(session: Session): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('medcore_session', JSON.stringify(session))
}

export function clearSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('medcore_session')
}

export function initializeSuperAdmin(): void {
  if (typeof window === 'undefined') return

  const staffProfiles = JSON.parse(localStorage.getItem('staffProfiles') || '{}') as Record<string, StaffProfile & { password?: string }>
  const existingEntry = Object.entries(staffProfiles).find(([, staff]) => staff.email === SUPER_ADMIN.email)

  if (existingEntry) {
    const [staffId, staff] = existingEntry
    if (!staff.isHeadAdmin || staff.role !== 'ADMIN') {
      staffProfiles[staffId] = { ...staff, isHeadAdmin: true, isActive: true, role: 'ADMIN' }
      localStorage.setItem('staffProfiles', JSON.stringify(staffProfiles))
    }
    return
  }

  staffProfiles[SUPER_ADMIN.id] = {
    staffId: SUPER_ADMIN.id,
    email: SUPER_ADMIN.email,
    name: SUPER_ADMIN.name,
    role: SUPER_ADMIN.role,
    password: SUPER_ADMIN.password,
    department: 'Administration',
    phone: '',
    createdAt: new Date().toISOString(),
    isActive: true,
    isHeadAdmin: true,
  }

  localStorage.setItem('staffProfiles', JSON.stringify(staffProfiles))
}

// Mock data storage (in production, would be database)
export interface MockDatabase {
  patients: Map<string, PatientProfile>
  staffProfiles: Map<string, StaffProfile>
  invites: Map<string, { staffId: string; token: string; expiresAt: number }>
  otps: Map<string, { code: string; expiresAt: number }>
  staffPasswords: Map<string, string>
}

export const mockDb: MockDatabase = {
  patients: new Map(),
  staffProfiles: new Map(),
  invites: new Map(),
  otps: new Map(),
  staffPasswords: new Map(),
}

// Mock admin staff (for demo purposes)
export function initializeMockAdmin(): void {
  const adminId = 'STAFF-ADMIN-001'
  mockDb.staffProfiles.set(adminId, {
    staffId: adminId,
    email: 'admin@hospital.com',
    name: 'Admin User',
    role: 'ADMIN',
    phone: '1234567890',
    department: 'Administration',
    createdAt: new Date().toISOString(),
    isActive: true,
    isHeadAdmin: true,
  })
  mockDb.staffPasswords.set(adminId, 'admin123')
}

export function naira(value: number): string {
  return `₦${value.toLocaleString('en-NG', { minimumFractionDigits: 0 })}`
}
