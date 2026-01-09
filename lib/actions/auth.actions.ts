// === lib/actions/auth.actions.ts ===

'use server'

import { db } from '@/lib/db'
import { hashPassword, verifyPassword, lucia } from '@/lib/auth/lucia'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
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

export type AuthResult = {
  success: boolean
  error?: string
}

/**
 * Server action for user login
 */
export async function loginAction(formData: FormData): Promise<AuthResult> {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Validate input
    const validatedData = loginSchema.parse({ email, password })

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    })

    if (!user || !user.passwordHash) {
      return {
        success: false,
        error: 'Invalid email or password',
      }
    }

    // Verify password
    const validPassword = await verifyPassword(user.passwordHash, validatedData.password)
    if (!validPassword) {
      return {
        success: false,
        error: 'Invalid email or password',
      }
    }

    // Create session
    const session = await lucia.createSession(user.id, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
      ; (await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

    // Redirect to home or intended page
    redirect('/')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || 'Validation error',
      }
    }

    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }

    return {
      success: false,
      error: 'An error occurred during login',
    }
  }
}

/**
 * Server action for user registration
 */
export async function registerAction(formData: FormData): Promise<AuthResult> {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string | null

    // Validate input
    const validatedData = registerSchema.parse({
      email,
      password,
      name: name || undefined,
    })

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    })

    if (existingUser) {
      return {
        success: false,
        error: 'Email already in use',
      }
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
      ; (await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

    // Redirect to home
    redirect('/')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || 'Validation error',
      }
    }

    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }

    return {
      success: false,
      error: 'An error occurred during registration',
    }
  }
}

/**
 * Server action for user logout
 */
export async function logoutAction(): Promise<void> {
  const sessionId = (await cookies()).get(lucia.sessionCookieName)?.value ?? null

  if (sessionId) {
    await lucia.invalidateSession(sessionId)
  }

  const sessionCookie = lucia.createBlankSessionCookie()
    ; (await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

  redirect('/login')
}
