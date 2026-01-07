// === app/api/auth/[...lucia]/route.ts ===

import { NextRequest, NextResponse } from 'next/server'
import { lucia } from '@/lib/auth/lucia'
import { db } from '@/lib/db'
import { hashPassword, verifyPassword } from '@/lib/auth/lucia'
import { cookies } from 'next/headers'
import { z } from 'zod'

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'login') {
      const validatedData = loginSchema.parse({
        email: body.email,
        password: body.password,
      })

      // Find user by email
      const user = await db.user.findUnique({
        where: { email: validatedData.email.toLowerCase() },
      })

      if (!user || !user.passwordHash) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      // Verify password
      const validPassword = await verifyPassword(user.passwordHash, validatedData.password)
      if (!validPassword) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      // Create session
      const session = await lucia.createSession(user.id, {})
      const sessionCookie = lucia.createSessionCookie(session.id)
      ;(await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      })
    }

    if (action === 'register') {
      const validatedData = registerSchema.parse({
        email: body.email,
        password: body.password,
        name: body.name,
      })

      // Check if user already exists
      const existingUser = await db.user.findUnique({
        where: { email: validatedData.email.toLowerCase() },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 409 }
        )
      }

      // Hash password
      const passwordHash = await hashPassword(validatedData.password)

      // Create user
      const user = await db.user.create({
        data: {
          email: validatedData.email.toLowerCase(),
          passwordHash,
          name: validatedData.name || null,
          role: 'USER',
        },
      })

      // Create session
      const session = await lucia.createSession(user.id, {})
      const sessionCookie = lucia.createSessionCookie(session.id)
      ;(await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      })
    }

    if (action === 'logout') {
      const sessionId = (await cookies()).get(lucia.sessionCookieName)?.value ?? null

      if (!sessionId) {
        return NextResponse.json({ success: true })
      }

      await lucia.invalidateSession(sessionId)
      const sessionCookie = lucia.createBlankSessionCookie()
      ;(await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || 'Validation error' },
        { status: 400 }
      )
    }

    console.error('Auth API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

