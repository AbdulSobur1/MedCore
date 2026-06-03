'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader } from 'lucide-react'
import { generatePatientId } from '@/lib/auth'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdPatientId, setCreatedPatientId] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    gender: 'M' as const,
    bloodType: 'O+',
    address: '',
    emergencyContact: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.phone || !formData.dateOfBirth) {
        throw new Error('Please fill in all required fields')
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }

      // Generate patient ID
      const patientId = generatePatientId()

      // Mock: Store patient data in localStorage
      const patients = JSON.parse(localStorage.getItem('patients') || '{}')
      
      // Check if email already exists
      const emailExists = Object.values(patients as any).some((p: any) => p.email === formData.email)
      if (emailExists) {
        throw new Error('Email already registered. Please use a different email or login.')
      }

      patients[patientId] = {
        patientId,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        bloodType: formData.bloodType,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        createdAt: new Date().toISOString(),
      }

      localStorage.setItem('patients', JSON.stringify(patients))
      setCreatedPatientId(patientId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Dialog open={!!createdPatientId} onOpenChange={(open) => !open && router.push('/auth/login')}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Registration Complete</DialogTitle>
            <DialogDescription>
              Your patient profile has been created. Save this Patient ID for hospital records.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-white/50 bg-muted p-4">
            <p className="text-xs font-medium text-muted-foreground">Patient ID</p>
            <p className="mt-1 break-all font-mono text-lg font-semibold text-foreground">{createdPatientId}</p>
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => router.push('/auth/login')}
              className="w-full sm:w-auto px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Continue to Login
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
          <h1 className="text-3xl font-light tracking-tight text-foreground">Create Account</h1>
          <p className="text-sm text-muted-foreground">Register as a patient to access your medical records</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-2">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-2">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-2">Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-2">Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-2">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-2">Date of Birth *</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-2">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Blood Type */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-2">Blood Type</label>
            <select
              name="bloodType"
              value={formData.bloodType}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-2">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main St, City, State"
              className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Emergency Contact */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-2">Emergency Contact</label>
            <input
              type="text"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleChange}
              placeholder="Name or phone number"
              className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader className="w-4 h-4 animate-spin" />}
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary font-medium hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  )
}
