import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ROLE_HOME: Record<string, string> = {
  ADMIN: '/admin/dashboard',
  DOCTOR: '/doctor/dashboard',
  RECEPTIONIST: '/receptionist/dashboard',
  PHARMACIST: '/pharmacy/dashboard',
  ACCOUNTANT: '/billing/dashboard',
  PATIENT: '/patient/dashboard',
}

const PUBLIC_ROUTES = ['/login', '/register', '/auth/landing', '/auth/login', '/auth/register']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next()
  }

  // For demo/client-side auth, we let the layout handle redirects
  // The middleware is here as a foundation for NextAuth.js integration
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icon.svg|icon-light-32x32.png|icon-dark-32x32.png|apple-icon.png).*)',
  ],
}
