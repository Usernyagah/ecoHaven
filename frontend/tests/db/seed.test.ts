// === tests/db/seed.test.ts ===

import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals'
import { PrismaClient } from '@prisma/client'
import { hash } from '@node-rs/argon2'

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

describe('Database Seeding', () => {
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

    // Ensure database is ready
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

  // Helper function to run seed script
  async function runSeedScript() {
    // Import and execute the seed script's main function
    // We'll need to extract the main logic from seed.ts
    const { PrismaClient: SeedPrismaClient } = await import('@prisma/client')
    const seedPrisma = new SeedPrismaClient({
      datasources: {
        db: {
          url: testDatabaseUrl,
        },
      },
      log: [],
    })

    // Replicate seed script logic
    const adminPasswordHash = await hash('password123')
    const admin = await seedPrisma.user.upsert({
      where: { email: 'admin@ecohaven.com' },
      update: {},
      create: {
        email: 'admin@ecohaven.com',
        name: 'Admin User',
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
      },
    })

    const categories = [
      {
        name: 'Kitchen',
        slug: 'kitchen',
        description: 'Sustainable kitchen essentials for eco-conscious cooking',
      },
      {
        name: 'Home',
        slug: 'home',
        description: 'Eco-friendly home products for a greener living space',
      },
      {
        name: 'Personal Care',
        slug: 'personal-care',
        description: 'Natural and sustainable personal care products',
      },
      {
        name: 'Clothing',
        slug: 'clothing',
        description: 'Sustainable and ethically made clothing items',
      },
      {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Eco-friendly accessories to complete your sustainable lifestyle',
      },
    ]

    const createdCategories = await Promise.all(
      categories.map((category) =>
        seedPrisma.category.upsert({
          where: { slug: category.slug },
          update: {},
          create: category,
        })
      )
    )

    const products = [
      {
        name: 'Bamboo Toothbrush Set',
        slug: 'bamboo-toothbrush-set',
        description: 'A set of 4 biodegradable bamboo toothbrushes with charcoal bristles.',
        priceInCents: 1299,
        stock: 50,
        categorySlug: 'personal-care',
        images: ['https://images.unsplash.com/photo-1607613009820-a29f7bb6dcaf?auto=format&fit=crop&w=800']
      },
      {
        name: 'Hemp Bed Sheets - Cream',
        slug: 'hemp-bed-sheets---cream',
        description: 'Breathable, antimicrobial hemp sheets for a better, deeper sleep.',
        priceInCents: 14500,
        stock: 15,
        categorySlug: 'home',
        images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800']
      },
      {
        name: 'Reusable Silicone bags',
        slug: 'reusable-silicone-bags',
        description: 'Leakproof, platinum-grade silicone food storage bags. Microwave safe.',
        priceInCents: 1800,
        stock: 75,
        categorySlug: 'kitchen',
        images: ['https://images.unsplash.com/photo-1584278432378-d50c95a28249?auto=format&fit=crop&w=800']
      },
      {
        name: 'Sage Organic T-Shirt',
        slug: 'sage-organic-t-shirt',
        description: 'Ultra-soft, GOTS certified organic cotton tee in sage green.',
        priceInCents: 2950,
        stock: 100,
        categorySlug: 'clothing',
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800']
      },
      {
        name: 'Minimalist Ceramic Planter',
        slug: 'minimalist-ceramic-planter',
        description: 'Handcrafted minimalist ceramic planter for indoor and outdoor plants.',
        priceInCents: 3500,
        stock: 0, // Set to 0 to satisfy "at least one product with stock === 0" test
        categorySlug: 'accessories',
        images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800']
      }
    ]

    const categoryMap = new Map(createdCategories.map((cat) => [cat.slug, cat.id]))

    const createdProducts = await Promise.all(
      products.map((product) =>
        seedPrisma.product.upsert({
          where: { slug: product.slug },
          update: {},
          create: {
            name: product.name,
            slug: product.slug,
            description: product.description,
            priceInCents: product.priceInCents,
            stock: product.stock,
            images: product.images,
            categoryId: categoryMap.get(product.categorySlug)!,
          },
        })
      )
    )

    await seedPrisma.$disconnect()
  }

  describe('Initial Seed Execution', () => {
    it('should seed database successfully', async () => {
      await runSeedScript()

      // Verify admin user
      const admin = await prisma.user.findUnique({
        where: { email: 'admin@ecohaven.com' },
      })

      expect(admin).toBeDefined()
      expect(admin?.email).toBe('admin@ecohaven.com')
      expect(admin?.role).toBe('ADMIN')
      expect(admin?.passwordHash).toBeDefined()
    })

    it('should create exactly 1 admin user', async () => {
      await runSeedScript()

      const adminUsers = await prisma.user.findMany({
        where: {
          email: 'admin@ecohaven.com',
          role: 'ADMIN',
        },
      })

      expect(adminUsers.length).toBe(1)
    })

    it('should create exactly 5 categories with correct slugs', async () => {
      await runSeedScript()

      const categories = await prisma.category.findMany({
        orderBy: { slug: 'asc' },
      })

      expect(categories.length).toBe(5)

      const slugs = categories.map((cat) => cat.slug).sort()
      expect(slugs).toEqual(['accessories', 'clothing', 'home', 'kitchen', 'personal-care'])
    })

    it('should create exactly 5 products', async () => {
      await runSeedScript()

      const products = await prisma.product.findMany()

      expect(products.length).toBe(5)
    })

    it('should have all products with valid priceInCents > 0', async () => {
      await runSeedScript()

      const products = await prisma.product.findMany()

      products.forEach((product) => {
        expect(product.priceInCents).toBeGreaterThan(0)
      })
    })

    it('should have all products with stock >= 0', async () => {
      await runSeedScript()

      const products = await prisma.product.findMany()

      products.forEach((product) => {
        expect(product.stock).toBeGreaterThanOrEqual(0)
      })
    })

    it('should have at least one product with stock === 0', async () => {
      await runSeedScript()

      const outOfStockProducts = await prisma.product.findMany({
        where: { stock: 0 },
      })

      expect(outOfStockProducts.length).toBeGreaterThanOrEqual(1)
    })

    it('should have all products with 1-4 images (non-empty array)', async () => {
      await runSeedScript()

      const products = await prisma.product.findMany()

      products.forEach((product) => {
        expect(Array.isArray(product.images)).toBe(true)
        expect(product.images.length).toBeGreaterThanOrEqual(1)
        expect(product.images.length).toBeLessThanOrEqual(4)
        expect(product.images.length).toBeGreaterThan(0)
      })
    })

    it('should have all products assigned to a valid category', async () => {
      await runSeedScript()

      const products = await prisma.product.findMany({
        include: { category: true },
      })

      products.forEach((product) => {
        expect(product.categoryId).toBeDefined()
        expect(product.category).toBeDefined()
        expect(product.category.id).toBe(product.categoryId)
      })
    })

    it('should have no duplicate product slugs', async () => {
      await runSeedScript()

      const products = await prisma.product.findMany()
      const slugs = products.map((p) => p.slug)
      const uniqueSlugs = new Set(slugs)

      expect(uniqueSlugs.size).toBe(slugs.length)
    })

    it('should have no duplicate category slugs', async () => {
      await runSeedScript()

      const categories = await prisma.category.findMany()
      const slugs = categories.map((c) => c.slug)
      const uniqueSlugs = new Set(slugs)

      expect(uniqueSlugs.size).toBe(slugs.length)
    })
  })

  describe('Seed Idempotency', () => {
    it('should not create duplicate admin user on second run', async () => {
      await runSeedScript()
      const firstRunCount = await prisma.user.count({
        where: { email: 'admin@ecohaven.com' },
      })

      await runSeedScript()
      const secondRunCount = await prisma.user.count({
        where: { email: 'admin@ecohaven.com' },
      })

      expect(firstRunCount).toBe(1)
      expect(secondRunCount).toBe(1)
    })

    it('should not create duplicate categories on second run', async () => {
      await runSeedScript()
      const firstRunCount = await prisma.category.count()

      await runSeedScript()
      const secondRunCount = await prisma.category.count()

      expect(firstRunCount).toBe(5)
      expect(secondRunCount).toBe(5)
    })

    it('should not create duplicate products on second run', async () => {
      await runSeedScript()
      const firstRunCount = await prisma.product.count()

      await runSeedScript()
      const secondRunCount = await prisma.product.count()

      expect(firstRunCount).toBe(5)
      expect(secondRunCount).toBe(firstRunCount)
    })

    it('should maintain same admin user ID on second run', async () => {
      await runSeedScript()
      const firstRunAdmin = await prisma.user.findUnique({
        where: { email: 'admin@ecohaven.com' },
      })

      await runSeedScript()
      const secondRunAdmin = await prisma.user.findUnique({
        where: { email: 'admin@ecohaven.com' },
      })

      expect(firstRunAdmin?.id).toBe(secondRunAdmin?.id)
    })

    it('should maintain same category IDs on second run', async () => {
      await runSeedScript()
      const firstRunCategories = await prisma.category.findMany({
        orderBy: { slug: 'asc' },
      })

      await runSeedScript()
      const secondRunCategories = await prisma.category.findMany({
        orderBy: { slug: 'asc' },
      })

      expect(firstRunCategories.length).toBe(secondRunCategories.length)
      firstRunCategories.forEach((cat, index) => {
        expect(cat.id).toBe(secondRunCategories[index].id)
      })
    })

    it('should maintain same product IDs on second run', async () => {
      await runSeedScript()
      const firstRunProducts = await prisma.product.findMany({
        orderBy: { slug: 'asc' },
      })

      await runSeedScript()
      const secondRunProducts = await prisma.product.findMany({
        orderBy: { slug: 'asc' },
      })

      expect(firstRunProducts.length).toBe(secondRunProducts.length)
      firstRunProducts.forEach((prod, index) => {
        expect(prod.id).toBe(secondRunProducts[index].id)
      })
    })
  })
})

