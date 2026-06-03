'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader, Eye, EyeOff } from 'lucide-react'
import { generateStaffId } from '@/lib/auth'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const ADMIN_SECRET_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || 'medcore-admin-2024'

export default function AdminRegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-card p-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-light tracking-tight text-foreground">Admin Access</h1>
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
      }
    >
      <AdminRegisterContent />
    </Suspense>
  )
}

function AdminRegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdAdminEmail, setCreatedAdminEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authorized, setAuthorized] = useState(false)
  const [adminKey, setAdminKey] = useState(searchParams.get('key') || '')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (adminKey === ADMIN_SECRET_KEY) {
      setAuthorized(true)
    } else {
      setError('Invalid admin key. Access denied.')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        throw new Error('Please fill in all fields')
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }

      // Check if email already exists
      const staffProfiles = JSON.parse(localStorage.getItem('staffProfiles') || '{}')
      const emailExists = Object.values(staffProfiles as any).some((s: any) => s.email === formData.email)
      if (emailExists) {
        throw new Error('Email already registered')
      }

      // Create admin profile
      const staffId = generateStaffId()
      const newAdmin = {
        staffId,
        email: formData.email,
        name: formData.name,
        role: 'admin' as const,
        password: formData.password,
        department: 'Administration',
        phone: '',
        createdAt: new Date().toISOString(),
        isActive: true,
        isHeadAdmin: true,
      }

      staffProfiles[staffId] = newAdmin
      localStorage.setItem('staffProfiles', JSON.stringify(staffProfiles))
      setCreatedAdminEmail(formData.email)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md glass-card p-8">
          <Link
            href="/auth/landing"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-light tracking-tight text-foreground">Admin Access</h1>
            <p className="text-sm text-muted-foreground">Enter the admin key to register the first admin account</p>
          </div>

          <form onSubmit={handleKeySubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-foreground mb-2">Admin Key</label>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Enter admin key"
                className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Verify Key
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Dialog open={!!createdAdminEmail} onOpenChange={(open) => !open && router.push('/auth/login')}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Head Admin Created</DialogTitle>
            <DialogDescription>
              This account can manage staff and create other administrator accounts.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-white/50 bg-muted p-4">
            <p className="text-xs font-medium text-muted-foreground">Admin Email</p>
            <p className="mt-1 break-all font-medium text-foreground">{createdAdminEmail}</p>
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
        <Link
          href="/auth/landing"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-light tracking-tight text-foreground">Create Admin Account</h1>
          <p className="text-sm text-muted-foreground">Set up your administrator credentials</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-foreground mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Administrator"
              className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@hospital.com"
              className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader className="w-4 h-4 animate-spin" />}
            {isLoading ? 'Creating Account...' : 'Create Admin Account'}
          </button>
        </form>
      </div>
    </div>
  )
}
