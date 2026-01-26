// === lib/auth/lucia.ts ===

import { Lucia } from 'lucia'
import { PrismaAdapter } from '@lucia-auth/adapter-prisma'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'
import { cache } from 'react'
import type { Session, User } from 'lucia'

// Extend Lucia types
declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia
    DatabaseUserAttributes: {
      id: string
      email: string
      name: string | null
      role: 'USER' | 'ADMIN'
    }
  }
}

// Initialize Prisma adapter for Lucia (only in Node.js)
const adapter = process.env.NEXT_RUNTIME !== 'edge'
  ? new PrismaAdapter(db.session, db.user)
  : (null as any)

// Initialize Lucia with configuration
export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    },
  },
  getUserAttributes: (attributes) => {
    return {
      id: attributes.id,
      email: attributes.email,
      name: attributes.name,
      role: attributes.role,
    }
  },
})

// Get user from session (cached for performance)
export const getUser = cache(async (): Promise<{ user: User; session: Session } | { user: null; session: null }> => {
  const sessionId = (await cookies()).get(lucia.sessionCookieName)?.value ?? null
  if (!sessionId) {
    return {
      user: null,
      session: null,
    }
  }

  const result = await lucia.validateSession(sessionId)
  try {
    if (result.session && result.session.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id)
        ; (await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
    }
    if (!result.session) {
      const sessionCookie = lucia.createBlankSessionCookie()
        ; (await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
    }
  } catch {
    // Next.js throws error when attempting to set cookies during rendering
  }
  return result
})

