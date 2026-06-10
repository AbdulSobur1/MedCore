'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { Eye, EyeOff, Stethoscope } from 'lucide-react'
import { createSession, getRoleHome, SUPER_ADMIN, type PatientProfile, type StaffProfile } from '@/lib/auth'
import { useAuth } from '@/lib/auth-context'

type StoredStaff = StaffProfile & { password?: string }

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [tab, setTab] = useState<'staff' | 'patient'>('staff')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const inputs = useRef<Array<HTMLInputElement | null>>([])

  const sendOtp = (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    const patients = JSON.parse(localStorage.getItem('patients') || '{}') as Record<string, PatientProfile>
    const patient = Object.values(patients).find((item) => item.email === email)
    if (!patient) {
      setError('Patient email not found. Please register first.')
      return
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    localStorage.setItem(`otp_${email}`, code)
    console.log('[MedCore demo OTP]', code)
    setOtpSent(true)
  }

  const verifyOtp = (nextOtp = otp) => {
    const code = nextOtp.join('')
    if (code.length !== 6) return
    const stored = localStorage.getItem(`otp_${email}`)
    if (code !== stored) {
      setError('Invalid or expired code')
      return
    }
    const patients = JSON.parse(localStorage.getItem('patients') || '{}') as Record<string, PatientProfile>
    const patient = Object.values(patients).find((item) => item.email === email)
    if (!patient) return
    login(createSession({ userType: 'patient', userId: patient.patientId, email: patient.email, name: patient.name, token: crypto.randomUUID(), role: 'PATIENT' }))
    router.push('/patient/dashboard')
  }

  const handleOtpInput = (value: string, index: number) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[index] = digit
    setOtp(next)
    if (digit && index < 5) inputs.current[index + 1]?.focus()
    verifyOtp(next)
  }

  const staffLogin = (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    // Hardcoded super admin
    if (email === SUPER_ADMIN.email && password === SUPER_ADMIN.password) {
      login(createSession({ userType: 'staff', userId: SUPER_ADMIN.id, email: SUPER_ADMIN.email, name: SUPER_ADMIN.name, role: 'ADMIN', isHeadAdmin: true, token: crypto.randomUUID() }))
      router.push('/admin/dashboard')
      return
    }

    const staffProfiles = JSON.parse(localStorage.getItem('staffProfiles') || '{}') as Record<string, StoredStaff>
    const staff = Object.values(staffProfiles).find((item) => item.email === email)
    if (!staff || staff.password !== password) {
      setError('Invalid staff credentials')
      return
    }
    login(createSession({ userType: 'staff', userId: staff.staffId, email: staff.email, name: staff.name, role: staff.role as any, isHeadAdmin: staff.isHeadAdmin, token: crypto.randomUUID() }))
    router.push(getRoleHome(staff.role))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[--bg] p-4">
      <div className="w-full max-w-[420px]">
        {/* Logo + wordmark */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-[--accent] flex items-center justify-center mb-3">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-[--text-1] tracking-[-0.3px]">MedCore HMS</h1>
        </div>

        {/* Card */}
        <div className="bg-[--surface] rounded-xl border border-[--border] p-6">
          {/* Tabs */}
          <div className="flex border-b border-[--border] mb-6">
            <button
              onClick={() => { setTab('staff'); setError('') }}
              className={`px-4 pb-3 text-[13px] font-medium border-b-2 transition-colors ${
                tab === 'staff'
                  ? 'border-[--accent] text-[--accent]'
                  : 'border-transparent text-[--text-3] hover:text-[--text-2]'
              }`}
            >
              Staff Login
            </button>
            <button
              onClick={() => { setTab('patient'); setError('') }}
              className={`px-4 pb-3 text-[13px] font-medium border-b-2 transition-colors ${
                tab === 'patient'
                  ? 'border-[--accent] text-[--accent]'
                  : 'border-transparent text-[--text-3] hover:text-[--text-2]'
              }`}
            >
              Patient Login
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[--danger-soft] border border-[--danger-soft] text-[13px] text-[--danger]">
              {error}
            </div>
          )}

          {tab === 'staff' ? (
            <form onSubmit={staffLogin} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="input-field w-full"
                placeholder="Email address"
                required
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="input-field w-full pr-10"
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[--text-3] hover:text-[--text-2]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button type="submit" className="btn-primary w-full">
                Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={sendOtp} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="input-field w-full"
                placeholder="Email address"
                required
                disabled={otpSent}
              />
              {!otpSent ? (
                <>
                  <button type="submit" className="btn-primary w-full">
                    Send OTP
                  </button>
                  <p className="text-center text-[13px] text-[--text-3]">
                    <Link href="/register" className="font-medium text-[--accent] hover:underline">
                      Register as a new patient
                    </Link>
                  </p>
                </>
              ) : (
                <div className="space-y-4">
                  <p className="text-center text-[13px] text-[--text-3]">
                    Enter the 6-digit code sent to {email}
                  </p>
                  <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(node) => { inputs.current[index] = node }}
                        value={digit}
                        onChange={(event) => handleOtpInput(event.target.value, index)}
                        onKeyDown={(event) => {
                          if (event.key === 'Backspace' && !otp[index] && index > 0) {
                            inputs.current[index - 1]?.focus()
                          }
                        }}
                        maxLength={1}
                        className="w-11 h-14 rounded-lg border border-[--border-2] text-center text-xl font-semibold text-[--text-1] outline-none focus:border-[--accent] focus:ring-2 focus:ring-[--accent-soft] transition-colors"
                      />
                    ))}
                  </div>
                  <button type="button" onClick={() => setOtpSent(false)} className="w-full text-[13px] text-[--accent] hover:underline">
                    Resend code
                  </button>
                  <p className="text-center text-[13px] text-[--text-3]">
                    <Link href="/register" className="font-medium text-[--accent] hover:underline">
                      Register as a new patient
                    </Link>
                  </p>
                </div>
              )}
            </form>
          )}
        </div>

        <p className="text-center mt-6 text-[12px] text-[--text-3]">
          MedCore Hospital Management System
        </p>
      </div>
    </div>
  )
}
