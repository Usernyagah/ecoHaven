// === lib/auth/middleware.ts ===

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { lucia } from '@/lib/auth/lucia'

/**
 * Middleware helper for Next.js App Router
 * Protects /admin routes and handles authentication checks
 */
export async function authMiddleware(request: NextRequest) {
  const sessionId = request.cookies.get(lucia.sessionCookieName)?.value ?? null
  const pathname = request.nextUrl.pathname

  const isAdminRoute = pathname.startsWith('/admin')
  const isPublicRoute = ['/login', '/register'].includes(pathname)

  // In Middleware (Edge), we can't hit the DB to validate the session.
  // We perform light redirects based on cookie presence.
  // Full role-based validation must happen in the Server Components (Node.js).

  // Redirect authenticated users away from login/register
  if (isPublicRoute && sessionId) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Redirect unauthenticated users away from admin
  if (isAdminRoute && !sessionId) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}
