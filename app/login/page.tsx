'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
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
    login(createSession({ userType: 'patient', userId: patient.patientId, email: patient.email, name: patient.name, token: crypto.randomUUID() }))
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
    if (email === SUPER_ADMIN.email && password === SUPER_ADMIN.password) {
      login(createSession({ userType: 'staff', userId: SUPER_ADMIN.id, email: SUPER_ADMIN.email, name: SUPER_ADMIN.name, role: 'admin', isHeadAdmin: true, token: crypto.randomUUID() }))
      router.push('/admin/dashboard')
      return
    }
    const staffProfiles = JSON.parse(localStorage.getItem('staffProfiles') || '{}') as Record<string, StoredStaff>
    const staff = Object.values(staffProfiles).find((item) => item.email === email)
    if (!staff || staff.password !== password) {
      setError('Invalid staff credentials')
      return
    }
    login(createSession({ userType: 'staff', userId: staff.staffId, email: staff.email, name: staff.name, role: staff.role, isHeadAdmin: staff.isHeadAdmin, token: crypto.randomUUID() }))
    router.push(getRoleHome(staff.role))
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-100 bg-white p-8">
        <h1 className="text-3xl font-light tracking-tight text-foreground">Login</h1>
        <p className="mt-2 text-sm text-muted-foreground">Access MedCore HMS</p>
        <div className="mt-6 flex border-b border-slate-200">
          <button onClick={() => { setTab('staff'); setError('') }} className={`flex-1 border-b-2 px-4 py-2 text-sm font-medium ${tab === 'staff' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500'}`}>Staff Login</button>
          <button onClick={() => { setTab('patient'); setError('') }} className={`flex-1 border-b-2 px-4 py-2 text-sm font-medium ${tab === 'patient' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500'}`}>Patient Login</button>
        </div>

        {error && <div className="mt-4 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        {tab === 'staff' ? (
          <form onSubmit={staffLogin} className="mt-6 space-y-4">
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-100" placeholder="Email address" required />
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-slate-200 px-4 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-teal-100" placeholder="Password" required />
              <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
            <button className="w-full rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white">Sign In</button>
          </form>
        ) : (
          <form onSubmit={sendOtp} className="mt-6 space-y-4">
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-100" placeholder="Email address" required disabled={otpSent} />
            {!otpSent ? (
              <button className="w-full rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white">Send OTP</button>
            ) : (
              <div className="space-y-4">
                <p className="text-center text-sm text-slate-500">Enter the 6-digit code sent to {email}</p>
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <input key={index} ref={(node) => { inputs.current[index] = node }} value={digit} onChange={(event) => handleOtpInput(event.target.value, index)} onKeyDown={(event) => { if (event.key === 'Backspace' && !otp[index] && index > 0) inputs.current[index - 1]?.focus() }} maxLength={1} className="h-14 w-11 rounded-xl border border-slate-200 text-center text-xl font-bold outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
                  ))}
                </div>
                <button type="button" onClick={() => setOtpSent(false)} className="w-full text-sm text-teal-600 hover:underline">Resend code</button>
              </div>
            )}
            <p className="text-center text-sm text-slate-500"><Link href="/register" className="font-medium text-teal-600 hover:underline">Register as a new patient</Link></p>
          </form>
        )}
      </div>
    </div>
  )
}
