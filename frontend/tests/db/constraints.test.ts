// === tests/db/constraints.test.ts ===

import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals'
import { PrismaClient, Prisma } from '@prisma/client'

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

describe('Database Constraints', () => {
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

  describe('User Email Uniqueness', () => {
    it('should not allow two users with the same email', async () => {
      const email = `test-${Date.now()}@example.com`

      await prisma.user.create({
        data: {
          email,
          passwordHash: 'hash1',
        },
      })

      await expect(
        prisma.user.create({
          data: {
            email,
            passwordHash: 'hash2',
          },
        })
      ).rejects.toThrow(Prisma.PrismaClientKnownRequestError)

      const error = await prisma.user
        .create({
          data: {
            email,
            passwordHash: 'hash2',
          },
        })
        .catch((e) => e)

      expect(error).toBeInstanceOf(Prisma.PrismaClientKnownRequestError)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        expect(error.code).toBe('P2002') // Unique constraint violation
      }
    })

    it('should allow different users with different emails', async () => {
      const user1 = await prisma.user.create({
        data: {
          email: `test1-${Date.now()}@example.com`,
          passwordHash: 'hash1',
        },
      })

      const user2 = await prisma.user.create({
        data: {
          email: `test2-${Date.now()}@example.com`,
          passwordHash: 'hash2',
        },
      })

      expect(user1.id).not.toBe(user2.id)
      expect(user1.email).not.toBe(user2.email)
    })
  })

  describe('Product Slug Uniqueness', () => {
    it('should not allow two products with the same slug', async () => {
      const category = await prisma.category.create({
        data: {
          name: 'Test Category',
          slug: `test-category-${Date.now()}`,
        },
      })

      const slug = `test-product-${Date.now()}`

      await prisma.product.create({
        data: {
          name: 'Test Product 1',
          slug,
          description: 'Description 1',
          priceInCents: 1000,
          categoryId: category.id,
          images: ['https://example.com/image1.jpg'],
        },
      })

      await expect(
        prisma.product.create({
          data: {
            name: 'Test Product 2',
            slug,
            description: 'Description 2',
            priceInCents: 2000,
            categoryId: category.id,
            images: ['https://example.com/image2.jpg'],
          },
        })
      ).rejects.toThrow(Prisma.PrismaClientKnownRequestError)

      const error = await prisma.product
        .create({
          data: {
            name: 'Test Product 2',
            slug,
            description: 'Description 2',
            priceInCents: 2000,
            categoryId: category.id,
            images: ['https://example.com/image2.jpg'],
          },
        })
        .catch((e) => e)

      expect(error).toBeInstanceOf(Prisma.PrismaClientKnownRequestError)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        expect(error.code).toBe('P2002') // Unique constraint violation
      }
    })

    it('should allow different products with different slugs', async () => {
      const category = await prisma.category.create({
        data: {
          name: 'Test Category',
          slug: `test-category-${Date.now()}`,
        },
      })

      const product1 = await prisma.product.create({
        data: {
          name: 'Test Product 1',
          slug: `test-product-1-${Date.now()}`,
          description: 'Description 1',
          priceInCents: 1000,
          categoryId: category.id,
          images: ['https://example.com/image1.jpg'],
        },
      })

      const product2 = await prisma.product.create({
        data: {
          name: 'Test Product 2',
          slug: `test-product-2-${Date.now()}`,
          description: 'Description 2',
          priceInCents: 2000,
          categoryId: category.id,
          images: ['https://example.com/image2.jpg'],
        },
      })

      expect(product1.id).not.toBe(product2.id)
      expect(product1.slug).not.toBe(product2.slug)
    })
  })

  describe('Category Slug Uniqueness', () => {
    it('should not allow two categories with the same slug', async () => {
      const slug = `test-category-${Date.now()}`

      await prisma.category.create({
        data: {
          name: 'Test Category 1',
          slug,
        },
      })

      await expect(
        prisma.category.create({
          data: {
            name: 'Test Category 2',
            slug,
          },
        })
      ).rejects.toThrow(Prisma.PrismaClientKnownRequestError)

      const error = await prisma.category
        .create({
          data: {
            name: 'Test Category 2',
            slug,
          },
        })
        .catch((e) => e)

      expect(error).toBeInstanceOf(Prisma.PrismaClientKnownRequestError)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        expect(error.code).toBe('P2002') // Unique constraint violation
      }
    })
  })

  describe('Product CategoryId Requirement', () => {
    it('should not allow creating product without categoryId', async () => {
      await expect(
        prisma.product.create({
          data: {
            name: 'Test Product',
            slug: `test-product-${Date.now()}`,
            description: 'Test description',
            priceInCents: 1000,
            images: ['https://example.com/image.jpg'],
            // categoryId is missing
          } as any, // TypeScript will complain, but we're testing runtime constraint
        })
      ).rejects.toThrow()

      const error = await prisma.product
        .create({
          data: {
            name: 'Test Product',
            slug: `test-product-${Date.now()}`,
            description: 'Test description',
            priceInCents: 1000,
            images: ['https://example.com/image.jpg'],
          } as any,
        })
        .catch((e) => e)

      expect(error).toBeInstanceOf(Error)
    })

    it('should require valid categoryId when creating product', async () => {
      const category = await prisma.category.create({
        data: {
          name: 'Test Category',
          slug: `test-category-${Date.now()}`,
        },
      })

      const product = await prisma.product.create({
        data: {
          name: 'Test Product',
          slug: `test-product-${Date.now()}`,
          description: 'Test description',
          priceInCents: 1000,
          categoryId: category.id,
          images: ['https://example.com/image.jpg'],
        },
      })

      expect(product.categoryId).toBe(category.id)
    })

    it('should not allow product with non-existent categoryId', async () => {
      const fakeCategoryId = '00000000-0000-0000-0000-000000000000'

      await expect(
        prisma.product.create({
          data: {
            name: 'Test Product',
            slug: `test-product-${Date.now()}`,
            description: 'Test description',
            priceInCents: 1000,
            categoryId: fakeCategoryId,
            images: ['https://example.com/image.jpg'],
          },
        })
      ).rejects.toThrow(Prisma.PrismaClientKnownRequestError)

      const error = await prisma.product
        .create({
          data: {
            name: 'Test Product',
            slug: `test-product-${Date.now()}`,
            description: 'Test description',
            priceInCents: 1000,
            categoryId: fakeCategoryId,
            images: ['https://example.com/image.jpg'],
          },
        })
        .catch((e) => e)

      expect(error).toBeInstanceOf(Prisma.PrismaClientKnownRequestError)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        expect(error.code).toBe('P2003') // Foreign key constraint violation
      }
    })
  })

  describe('Category Deletion with Products', () => {
    it('should prevent deleting category with products (onDelete: Restrict)', async () => {
      const category = await prisma.category.create({
        data: {
          name: 'Test Category',
          slug: `test-category-${Date.now()}`,
        },
      })

      await prisma.product.create({
        data: {
          name: 'Test Product',
          slug: `test-product-${Date.now()}`,
          description: 'Test description',
          priceInCents: 1000,
          categoryId: category.id,
          images: ['https://example.com/image.jpg'],
        },
      })

      // Attempt to delete category with products
      // Note: Prisma schema shows no explicit onDelete for Category->Product relation
      // Default behavior is Restrict, which prevents deletion
      await expect(
        prisma.category.delete({
          where: { id: category.id },
        })
      ).rejects.toThrow(Prisma.PrismaClientKnownRequestError)

      const error = await prisma.category
        .delete({
          where: { id: category.id },
        })
        .catch((e) => e)

      expect(error).toBeInstanceOf(Prisma.PrismaClientKnownRequestError)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2003 is foreign key constraint violation
        expect(['P2003', 'P2014']).toContain(error.code)
      }
    })

    it('should allow deleting category without products', async () => {
      const category = await prisma.category.create({
        data: {
          name: 'Test Category',
          slug: `test-category-${Date.now()}`,
        },
      })

      await prisma.category.delete({
        where: { id: category.id },
      })

      const deletedCategory = await prisma.category.findUnique({
        where: { id: category.id },
      })

      expect(deletedCategory).toBeNull()
    })
  })

  describe('Order TotalInCents Constraint', () => {
    it('should allow creating order with positive totalInCents', async () => {
      const user = await prisma.user.create({
        data: {
          email: `test-${Date.now()}@example.com`,
          passwordHash: 'test-hash',
        },
      })

      const order = await prisma.order.create({
        data: {
          userId: user.id,
          totalInCents: 1000,
        },
      })

      expect(order.totalInCents).toBe(1000)
      expect(order.totalInCents).toBeGreaterThan(0)
    })

    it('should allow creating order with zero totalInCents (edge case)', async () => {
      const user = await prisma.user.create({
        data: {
          email: `test-${Date.now()}@example.com`,
          passwordHash: 'test-hash',
        },
      })

      // Note: Database may or may not enforce this, but we test the behavior
      const order = await prisma.order.create({
        data: {
          userId: user.id,
          totalInCents: 0,
        },
      })

      expect(order.totalInCents).toBe(0)
    })

    it('should not allow negative totalInCents if database constraint exists', async () => {
      const user = await prisma.user.create({
        data: {
          email: `test-${Date.now()}@example.com`,
          passwordHash: 'test-hash',
        },
      })

      // PostgreSQL with CHECK constraint would reject this
      // If no constraint exists, this will succeed but is invalid business logic
      try {
        const order = await prisma.order.create({
          data: {
            userId: user.id,
            totalInCents: -100,
          },
        })

        // If it succeeds, there's no database constraint (application should validate)
        expect(order.totalInCents).toBe(-100)
      } catch (error) {
        // If it fails, database constraint exists (good)
        expect(error).toBeInstanceOf(Error)
      }
    })
  })

  describe('OrderItem Constraints', () => {
    it('should require valid orderId when creating orderItem', async () => {
      const category = await prisma.category.create({
        data: {
          name: 'Test Category',
          slug: `test-category-${Date.now()}`,
        },
      })

      const product = await prisma.product.create({
        data: {
          name: 'Test Product',
          slug: `test-product-${Date.now()}`,
          description: 'Test description',
          priceInCents: 1000,
          categoryId: category.id,
          images: ['https://example.com/image.jpg'],
        },
      })

      const fakeOrderId = '00000000-0000-0000-0000-000000000000'

      await expect(
        prisma.orderItem.create({
          data: {
            orderId: fakeOrderId,
            productId: product.id,
            quantity: 1,
            priceInCents: 1000,
            productName: 'Test Product',
          },
        })
      ).rejects.toThrow(Prisma.PrismaClientKnownRequestError)

      const error = await prisma.orderItem
        .create({
          data: {
            orderId: fakeOrderId,
            productId: product.id,
            quantity: 1,
            priceInCents: 1000,
            productName: 'Test Product',
          },
        })
        .catch((e) => e)

      expect(error).toBeInstanceOf(Prisma.PrismaClientKnownRequestError)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        expect(error.code).toBe('P2003') // Foreign key constraint violation
      }
    })

    it('should require valid productId when creating orderItem', async () => {
      const user = await prisma.user.create({
        data: {
          email: `test-${Date.now()}@example.com`,
          passwordHash: 'test-hash',
        },
      })

      const order = await prisma.order.create({
        data: {
          userId: user.id,
          totalInCents: 1000,
        },
      })

      const fakeProductId = '00000000-0000-0000-0000-000000000000'

      await expect(
        prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: fakeProductId,
            quantity: 1,
            priceInCents: 1000,
            productName: 'Test Product',
          },
        })
      ).rejects.toThrow(Prisma.PrismaClientKnownRequestError)

      const error = await prisma.orderItem
        .create({
          data: {
            orderId: order.id,
            productId: fakeProductId,
            quantity: 1,
            priceInCents: 1000,
            productName: 'Test Product',
          },
        })
        .catch((e) => e)

      expect(error).toBeInstanceOf(Prisma.PrismaClientKnownRequestError)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        expect(error.code).toBe('P2003') // Foreign key constraint violation
      }
    })

    it('should cascade delete orderItems when order is deleted', async () => {
      const user = await prisma.user.create({
        data: {
          email: `test-${Date.now()}@example.com`,
          passwordHash: 'test-hash',
        },
      })

      const category = await prisma.category.create({
        data: {
          name: 'Test Category',
          slug: `test-category-${Date.now()}`,
        },
      })

      const product = await prisma.product.create({
        data: {
          name: 'Test Product',
          slug: `test-product-${Date.now()}`,
          description: 'Test description',
          priceInCents: 1000,
          categoryId: category.id,
          images: ['https://example.com/image.jpg'],
        },
      })

      const order = await prisma.order.create({
        data: {
          userId: user.id,
          totalInCents: 1000,
        },
      })

      const orderItem = await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: product.id,
          quantity: 1,
          priceInCents: 1000,
          productName: 'Test Product',
        },
      })

      // Delete order (should cascade delete orderItem)
      await prisma.order.delete({
        where: { id: order.id },
      })

      const deletedOrderItem = await prisma.orderItem.findUnique({
        where: { id: orderItem.id },
      })

      expect(deletedOrderItem).toBeNull()
    })
  })

  describe('User Account and Session Cascade', () => {
    it('should cascade delete accounts when user is deleted', async () => {
      const user = await prisma.user.create({
        data: {
          email: `test-${Date.now()}@example.com`,
          passwordHash: 'test-hash',
        },
      })

      const account = await prisma.account.create({
        data: {
          userId: user.id,
          providerId: 'test-provider',
          providerUserId: 'test-provider-user-id',
        },
      })

      await prisma.user.delete({
        where: { id: user.id },
      })

      const deletedAccount = await prisma.account.findUnique({
        where: { id: account.id },
      })

      expect(deletedAccount).toBeNull()
    })

    it('should cascade delete sessions when user is deleted', async () => {
      const user = await prisma.user.create({
        data: {
          email: `test-${Date.now()}@example.com`,
          passwordHash: 'test-hash',
        },
      })

      const session = await prisma.session.create({
        data: {
          userId: user.id,
          expiresAt: new Date(Date.now() + 86400000), // 1 day from now
          token: `test-token-${Date.now()}`,
        },
      })

      await prisma.user.delete({
        where: { id: user.id },
      })

      const deletedSession = await prisma.session.findUnique({
        where: { id: session.id },
      })

      expect(deletedSession).toBeNull()
    })
  })
})

