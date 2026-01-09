// === tests/auth/lucia.test.ts ===

import { db } from '@/lib/db'
import { hashPassword, verifyPassword, lucia } from '@/lib/auth/lucia'
import { PrismaClient } from '@prisma/client'

describe('Lucia Auth & DB Integration', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
  }

  beforeEach(async () => {
    // Clean up database
    await db.session.deleteMany()
    await db.user.deleteMany()
  })

  afterAll(async () => {
    await db.$disconnect()
  })

  describe('Password Hashing', () => {
    it('should hash password correctly', async () => {
      const hash = await hashPassword(testUser.password)
      expect(hash).toBeDefined()
      expect(hash).not.toBe(testUser.password)
    })

    it('should verify correct password', async () => {
      const hash = await hashPassword(testUser.password)
      const isValid = await verifyPassword(hash, testUser.password)
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const hash = await hashPassword(testUser.password)
      const isValid = await verifyPassword(hash, 'wrongpassword')
      expect(isValid).toBe(false)
    })
  })

  describe('User Registration (DB Integration)', () => {
    it('should create user with hashed password', async () => {
      const hash = await hashPassword(testUser.password)
      const user = await db.user.create({
        data: {
          email: testUser.email,
          passwordHash: hash,
          name: testUser.name,
          role: 'USER',
        },
      })

      expect(user).toBeDefined()
      expect(user.email).toBe(testUser.email)
      expect(user.passwordHash).not.toBe(testUser.password)
    })

    it('should fail to create user with duplicate email', async () => {
      const hash = await hashPassword(testUser.password)
      await db.user.create({
        data: {
          email: testUser.email,
          passwordHash: hash,
          role: 'USER',
        },
      })

      await expect(
        db.user.create({
          data: {
            email: testUser.email,
            passwordHash: hash,
            role: 'USER',
          },
        })
      ).rejects.toThrow()
    })
  })

  describe('Session Management', () => {
    it('should create session for user', async () => {
      const hash = await hashPassword(testUser.password)
      const user = await db.user.create({
        data: {
          email: testUser.email,
          passwordHash: hash,
          role: 'USER',
        },
      })

      const session = await lucia.createSession(user.id, {})
      expect(session).toBeDefined()
      expect(session.userId).toBe(user.id)

      const dbSession = await db.session.findFirst({
        where: { userId: user.id },
      })
      expect(dbSession).toBeDefined()
    })

    it('should invalidate session on logout', async () => {
      const hash = await hashPassword(testUser.password)
      const user = await db.user.create({
        data: {
          email: testUser.email,
          passwordHash: hash,
          role: 'USER',
        },
      })

      const session = await lucia.createSession(user.id, {})
      await lucia.invalidateSession(session.id)

      const dbSession = await db.session.findUnique({
        where: { id: session.id },
      })
      expect(dbSession).toBeNull()
    })
  })
})
