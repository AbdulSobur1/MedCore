'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

type LoginStep = 'email' | 'verify' | 'password'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [step, setStep] = useState<LoginStep>('email')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState<'patient' | 'staff'>('patient')

  // Simulate checking if email is patient or staff
  const checkUserType = (emailAddress: string) => {
    const patients = JSON.parse(localStorage.getItem('patients') || '{}')
    const staffProfiles = JSON.parse(localStorage.getItem('staffProfiles') || '{}')
    
    const isPatient = Object.values(patients as any).some((p: any) => p.email === emailAddress)
    const isStaff = Object.values(staffProfiles as any).some((s: any) => s.email === emailAddress)
    
    if (isPatient) return 'patient'
    if (isStaff) return 'staff'
    return null
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (!email) {
        throw new Error('Please enter your email')
      }

      const detectedType = checkUserType(email)
      if (!detectedType) {
        throw new Error('Email not found. Please register first or check your email address.')
      }

      setUserType(detectedType)
      
      // Mock: Generate OTP for patients, ask for password for staff
      if (detectedType === 'patient') {
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        localStorage.setItem(`otp_${email}`, otp)
        console.log('[v0] OTP for demo:', otp)
        setStep('verify')
      } else {
        setStep('password')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error checking email')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (!otp) {
        throw new Error('Please enter the OTP')
      }

      const storedOtp = localStorage.getItem(`otp_${email}`)
      if (otp !== storedOtp) {
        throw new Error('Invalid OTP. Please try again.')
      }

      // OTP verified, get patient data and create session
      const patients = JSON.parse(localStorage.getItem('patients') || '{}')
      const patient = Object.values(patients as any).find((p: any) => p.email === email)

      if (!patient) {
        throw new Error('Patient not found')
      }

      const token = Math.random().toString(36).substr(2)
      login({
        userType: 'patient',
        userId: patient.patientId,
        email: patient.email,
        name: patient.name,
        token,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      })

      router.push('/patient/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (!password) {
        throw new Error('Please enter your password')
      }

      const staffProfiles = JSON.parse(localStorage.getItem('staffProfiles') || '{}')
      const staff = Object.values(staffProfiles as any).find((s: any) => s.email === email)

      if (!staff) {
        throw new Error('Staff profile not found')
      }

      // Mock password check
      if (password !== staff.password) {
        throw new Error('Incorrect password')
      }

      const token = Math.random().toString(36).substr(2)
      login({
        userType: 'staff',
        userId: staff.staffId,
        email: staff.email,
        name: staff.name,
        role: staff.role,
        token,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      })

      router.push('/staff/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card p-8">
        {/* Back Button */}
        <Link
          href="/auth/landing"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        {/* Header */}
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-light tracking-tight text-foreground">Login</h1>
          <p className="text-sm text-muted-foreground">
            {step === 'email' ? 'Enter your email to get started' : step === 'verify' ? 'Enter the OTP sent to your email' : 'Enter your password'}
          </p>
        </div>

        {/* Email Form */}
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-foreground mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && <Loader className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Checking...' : 'Continue'}
            </button>
          </form>
        )}

        {/* OTP Form */}
        {step === 'verify' && (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="p-3 bg-info/10 border border-info/20 rounded-lg text-xs text-info-foreground">
              OTP sent to <strong>{email}</strong>. For demo, check console logs.
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-2">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-center tracking-widest"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && <Loader className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={() => setStep('email')}
              className="w-full py-2 px-4 border border-border text-foreground rounded-lg font-medium text-sm hover:bg-muted transition-colors"
            >
              Back
            </button>
          </form>
        )}

        {/* Password Form */}
        {step === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-foreground mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && <Loader className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Logging in...' : 'Login'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('email')
                setPassword('')
              }}
              className="w-full py-2 px-4 border border-border text-foreground rounded-lg font-medium text-sm hover:bg-muted transition-colors"
            >
              Back
            </button>
          </form>
        )}

        {/* Register Link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-primary font-medium hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}
