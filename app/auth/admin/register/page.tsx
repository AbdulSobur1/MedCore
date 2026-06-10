'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { generateStaffId } from '@/lib/auth'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

const ADMIN_SECRET_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || 'medcore-admin-2024'

export default function AdminRegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[--bg] flex items-center justify-center p-4">
        <div className="space-y-3 w-full max-w-sm px-4">
          <div className="h-4 bg-[--surface-2] rounded animate-pulse w-1/2" />
          <div className="h-8 bg-[--surface-2] rounded animate-pulse w-3/4" />
          <div className="h-24 bg-[--surface-2] rounded animate-pulse" />
        </div>
      </div>
    }>
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
    name: '', email: '', password: '', confirmPassword: '',
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
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword)
        throw new Error('Please fill in all fields')
      if (formData.password !== formData.confirmPassword)
        throw new Error('Passwords do not match')
      if (formData.password.length < 6)
        throw new Error('Password must be at least 6 characters')

      const staffProfiles = JSON.parse(localStorage.getItem('staffProfiles') || '{}')
      if (Object.values(staffProfiles as any).some((s: any) => s.email === formData.email))
        throw new Error('Email already registered')

      const staffId = generateStaffId()
      const newAdmin = {
        staffId, email: formData.email, name: formData.name, role: 'ADMIN' as const,
        password: formData.password, department: 'Administration', phone: '',
        createdAt: new Date().toISOString(), isActive: true, isHeadAdmin: true,
      }
      staffProfiles[staffId] = newAdmin
      localStorage.setItem('staffProfiles', JSON.stringify(staffProfiles))
      setCreatedAdminEmail(formData.email)
      toast.success('Admin account created successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[--bg] flex items-center justify-center p-4">
        <div className="w-full max-w-[420px] bg-[--surface] rounded-xl border border-[--border] p-6">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-[13px] text-[--accent] hover:underline mb-6">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
          <h1 className="page-title mb-1">Admin Access</h1>
          <p className="caption mb-6">Enter the admin key to register the first admin account</p>
          <form onSubmit={handleKeySubmit} className="space-y-4">
            {error && <div className="p-3 rounded-lg bg-[--danger-soft] text-[13px] text-[--danger]">{error}</div>}
            <div>
              <label className="label block mb-1.5">Admin Key</label>
              <input type="password" value={adminKey} onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Enter admin key" className="input-field w-full" />
            </div>
            <button type="submit" className="btn-primary w-full">Verify Key</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[--bg] flex items-center justify-center p-4">
      <Dialog open={!!createdAdminEmail} onOpenChange={(open) => !open && router.push('/login')}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Head Admin Created</DialogTitle>
            <DialogDescription>This account can manage staff and create other administrator accounts.</DialogDescription>
          </DialogHeader>
          <div className="p-3 rounded-lg bg-[--surface-2]">
            <p className="label">Admin Email</p>
            <p className="text-[13px] font-medium text-[--text-1] mt-0.5">{createdAdminEmail}</p>
          </div>
          <DialogFooter>
            <button type="button" onClick={() => router.push('/login')} className="btn-primary">
              Continue to Login
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="w-full max-w-[420px] bg-[--surface] rounded-xl border border-[--border] p-6">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-[13px] text-[--accent] hover:underline mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Link>
        <h1 className="page-title mb-1">Create Admin Account</h1>
        <p className="caption mb-6">Set up your administrator credentials</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 rounded-lg bg-[--danger-soft] text-[13px] text-[--danger]">{error}</div>}
          <div>
            <label className="label block mb-1.5">Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange}
              placeholder="Administrator" className="input-field w-full" required />
          </div>
          <div>
            <label className="label block mb-1.5">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange}
              placeholder="admin@hospital.com" className="input-field w-full" required />
          </div>
          <div>
            <label className="label block mb-1.5">Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password}
                onChange={handleChange} placeholder="••••••••" className="input-field w-full pr-10" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[--text-3] hover:text-[--text-2]">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="label block mb-1.5">Confirm Password</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword}
              onChange={handleChange} placeholder="••••••••" className="input-field w-full" required />
          </div>
          <button type="submit" disabled={isLoading}
            className="btn-primary w-full disabled:opacity-50">
            {isLoading ? 'Creating Account...' : 'Create Admin Account'}
          </button>
        </form>
      </div>
    </div>
  )
}
