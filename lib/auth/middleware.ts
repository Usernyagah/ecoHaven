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

  // Allow public routes if not authenticated
  if (isPublicRoute && !sessionId) {
    return NextResponse.next()
  }

  // For protected routes (admin) or authenticated users visiting public routes
  if (isAdminRoute || (isPublicRoute && sessionId)) {
    if (!sessionId) {
      // Redirect unauthenticated users to login
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    try {
      const { user, session } = await lucia.validateSession(sessionId)

      // If session is invalid, redirect to login
      if (!session || !user) {
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('from', pathname)
        const response = NextResponse.redirect(redirectUrl)
        response.cookies.set(lucia.sessionCookieName, '', {
          expires: new Date(0),
          path: '/',
        })
        return response
      }

      // Check admin access for admin routes
      if (isAdminRoute && user.role !== 'ADMIN') {
        // Redirect non-admin users to home
        return NextResponse.redirect(new URL('/', request.url))
      }

      // Redirect authenticated users away from login/register
      if (isPublicRoute && session && user) {
        return NextResponse.redirect(new URL('/', request.url))
      }

      // Create new session cookie if session was refreshed
      if (session.fresh) {
        const sessionCookie = lucia.createSessionCookie(session.id)
        const response = NextResponse.next()
        response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
        return response
      }
    } catch (error) {
      // If validation fails, redirect to login
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('from', pathname)
      const response = NextResponse.redirect(redirectUrl)
      response.cookies.set(lucia.sessionCookieName, '', {
        expires: new Date(0),
        path: '/',
      })
      return response
    }
  }

  return NextResponse.next()
}
