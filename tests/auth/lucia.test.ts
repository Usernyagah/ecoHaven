// === tests/auth/lucia.test.ts ===

import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals'
import { PrismaClient } from '@prisma/client'
import { hashPassword, verifyPassword, lucia } from '@/lib/auth/lucia'

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

describe('Lucia Authentication', () => {
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

  describe('Password Hashing', () => {
    it('should hash a password successfully', async () => {
      const password = 'testPassword123'
      const hashedPassword = await hashPassword(password)

      expect(hashedPassword).toBeDefined()
      expect(hashedPassword).not.toBe(password)
      expect(hashedPassword.length).toBeGreaterThan(0)
    })

    it('should verify a correct password', async () => {
      const password = 'testPassword123'
      const hashedPassword = await hashPassword(password)

      const isValid = await verifyPassword(hashedPassword, password)
      expect(isValid).toBe(true)
    })

    it('should reject an incorrect password', async () => {
      const password = 'testPassword123'
      const wrongPassword = 'wrongPassword456'
      const hashedPassword = await hashPassword(password)

      const isValid = await verifyPassword(hashedPassword, wrongPassword)
      expect(isValid).toBe(false)
    })

    it('should hash same password differently each time (salt)', async () => {
      const password = 'testPassword123'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)

      expect(hash1).not.toBe(hash2)

      // But both should verify correctly
      const isValid1 = await verifyPassword(hash1, password)
      const isValid2 = await verifyPassword(hash2, password)

      expect(isValid1).toBe(true)
      expect(isValid2).toBe(true)
    })
  })

  describe('User Registration', () => {
    it('should create a user with hashed password', async () => {
      const email = 'test@example.com'
      const password = 'testPassword123'
      const name = 'Test User'

      const passwordHash = await hashPassword(password)

      const user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
          role: 'USER',
        },
      })

      expect(user).toBeDefined()
      expect(user.email).toBe(email)
      expect(user.name).toBe(name)
      expect(user.passwordHash).not.toBe(password)
      expect(user.role).toBe('USER')
    })

    it('should fail to create duplicate email', async () => {
      const email = 'test@example.com'
      const password = 'testPassword123'
      const passwordHash = await hashPassword(password)

      await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: 'USER',
        },
      })

      await expect(
        prisma.user.create({
          data: {
            email,
            passwordHash,
            role: 'USER',
          },
        }),
      ).rejects.toThrow()
    })

    it('should create user with default USER role', async () => {
      const email = 'test@example.com'
      const passwordHash = await hashPassword('password123')

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
        },
      })

      expect(user.role).toBe('USER')
    })
  })

  describe('Session Management', () => {
    it('should create a session after login', async () => {
      const email = 'test@example.com'
      const password = 'testPassword123'
      const passwordHash = await hashPassword(password)

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: 'USER',
        },
      })

      // Verify password
      const isValid = await verifyPassword(passwordHash, password)
      expect(isValid).toBe(true)

      // Create session
      const session = await lucia.createSession(user.id, {})

      expect(session).toBeDefined()
      expect(session.userId).toBe(user.id)

      // Verify session exists in database
      const dbSession = await prisma.session.findUnique({
        where: { id: session.id },
      })

      expect(dbSession).toBeDefined()
      expect(dbSession?.userId).toBe(user.id)
    })

    it('should validate a valid session', async () => {
      const email = 'test@example.com'
      const passwordHash = await hashPassword('password123')

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: 'USER',
        },
      })

      const session = await lucia.createSession(user.id, {})
      const result = await lucia.validateSession(session.id)

      expect(result.session).toBeDefined()
      expect(result.user).toBeDefined()
      expect(result.user?.id).toBe(user.id)
      expect(result.user?.email).toBe(email)
    })

    it('should invalidate a session on logout', async () => {
      const email = 'test@example.com'
      const passwordHash = await hashPassword('password123')

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: 'USER',
        },
      })

      const session = await lucia.createSession(user.id, {})

      // Invalidate session
      await lucia.invalidateSession(session.id)

      // Try to validate the invalidated session
      const result = await lucia.validateSession(session.id)

      expect(result.session).toBeNull()
      expect(result.user).toBeNull()
    })

    it('should validate session and return user attributes', async () => {
      const email = 'test@example.com'
      const name = 'Test User'
      const passwordHash = await hashPassword('password123')

      const user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
          role: 'ADMIN',
        },
      })

      const session = await lucia.createSession(user.id, {})
      const result = await lucia.validateSession(session.id)

      expect(result.user).toBeDefined()
      expect(result.user?.id).toBe(user.id)
      expect(result.user?.email).toBe(email)
      expect(result.user?.name).toBe(name)
      expect(result.user?.role).toBe('ADMIN')
    })
  })

  describe('Login Flow', () => {
    it('should login with correct credentials', async () => {
      const email = 'test@example.com'
      const password = 'testPassword123'
      const passwordHash = await hashPassword(password)

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: 'USER',
        },
      })

      // Verify password
      const isValid = await verifyPassword(user.passwordHash!, password)
      expect(isValid).toBe(true)

      // Create session
      const session = await lucia.createSession(user.id, {})
      expect(session).toBeDefined()
    })

    it('should fail login with incorrect password', async () => {
      const email = 'test@example.com'
      const correctPassword = 'correctPassword123'
      const wrongPassword = 'wrongPassword456'
      const passwordHash = await hashPassword(correctPassword)

      await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: 'USER',
        },
      })

      const user = await prisma.user.findUnique({
        where: { email },
      })

      const isValid = await verifyPassword(user!.passwordHash!, wrongPassword)
      expect(isValid).toBe(false)
    })

    it('should fail login with non-existent email', async () => {
      const email = 'nonexistent@example.com'

      const user = await prisma.user.findUnique({
        where: { email },
      })

      expect(user).toBeNull()
    })
  })
})

