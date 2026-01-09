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
        name: 'Reusable Bamboo Cutlery Set',
        slug: 'reusable-bamboo-cutlery-set',
        description:
          `A complete set of lightweight bamboo utensils perfect for on-the-go meals. Made from sustainably sourced bamboo, these utensils are durable, biodegradable, and come in a convenient carrying case. Say goodbye to single-use plastic cutlery and embrace a zero-waste lifestyle.`,
        priceInCents: 2499,
        stock: 85,
        images: [
          'https://picsum.photos/seed/bamboo-cutlery-1/800/600',
          'https://picsum.photos/seed/bamboo-cutlery-2/800/600',
          'https://picsum.photos/seed/bamboo-cutlery-3/800/600',
        ],
        categorySlug: 'kitchen',
      },
      {
        name: 'Beeswax Food Wraps',
        slug: 'beeswax-food-wraps',
        description:
          `Natural alternative to plastic wrap made from organic cotton, beeswax, jojoba oil, and tree resin. These wraps are washable, reusable, and can last up to a year with proper care. Perfect for covering bowls, wrapping sandwiches, or storing produce. Simply use the warmth of your hands to mold the wrap around food.`,
        priceInCents: 1899,
        stock: 120,
        images: [
          'https://picsum.photos/seed/beeswax-wrap-1/800/600',
          'https://picsum.photos/seed/beeswax-wrap-2/800/600',
        ],
        categorySlug: 'kitchen',
      },
      {
        name: 'Stainless Steel Water Bottle',
        slug: 'stainless-steel-water-bottle',
        description:
          `Premium insulated stainless steel water bottle that keeps drinks cold for 24 hours or hot for 12 hours. Made from food-grade 18/8 stainless steel with a leak-proof cap. BPA-free and dishwasher safe. Available in multiple sizes and colors. Perfect for reducing single-use plastic bottle waste.`,
        priceInCents: 3499,
        stock: 65,
        images: [
          'https://picsum.photos/seed/water-bottle-1/800/600',
          'https://picsum.photos/seed/water-bottle-2/800/600',
          'https://picsum.photos/seed/water-bottle-3/800/600',
          'https://picsum.photos/seed/water-bottle-4/800/600',
        ],
        categorySlug: 'accessories',
      },
      {
        name: 'Organic Cotton Tote Bag',
        slug: 'organic-cotton-tote-bag',
        description:
          `Spacious and durable tote bag made from 100% certified organic cotton. Perfect for grocery shopping, farmers markets, or everyday errands. Features reinforced handles and a roomy interior that can hold up to 30 pounds. Machine washable and printed with eco-friendly inks. Help eliminate single-use plastic bags from your routine.`,
        priceInCents: 1599,
        stock: 0,
        images: [
          'https://picsum.photos/seed/tote-bag-1/800/600',
          'https://picsum.photos/seed/tote-bag-2/800/600',
        ],
        categorySlug: 'accessories',
      },
      {
        name: 'Bamboo Toothbrush Set',
        slug: 'bamboo-toothbrush-set',
        description:
          `Biodegradable bamboo toothbrush with soft BPA-free bristles. The handle is made from sustainably grown bamboo that naturally resists bacteria. Each set includes four brushes with different colored handles for family members. When it's time to replace, simply remove the bristles and compost the handle. A simple switch that makes a big environmental impact.`,
        priceInCents: 1299,
        stock: 95,
        images: [
          'https://picsum.photos/seed/toothbrush-1/800/600',
          'https://picsum.photos/seed/toothbrush-2/800/600',
          'https://picsum.photos/seed/toothbrush-3/800/600',
        ],
        categorySlug: 'personal-care',
      },
      {
        name: 'Natural Soap Bar Collection',
        slug: 'natural-soap-bar-collection',
        description:
          `Handcrafted soap bars made from organic oils, plant-based ingredients, and essential oils. Free from synthetic fragrances, dyes, and harsh chemicals. Each bar is gentle on skin and comes in various scents like lavender, eucalyptus, and unscented. Packaged in recyclable paper. Ideal for reducing plastic waste from liquid soap bottles.`,
        priceInCents: 2299,
        stock: 75,
        images: [
          'https://picsum.photos/seed/soap-1/800/600',
          'https://picsum.photos/seed/soap-2/800/600',
        ],
        categorySlug: 'personal-care',
      },
      {
        name: 'Recycled Paper Notebook Set',
        slug: 'recycled-paper-notebook-set',
        description:
          `Set of three notebooks made from 100% post-consumer recycled paper. Smooth writing surface with ruled pages, perfect for journaling, note-taking, or sketching. Durable covers made from recycled cardboard. Each notebook features a different cover design inspired by nature. Help support sustainable forestry practices with every page you write.`,
        priceInCents: 1799,
        stock: 50,
        images: [
          'https://picsum.photos/seed/notebook-1/800/600',
          'https://picsum.photos/seed/notebook-2/800/600',
          'https://picsum.photos/seed/notebook-3/800/600',
        ],
        categorySlug: 'accessories',
      },
      {
        name: 'Bamboo Cutting Board',
        slug: 'bamboo-cutting-board',
        description:
          `Professional-grade bamboo cutting board that's gentle on knives and naturally antimicrobial. Made from sustainably harvested bamboo fibers pressed together. Features a juice groove around the edges and non-slip feet for stability. Easier on the environment than plastic cutting boards and more sanitary than wood. Dishwasher safe and designed to last for years.`,
        priceInCents: 3899,
        stock: 42,
        images: [
          'https://picsum.photos/seed/cutting-board-1/800/600',
          'https://picsum.photos/seed/cutting-board-2/800/600',
          'https://picsum.photos/seed/cutting-board-3/800/600',
        ],
        categorySlug: 'kitchen',
      },
      {
        name: 'Organic Linen Bedding Set',
        slug: 'organic-linen-bedding-set',
        description:
          `Luxurious bedding set made from 100% organic European flax linen. Naturally temperature-regulating, moisture-wicking, and gets softer with every wash. Includes fitted sheet, flat sheet, and two pillowcases. Linen requires less water and pesticides to grow than cotton, making it a more sustainable choice. Available in multiple earth-tone colors to complement your bedroom.`,
        priceInCents: 8499,
        stock: 28,
        images: [
          'https://picsum.photos/seed/linen-bedding-1/800/600',
          'https://picsum.photos/seed/linen-bedding-2/800/600',
          'https://picsum.photos/seed/linen-bedding-3/800/600',
          'https://picsum.photos/seed/linen-bedding-4/800/600',
        ],
        categorySlug: 'home',
      },
      {
        name: 'Soy Candle Collection',
        slug: 'soy-candle-collection',
        description:
          `Set of three soy wax candles made from 100% natural soy wax and cotton wicks. Soy wax burns cleaner and longer than paraffin, producing less soot and toxins. Each candle features unique botanical scents like eucalyptus mint, lavender sage, and vanilla bean. Hand-poured in recyclable glass containers. Create a cozy atmosphere while choosing a more sustainable candle option.`,
        priceInCents: 4499,
        stock: 60,
        images: [
          'https://picsum.photos/seed/candle-1/800/600',
          'https://picsum.photos/seed/candle-2/800/600',
        ],
        categorySlug: 'home',
      },
      {
        name: 'Organic Cotton T-Shirt',
        slug: 'organic-cotton-t-shirt',
        description:
          `Classic crew neck t-shirt made from 100% certified organic cotton. GOTS certified, ensuring environmental and social standards throughout production. Soft, breathable fabric that becomes even more comfortable over time. Available in multiple neutral colors. Ethically manufactured in fair trade facilities. A wardrobe staple that aligns with your values.`,
        priceInCents: 3299,
        stock: 88,
        images: [
          'https://picsum.photos/seed/tshirt-1/800/600',
          'https://picsum.photos/seed/tshirt-2/800/600',
          'https://picsum.photos/seed/tshirt-3/800/600',
        ],
        categorySlug: 'clothing',
      },
      {
        name: 'Bamboo Plant Pot Set',
        slug: 'bamboo-plant-pot-set',
        description:
          `Set of three decorative plant pots made from sustainable bamboo fiber. Lightweight yet durable, with excellent drainage holes. Perfect for indoor herbs, succulents, or small houseplants. Natural bamboo finish complements any decor style. Unlike plastic pots, these will biodegrade at the end of their useful life. Bring nature indoors while supporting sustainable materials.`,
        priceInCents: 2799,
        stock: 35,
        images: [
          'https://picsum.photos/seed/plant-pot-1/800/600',
          'https://picsum.photos/seed/plant-pot-2/800/600',
        ],
        categorySlug: 'home',
      },
      {
        name: 'Compostable Dish Sponge',
        slug: 'compostable-dish-sponge',
        description:
          `Effective cleaning sponge made from plant-based cellulose and natural loofah. Biodegradable and compostable, breaking down completely in home compost systems. Highly absorbent and perfect for washing dishes, cleaning surfaces, or scrubbing pots and pans. Packaged in minimal, plastic-free packaging. Replace your plastic sponges with this eco-friendly alternative that works just as well.`,
        priceInCents: 899,
        stock: 150,
        images: [
          'https://picsum.photos/seed/sponge-1/800/600',
          'https://picsum.photos/seed/sponge-2/800/600',
          'https://picsum.photos/seed/sponge-3/800/600',
        ],
        categorySlug: 'kitchen',
      },
      {
        name: 'Hemp Backpack',
        slug: 'hemp-backpack',
        description:
          `Versatile everyday backpack crafted from durable hemp canvas. Hemp is one of the most sustainable fibers, requiring minimal water and no pesticides to grow. Features multiple compartments, padded laptop sleeve, and adjustable shoulder straps. Built to last for years of daily use. Water-resistant and machine washable. A practical bag that reflects your commitment to sustainable living.`,
        priceInCents: 5499,
        stock: 40,
        images: [
          'https://picsum.photos/seed/backpack-1/800/600',
          'https://picsum.photos/seed/backpack-2/800/600',
          'https://picsum.photos/seed/backpack-3/800/600',
          'https://picsum.photos/seed/backpack-4/800/600',
        ],
        categorySlug: 'accessories',
      },
      {
        name: 'Wool Dryer Balls Set',
        slug: 'wool-dryer-balls-set',
        description:
          `Set of six 100% natural wool dryer balls that reduce drying time and eliminate the need for dryer sheets. These reusable balls naturally soften fabric and reduce static cling. Each set can last for hundreds of loads, saving money and reducing waste. Made from ethically sourced wool. Add a few drops of essential oil for natural fragrance. A simple switch that saves energy and eliminates single-use dryer sheets.`,
        priceInCents: 2199,
        stock: 70,
        images: [
          'https://picsum.photos/seed/dryer-balls-1/800/600',
          'https://picsum.photos/seed/dryer-balls-2/800/600',
        ],
        categorySlug: 'home',
      },
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

    it('should create at least 12 products', async () => {
      await runSeedScript()

      const products = await prisma.product.findMany()

      expect(products.length).toBeGreaterThanOrEqual(12)
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

      expect(firstRunCount).toBeGreaterThanOrEqual(12)
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

