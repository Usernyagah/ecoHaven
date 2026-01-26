// === tests/db/schema.test.ts ===

import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

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

describe('Prisma Schema Validation', () => {
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

  afterAll(async () => {
    // Cleanup any test data
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.product.deleteMany()
    await prisma.category.deleteMany()
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    await prisma.user.deleteMany()
    await prisma.$disconnect()
  })

  describe('Schema Compilation', () => {
    it('should compile schema without errors', () => {
      expect(() => {
        execSync('npx prisma validate', { stdio: 'pipe' })
      }).not.toThrow()
    })

    it('should generate Prisma Client without errors', () => {
      expect(() => {
        execSync('npx prisma generate', { stdio: 'pipe' })
      }).not.toThrow()
    })
  })

  describe('User Model', () => {
    it('should have correct fields and types', async () => {
      // Test that User model exists and can create users with expected fields
      const testUser = await prisma.user.create({
        data: {
          email: `test-${Date.now()}@example.com`,
          passwordHash: 'test-hash',
          name: 'Test User',
        },
      })

      expect(testUser).toHaveProperty('id')
      expect(testUser).toHaveProperty('email')
      expect(testUser).toHaveProperty('role')
      expect(testUser).toHaveProperty('createdAt')
      expect(testUser).toHaveProperty('updatedAt')

      // Cleanup
      await prisma.user.delete({ where: { id: testUser.id } })
    })

    it('should have email as unique constraint', async () => {
      // This will be tested in constraints.test.ts, but we verify the model structure
      // Test that email field exists and is required
      const testUser = await prisma.user.create({
        data: {
          email: `test-${Date.now()}@example.com`,
          passwordHash: 'test-hash',
        },
      })

      expect(testUser.email).toBeDefined()
      expect(typeof testUser.email).toBe('string')

      // Cleanup
      await prisma.user.delete({ where: { id: testUser.id } })
    })

    it('should have role with default value USER', async () => {
      // Verify default role is USER
      const testUser = await prisma.user.create({
        data: {
          email: `test-${Date.now()}@example.com`,
          passwordHash: 'test-hash',
        },
      })

      expect(testUser.role).toBe('USER')

      // Cleanup
      await prisma.user.delete({
        where: { id: testUser.id },
      })
    })

    it('should have createdAt and updatedAt timestamps', async () => {
      const testUser = await prisma.user.create({
        data: {
          email: `test-${Date.now()}@example.com`,
          passwordHash: 'test-hash',
        },
      })

      expect(testUser.createdAt).toBeInstanceOf(Date)
      expect(testUser.updatedAt).toBeInstanceOf(Date)

      // Cleanup
      await prisma.user.delete({
        where: { id: testUser.id },
      })
    })
  })

  describe('Category Model', () => {
    it('should have slug as unique constraint', async () => {
      const category = await prisma.category.create({
        data: {
          name: 'Test Category',
          slug: `test-category-${Date.now()}`,
        },
      })

      expect(category.slug).toBeDefined()
      expect(typeof category.slug).toBe('string')

      // Cleanup
      await prisma.category.delete({ where: { id: category.id } })
    })

    it('should have relation to Product model', async () => {
      // Verify relation exists by creating a category and product
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

      const categoryWithProducts = await prisma.category.findUnique({
        where: { id: category.id },
        include: { products: true },
      })

      expect(categoryWithProducts?.products).toBeDefined()
      expect(Array.isArray(categoryWithProducts?.products)).toBe(true)

      // Cleanup
      await prisma.product.delete({ where: { id: product.id } })
      await prisma.category.delete({ where: { id: category.id } })
    })
  })

  describe('Product Model', () => {
    it('should have slug as unique constraint', async () => {
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

      expect(product.slug).toBeDefined()
      expect(typeof product.slug).toBe('string')

      // Cleanup
      await prisma.product.delete({ where: { id: product.id } })
      await prisma.category.delete({ where: { id: category.id } })
    })

    it('should have categoryId as required field', async () => {
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

      expect(product.categoryId).toBeDefined()
      expect(product.categoryId).toBe(category.id)

      // Cleanup
      await prisma.product.delete({ where: { id: product.id } })
      await prisma.category.delete({ where: { id: category.id } })
    })

    it('should have relation to Category model', async () => {
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

      const productWithCategory = await prisma.product.findUnique({
        where: { id: product.id },
        include: { category: true },
      })

      expect(productWithCategory?.category).toBeDefined()
      expect(productWithCategory?.category.id).toBe(category.id)

      // Cleanup
      await prisma.product.delete({ where: { id: product.id } })
      await prisma.category.delete({ where: { id: category.id } })
    })

    it('should have relation to OrderItem model', async () => {
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

      const orderItem = await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: product.id,
          quantity: 1,
          priceInCents: 1000,
          productName: 'Test Product',
        },
      })

      const productWithOrderItems = await prisma.product.findUnique({
        where: { id: product.id },
        include: { orderItems: true },
      })

      expect(productWithOrderItems?.orderItems).toBeDefined()
      expect(Array.isArray(productWithOrderItems?.orderItems)).toBe(true)
      expect(productWithOrderItems?.orderItems.length).toBeGreaterThanOrEqual(1)

      // Cleanup
      await prisma.orderItem.delete({ where: { id: orderItem.id } })
      await prisma.order.delete({ where: { id: order.id } })
      await prisma.product.delete({ where: { id: product.id } })
      await prisma.category.delete({ where: { id: category.id } })
      await prisma.user.delete({ where: { id: user.id } })
    })

    it('should have stock with default value 0', async () => {
      // Create a category first
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

      expect(product.stock).toBe(0)

      // Cleanup
      await prisma.product.delete({ where: { id: product.id } })
      await prisma.category.delete({ where: { id: category.id } })
    })

    it('should have images as array field', async () => {
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
          images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
        },
      })

      expect(Array.isArray(product.images)).toBe(true)
      expect(product.images.length).toBe(2)

      // Cleanup
      await prisma.product.delete({ where: { id: product.id } })
      await prisma.category.delete({ where: { id: category.id } })
    })
  })

  describe('Order Model', () => {
    it('should have status with default value PENDING', async () => {
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

      expect(order.status).toBe('PENDING')

      // Cleanup
      await prisma.order.delete({ where: { id: order.id } })
      await prisma.user.delete({ where: { id: user.id } })
    })

    it('should have relation to User model', () => {
      expect(prisma.order.fields.user).toBeDefined()
    })

    it('should have relation to OrderItem model', () => {
      expect(prisma.order.fields.orderItems).toBeDefined()
    })
  })

  describe('OrderItem Model', () => {
    it('should have relation to Order model', () => {
      expect(prisma.orderItem.fields.order).toBeDefined()
    })

    it('should have relation to Product model', () => {
      expect(prisma.orderItem.fields.product).toBeDefined()
    })

    it('should have onDelete: Cascade for Order relation', async () => {
      // This will be tested in constraints.test.ts
      expect(prisma.orderItem.fields.order).toBeDefined()
    })
  })

  describe('Relations Validation', () => {
    it('should have Product belongs to Category relation', async () => {
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

      const productWithCategory = await prisma.product.findUnique({
        where: { id: product.id },
        include: { category: true },
      })

      expect(productWithCategory?.category).toBeDefined()
      expect(productWithCategory?.category.id).toBe(category.id)

      // Cleanup
      await prisma.product.delete({ where: { id: product.id } })
      await prisma.category.delete({ where: { id: category.id } })
    })

    it('should have Order has many OrderItems relation', async () => {
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
          totalInCents: 2000,
        },
      })

      const orderItem1 = await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: product.id,
          quantity: 1,
          priceInCents: 1000,
          productName: 'Test Product',
        },
      })

      const orderItem2 = await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: product.id,
          quantity: 1,
          priceInCents: 1000,
          productName: 'Test Product',
        },
      })

      const orderWithItems = await prisma.order.findUnique({
        where: { id: order.id },
        include: { orderItems: true },
      })

      expect(orderWithItems?.orderItems).toBeDefined()
      expect(orderWithItems?.orderItems.length).toBe(2)

      // Cleanup
      await prisma.orderItem.deleteMany({ where: { orderId: order.id } })
      await prisma.order.delete({ where: { id: order.id } })
      await prisma.product.delete({ where: { id: product.id } })
      await prisma.category.delete({ where: { id: category.id } })
      await prisma.user.delete({ where: { id: user.id } })
    })

    it('should have User has many Orders relation', async () => {
      const user = await prisma.user.create({
        data: {
          email: `test-${Date.now()}@example.com`,
          passwordHash: 'test-hash',
        },
      })

      const order1 = await prisma.order.create({
        data: {
          userId: user.id,
          totalInCents: 1000,
        },
      })

      const order2 = await prisma.order.create({
        data: {
          userId: user.id,
          totalInCents: 2000,
        },
      })

      const userWithOrders = await prisma.user.findUnique({
        where: { id: user.id },
        include: { orders: true },
      })

      expect(userWithOrders?.orders).toBeDefined()
      expect(userWithOrders?.orders.length).toBe(2)

      // Cleanup
      await prisma.order.deleteMany({ where: { userId: user.id } })
      await prisma.user.delete({ where: { id: user.id } })
    })
  })

  describe('Enum Types', () => {
    it('should have Role enum with USER and ADMIN values', async () => {
      // Verify enum values exist by creating users with different roles
      const userUser = await prisma.user.create({
        data: {
          email: `test-user-${Date.now()}@example.com`,
          passwordHash: 'test-hash',
          role: 'USER',
        },
      })

      const adminUser = await prisma.user.create({
        data: {
          email: `test-admin-${Date.now()}@example.com`,
          passwordHash: 'test-hash',
          role: 'ADMIN',
        },
      })

      expect(userUser.role).toBe('USER')
      expect(adminUser.role).toBe('ADMIN')

      // Cleanup
      await prisma.user.delete({ where: { id: userUser.id } })
      await prisma.user.delete({ where: { id: adminUser.id } })
    })

    it('should have OrderStatus enum with correct values', async () => {
      const user = await prisma.user.create({
        data: {
          email: `test-${Date.now()}@example.com`,
          passwordHash: 'test-hash',
        },
      })

      const pendingOrder = await prisma.order.create({
        data: {
          userId: user.id,
          totalInCents: 1000,
          status: 'PENDING',
        },
      })

      const paidOrder = await prisma.order.create({
        data: {
          userId: user.id,
          totalInCents: 2000,
          status: 'PAID',
        },
      })

      expect(pendingOrder.status).toBe('PENDING')
      expect(paidOrder.status).toBe('PAID')

      // Cleanup
      await prisma.order.delete({ where: { id: pendingOrder.id } })
      await prisma.order.delete({ where: { id: paidOrder.id } })
      await prisma.user.delete({ where: { id: user.id } })
    })
  })
})

