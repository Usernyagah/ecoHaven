// === middleware.ts ===

import type { NextRequest } from 'next/server'
import { authMiddleware } from '@/lib/auth/middleware'

export async function middleware(request: NextRequest) {
  return await authMiddleware(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

