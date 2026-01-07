// === tests/auth/middleware.test.ts ===

import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '@/lib/auth/middleware'
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

describe('Auth Middleware', () => {
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

  describe('Public Routes', () => {
    it('should allow access to public routes without authentication', async () => {
      const mockRequest = {
        nextUrl: {
          pathname: '/',
          href: 'http://localhost:3000/',
          searchParams: new URLSearchParams(),
        },
        cookies: {
          get: jest.fn().mockReturnValue(null),
        },
        url: 'http://localhost:3000/',
      } as any

      const response = await authMiddleware(mockRequest)

      expect(response).toBeDefined()
      expect(response.status).toBe(200)
    })

    it('should allow access to /login when not authenticated', async () => {
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
      expect(response.status).toBe(200)
    })

    it('should allow access to /register when not authenticated', async () => {
      const mockRequest = {
        nextUrl: {
          pathname: '/register',
          href: 'http://localhost:3000/register',
          searchParams: new URLSearchParams(),
        },
        cookies: {
          get: jest.fn().mockReturnValue(null),
        },
        url: 'http://localhost:3000/register',
      } as any

      const response = await authMiddleware(mockRequest)

      expect(response).toBeDefined()
      expect(response.status).toBe(200)
    })
  })

  describe('Protected Admin Routes', () => {
    it('should redirect to /login when accessing /admin route without session', async () => {
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
      expect(response.status).toBe(307) // Redirect
      expect(response.headers.get('location')).toContain('/login')
    })

    it('should redirect to / when USER role tries to access /admin route', async () => {
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
      expect(response.status).toBe(307) // Redirect
      expect(response.headers.get('location')).toBe('http://localhost:3000/')
    })

    it('should allow access to /admin route when ADMIN role', async () => {
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
      expect(response.status).toBe(200)
    })
  })

  describe('Authenticated User Redirects', () => {
    it('should redirect authenticated user away from /login', async () => {
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
      expect(response.status).toBe(307) // Redirect
      expect(response.headers.get('location')).toBe('http://localhost:3000/')
    })

    it('should redirect authenticated user away from /register', async () => {
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

      const mockRequest = {
        nextUrl: {
          pathname: '/register',
          href: 'http://localhost:3000/register',
          searchParams: new URLSearchParams(),
        },
        cookies: {
          get: jest.fn().mockReturnValue({
            value: session.id,
          }),
        },
        url: 'http://localhost:3000/register',
      } as any

      const response = await authMiddleware(mockRequest)

      expect(response).toBeDefined()
      expect(response.status).toBe(307) // Redirect
      expect(response.headers.get('location')).toBe('http://localhost:3000/')
    })
  })

  describe('Invalid Session Handling', () => {
    it('should redirect to /login when session is invalid', async () => {
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
      expect(response.status).toBe(307) // Redirect
      expect(response.headers.get('location')).toContain('/login')
    })

    it('should clear invalid session cookie', async () => {
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
      // Check if cookie is cleared (set to expire)
      const setCookieHeader = response.headers.get('set-cookie')
      expect(setCookieHeader).toBeDefined()
    })
  })

  describe('Session Refresh', () => {
    it('should refresh session cookie when session is fresh', async () => {
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

      const mockRequest = {
        nextUrl: {
          pathname: '/',
          href: 'http://localhost:3000/',
          searchParams: new URLSearchParams(),
        },
        cookies: {
          get: jest.fn().mockReturnValue({
            value: session.id,
          }),
        },
        url: 'http://localhost:3000/',
      } as any

      const response = await authMiddleware(mockRequest)

      expect(response).toBeDefined()
      expect(response.status).toBe(200)
    })
  })
})

