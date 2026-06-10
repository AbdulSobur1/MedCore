'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { Check, ArrowLeft } from 'lucide-react'
import { createSession, type PatientProfile } from '@/lib/auth'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'

type RegisterForm = {
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: PatientProfile['gender']
  bloodType: string
  phone: string
  address: string
  email: string
  emergencyName: string
  emergencyPhone: string
  insurance: string
  policyNumber: string
}

function nextPatientCode(count: number) {
  return `PT-${String(count + 1).padStart(4, '0')}`
}

export default function RegisterPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [patientId, setPatientId] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const inputs = useRef<Array<HTMLInputElement | null>>([])
  const [form, setForm] = useState<RegisterForm>({
    firstName: '', lastName: '', dateOfBirth: '', gender: 'M', bloodType: 'O+', phone: '', address: '',
    email: '', emergencyName: '', emergencyPhone: '', insurance: '', policyNumber: '',
  })

  const change = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))

  const validateStep = () => {
    setError('')
    if (step === 1 && (!form.firstName || !form.lastName || !form.dateOfBirth || !form.phone || !form.address)) {
      setError('Please complete the required personal information.')
      return
    }
    if (step === 2) {
      if (!/\S+@\S+\.\S+/.test(form.email)) {
        setError('Enter a valid email address.')
        return
      }
      const patients = JSON.parse(localStorage.getItem('patients') || '{}') as Record<string, PatientProfile>
      if (Object.values(patients).some((item) => item.email === form.email)) {
        setError('This email is already registered.')
        return
      }
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      localStorage.setItem(`otp_${form.email}`, code)
      console.log('[MedCore registration OTP]', code)
      toast.success(`OTP sent to ${form.email}`)
    }
    setStep((current) => current + 1)
  }

  const completeRegistration = (nextOtp = otp) => {
    const code = nextOtp.join('')
    if (code.length !== 6) return
    if (code !== localStorage.getItem(`otp_${form.email}`)) {
      setError('Invalid verification code.')
      return
    }
    const patients = JSON.parse(localStorage.getItem('patients') || '{}') as Record<string, PatientProfile>
    const generatedId = nextPatientCode(Object.keys(patients).length)
    const patient: PatientProfile = {
      patientId: generatedId,
      name: `${form.firstName} ${form.lastName}`,
      email: form.email,
      phone: form.phone,
      dateOfBirth: form.dateOfBirth,
      gender: form.gender,
      bloodType: form.bloodType,
      address: form.address,
      emergencyContact: `${form.emergencyName} ${form.emergencyPhone}`.trim(),
      createdAt: new Date().toISOString(),
    }
    patients[generatedId] = patient
    localStorage.setItem('patients', JSON.stringify(patients))
    setPatientId(generatedId)
    setStep(4)
    login(createSession({ userType: 'patient', userId: generatedId, email: patient.email, name: patient.name, token: crypto.randomUUID(), role: 'PATIENT' }))
    toast.success('Registration completed successfully!')
  }

  const handleOtpInput = (value: string, index: number) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[index] = digit
    setOtp(next)
    if (digit && index < 5) inputs.current[index + 1]?.focus()
    completeRegistration(next)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[--bg] p-4">
      <div className="w-full max-w-[480px]">
        {/* Progress indicator */}
        {step < 4 && (
          <div className="flex items-center gap-1.5 mb-8">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  step >= n ? 'bg-[--accent]' : 'bg-[--border]'
                }`}
              />
            ))}
          </div>
        )}

        <div className="bg-[--surface] rounded-xl border border-[--border] p-6">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-[13px] text-[--accent] hover:underline mb-5">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to login
          </Link>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[--danger-soft] border border-[--danger-soft] text-[13px] text-[--danger]">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="page-title">Personal Info</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input name="firstName" value={form.firstName} onChange={change} placeholder="First Name" className="input-field col-span-1" required />
                <input name="lastName" value={form.lastName} onChange={change} placeholder="Last Name" className="input-field col-span-1" required />
                <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={change} className="input-field col-span-1" required />
                <select name="gender" value={form.gender} onChange={change} className="input-field col-span-1">
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="Other">Other</option>
                </select>
                <select name="bloodType" value={form.bloodType} onChange={change} className="input-field col-span-1">
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((t) => <option key={t}>{t}</option>)}
                </select>
                <input name="phone" value={form.phone} onChange={change} placeholder="Phone" className="input-field col-span-1" required />
                <input name="address" value={form.address} onChange={change} placeholder="Home Address" className="input-field sm:col-span-2" required />
              </div>
              <button onClick={validateStep} className="btn-primary w-full">Next</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="page-title">Account Setup</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input name="email" type="email" value={form.email} onChange={change} placeholder="Email Address" className="input-field sm:col-span-2" required />
                <input name="emergencyName" value={form.emergencyName} onChange={change} placeholder="Emergency Contact Name" className="input-field" />
                <input name="emergencyPhone" value={form.emergencyPhone} onChange={change} placeholder="Emergency Contact Phone" className="input-field" />
                <input name="insurance" value={form.insurance} onChange={change} placeholder="Insurance Provider (optional)" className="input-field" />
                <input name="policyNumber" value={form.policyNumber} onChange={change} placeholder="Policy Number (optional)" className="input-field" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="btn-ghost flex-1">Back</button>
                <button onClick={validateStep} className="btn-primary flex-1">Send OTP</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 text-center">
              <h2 className="page-title">Verify Email</h2>
              <p className="text-[13px] text-[--text-3]">We sent a 6-digit code to {form.email}</p>
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
              <button onClick={() => setStep(2)} className="text-[13px] text-[--accent] hover:underline">Change email</button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5 py-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-[--success-soft] flex items-center justify-center">
                <Check className="w-6 h-6 text-[--success]" />
              </div>
              <h2 className="page-title">You&apos;re registered!</h2>
              <p className="text-[13px] text-[--text-3]">
                Patient ID: <span className="font-semibold text-[--text-1]">{patientId}</span>
              </p>
              <button onClick={() => router.push('/patient/dashboard')} className="btn-primary">
                Go to my dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
