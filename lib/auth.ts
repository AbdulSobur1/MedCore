// Auth types
export type UserRole = 'patient' | 'doctor' | 'pharmacist' | 'receptionist' | 'accountant' | 'admin'

export interface PatientProfile {
  patientId: string
  email: string
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
  role: Exclude<UserRole, 'patient'>
  phone?: string
  department?: string
  createdAt: string
  invitedAt?: string
  acceptedAt?: string
  isActive: boolean
}

export interface Session {
  userType: 'patient' | 'staff'
  userId: string
  email: string
  name: string
  role?: UserRole
  token: string
  expiresAt: number
}

// Generate unique IDs
export function generatePatientId(): string {
  return `PAT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
}

export function generateStaffId(): string {
  return `STAFF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
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
    role: 'admin',
    phone: '1234567890',
    department: 'Administration',
    createdAt: new Date().toISOString(),
    isActive: true,
  })
  mockDb.staffPasswords.set(adminId, 'admin123') // Mock password for demo
}
