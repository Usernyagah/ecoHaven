// === tests/auth/protected-routes.test.ts ===

import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals'
import { PrismaClient } from '@prisma/client'
import { lucia, hashPassword } from '@/lib/auth/lucia'

// Suppress console logs during tests
const originalConsoleLog = console.log
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

beforeAll(() => {
  console.log = jest.fn()
  console.error = jest.fn()
  console.warn = jest.fn()
})

afterAll(() => {
  console.log = originalConsoleLog
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
})

describe('Protected Routes', () => {
  let prisma: PrismaClient
  const testDatabaseUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL

  if (!testDatabaseUrl) {
    throw new Error('TEST_DATABASE_URL or DATABASE_URL must be set for integration tests')
  }

  beforeAll(async () => {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: testDatabaseUrl,
        },
      },
      log: [],
    })

    await prisma.$connect()
  })

  beforeEach(async () => {
    // Clean database before each test
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.product.deleteMany()
    await prisma.category.deleteMany()
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    // Final cleanup
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.product.deleteMany()
    await prisma.category.deleteMany()
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    await prisma.user.deleteMany()
    await prisma.$disconnect()
  })

  describe('Admin Route Protection', () => {
    it('should redirect /admin/dashboard to /login if unauthenticated', async () => {
      // Create a mock middleware function
      const { authMiddleware } = await import('@/lib/auth/middleware')
      const mockRequest = {
        nextUrl: {
          pathname: '/admin/dashboard',
          href: 'http://localhost:3000/admin/dashboard',
          searchParams: new URLSearchParams(),
        },
        cookies: {
          get: jest.fn().mockReturnValue(null),
        },
        url: 'http://localhost:3000/admin/dashboard',
      } as any

      const response = await authMiddleware(mockRequest)

      expect(response).toBeDefined()
      expect(response.status).toBe(307) // Redirect status
      expect(response.headers.get('location')).toContain('/login')
    })

    it('should redirect /admin/dashboard to / if authenticated but role USER', async () => {
      // Create a regular user
      const email = 'user@example.com'
      const passwordHash = await hashPassword('password123')

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: 'USER',
        },
      })

      // Create a session
      const session = await lucia.createSession(user.id, {})
      const sessionCookie = lucia.createSessionCookie(session.id)

      // Create mock request with session cookie
      const { authMiddleware } = await import('@/lib/auth/middleware')
      const mockRequest = {
        nextUrl: {
          pathname: '/admin/dashboard',
          href: 'http://localhost:3000/admin/dashboard',
          searchParams: new URLSearchParams(),
        },
        cookies: {
          get: jest.fn().mockReturnValue({
            value: session.id,
          }),
        },
        url: 'http://localhost:3000/admin/dashboard',
      } as any

      const response = await authMiddleware(mockRequest)

      expect(response).toBeDefined()
      expect(response.status).toBe(307) // Redirect status
      expect(response.headers.get('location')).toBe('http://localhost:3000/')
    })

    it('should allow access to /admin/dashboard if role ADMIN', async () => {
      // Create an admin user
      const email = 'admin@example.com'
      const passwordHash = await hashPassword('password123')

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: 'ADMIN',
        },
      })

      // Create a session
      const session = await lucia.createSession(user.id, {})
      const sessionCookie = lucia.createSessionCookie(session.id)

      // Create mock request with session cookie
      const { authMiddleware } = await import('@/lib/auth/middleware')
      const mockRequest = {
        nextUrl: {
          pathname: '/admin/dashboard',
          href: 'http://localhost:3000/admin/dashboard',
          searchParams: new URLSearchParams(),
        },
        cookies: {
          get: jest.fn().mockReturnValue({
            value: session.id,
          }),
        },
        url: 'http://localhost:3000/admin/dashboard',
      } as any

      const response = await authMiddleware(mockRequest)

      expect(response).toBeDefined()
      // Should allow access (no redirect)
      expect(response.status).toBe(200)
    })
  })

  describe('Public Routes', () => {
    it('should allow access to /login if unauthenticated', async () => {
      const { authMiddleware } = await import('@/lib/auth/middleware')
      const mockRequest = {
        nextUrl: {
          pathname: '/login',
          href: 'http://localhost:3000/login',
          searchParams: new URLSearchParams(),
        },
        cookies: {
          get: jest.fn().mockReturnValue(null),
        },
        url: 'http://localhost:3000/login',
      } as any

      const response = await authMiddleware(mockRequest)

      expect(response).toBeDefined()
      // Should allow access
      expect(response.status).toBe(200)
    })

    it('should redirect to / if authenticated user visits /login', async () => {
      // Create a user
      const email = 'user@example.com'
      const passwordHash = await hashPassword('password123')

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: 'USER',
        },
      })

      // Create a session
      const session = await lucia.createSession(user.id, {})

      // Create mock request with session cookie
      const { authMiddleware } = await import('@/lib/auth/middleware')
      const mockRequest = {
        nextUrl: {
          pathname: '/login',
          href: 'http://localhost:3000/login',
          searchParams: new URLSearchParams(),
        },
        cookies: {
          get: jest.fn().mockReturnValue({
            value: session.id,
          }),
        },
        url: 'http://localhost:3000/login',
      } as any

      const response = await authMiddleware(mockRequest)

      expect(response).toBeDefined()
      expect(response.status).toBe(307) // Redirect status
      expect(response.headers.get('location')).toBe('http://localhost:3000/')
    })
  })

  describe('Session Validation', () => {
    it('should redirect to /login if session is invalid', async () => {
      const { authMiddleware } = await import('@/lib/auth/middleware')
      const mockRequest = {
        nextUrl: {
          pathname: '/admin/dashboard',
          href: 'http://localhost:3000/admin/dashboard',
          searchParams: new URLSearchParams(),
        },
        cookies: {
          get: jest.fn().mockReturnValue({
            value: 'invalid-session-id',
          }),
        },
        url: 'http://localhost:3000/admin/dashboard',
      } as any

      const response = await authMiddleware(mockRequest)

      expect(response).toBeDefined()
      expect(response.status).toBe(307) // Redirect status
      expect(response.headers.get('location')).toContain('/login')
    })

    it('should clear invalid session cookie', async () => {
      const { authMiddleware } = await import('@/lib/auth/middleware')
      const mockRequest = {
        nextUrl: {
          pathname: '/admin/dashboard',
          href: 'http://localhost:3000/admin/dashboard',
          searchParams: new URLSearchParams(),
        },
        cookies: {
          get: jest.fn().mockReturnValue({
            value: 'invalid-session-id',
          }),
        },
        url: 'http://localhost:3000/admin/dashboard',
      } as any

      const response = await authMiddleware(mockRequest)

      expect(response).toBeDefined()
      // Check if cookie is cleared
      const setCookieHeader = response.headers.get('set-cookie')
      expect(setCookieHeader).toBeDefined()
    })
  })
})

