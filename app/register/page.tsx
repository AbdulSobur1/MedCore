'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { Check } from 'lucide-react'
import { createSession, type PatientProfile } from '@/lib/auth'
import { useAuth } from '@/lib/auth-context'

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

  const change = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))

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
    login(createSession({ userType: 'patient', userId: generatedId, email: patient.email, name: patient.name, token: crypto.randomUUID() }))
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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl rounded-xl border border-slate-100 bg-white p-6 sm:p-8">
        <Link href="/login" className="text-sm text-teal-600 hover:underline">Back to login</Link>
        {step < 4 && (
          <div className="my-8 flex items-center gap-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${step >= n ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{step > n ? <Check className="h-4 w-4" /> : n}</div>
                {n < 3 && <div className={`h-0.5 w-12 ${step > n ? 'bg-teal-600' : 'bg-slate-200'}`} />}
              </div>
            ))}
          </div>
        )}
        {error && <div className="mb-4 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        {step === 1 && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-slate-800">Personal Info</h1>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input name="firstName" value={form.firstName} onChange={change} placeholder="First Name" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              <input name="lastName" value={form.lastName} onChange={change} placeholder="Last Name" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={change} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              <select name="gender" value={form.gender} onChange={change} className="rounded-lg border border-slate-200 px-3 py-2 text-sm"><option value="M">Male</option><option value="F">Female</option><option value="Other">Other</option></select>
              <select name="bloodType" value={form.bloodType} onChange={change} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">{['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((item) => <option key={item}>{item}</option>)}</select>
              <input name="phone" value={form.phone} onChange={change} placeholder="Phone" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              <input name="address" value={form.address} onChange={change} placeholder="Home Address" className="rounded-lg border border-slate-200 px-3 py-2 text-sm sm:col-span-2" />
            </div>
            <button onClick={validateStep} className="w-full rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white">Next</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-slate-800">Account Setup</h1>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input name="email" type="email" value={form.email} onChange={change} placeholder="Email Address" className="rounded-lg border border-slate-200 px-3 py-2 text-sm sm:col-span-2" />
              <input name="emergencyName" value={form.emergencyName} onChange={change} placeholder="Emergency Contact Name" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              <input name="emergencyPhone" value={form.emergencyPhone} onChange={change} placeholder="Emergency Contact Phone" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              <input name="insurance" value={form.insurance} onChange={change} placeholder="Insurance Provider" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              <input name="policyNumber" value={form.policyNumber} onChange={change} placeholder="Policy Number" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div className="flex gap-2"><button onClick={() => setStep(1)} className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm">Back</button><button onClick={validateStep} className="flex-1 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white">Send OTP</button></div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 text-center">
            <h1 className="text-2xl font-bold text-slate-800">Verify Email</h1>
            <p className="text-sm text-slate-500">We sent a 6-digit code to {form.email}</p>
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => <input key={index} ref={(node) => { inputs.current[index] = node }} value={digit} onChange={(event) => handleOtpInput(event.target.value, index)} maxLength={1} className="h-14 w-11 rounded-xl border border-slate-200 text-center text-xl font-bold outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />)}
            </div>
            <button onClick={() => setStep(2)} className="text-sm text-teal-600 hover:underline">Change email</button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5 py-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-white"><Check className="h-7 w-7" /></div>
            <h1 className="text-2xl font-bold text-slate-800">You&apos;re registered!</h1>
            <p className="text-sm text-slate-500">Patient ID: <span className="font-semibold text-slate-800">{patientId}</span></p>
            <button onClick={() => router.push('/patient/dashboard')} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white">Go to my dashboard</button>
          </div>
        )}
      </div>
    </div>
  )
}
