// === prisma/seed.ts ===
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed (Reduced to 5 default items)...')

  // Clear existing items
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()

  const adminEmail = 'admin@ecohaven.com'
  const hashedPassword = '$argon2id$v=19$m=65536,t=2,p=1$T3R0NjhCclR6eU1qVlE2UQ$F9uS39R6q3n9W1z4X7b8e5v2M1'

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin User',
      role: 'ADMIN',
      passwordHash: hashedPassword
    }
  })
  console.log(`Created admin: ${admin.email}`)

  // 2. Create Categories
  const categoriesData = [
    { name: 'Sustainable Home', slug: 'home', description: 'Eco-friendly goods for your living space.' },
    { name: 'Organic Apparel', slug: 'apparel', description: 'Ethically sourced clothing.' },
    { name: 'Zero Waste Kitchen', slug: 'kitchen', description: 'Reusable replacements for single-use plastics.' },
    { name: 'Natural Beauty', slug: 'beauty', description: 'Clean skincare and wellness products.' },
    { name: 'Gardening', slug: 'gardening', description: 'Tools and seeds for your green thumb.' }
  ]

  const categoriesMap: Record<string, string> = {}
  for (const cat of categoriesData) {
    const c = await prisma.category.create({ data: cat })
    categoriesMap[cat.slug] = c.id
  }
  console.log(`Created ${Object.keys(categoriesMap).length} categories`)

  // 3. Create Products (Top 5 Unique Items)
  const productsData = [
    {
      name: 'Bamboo Toothbrush Set',
      description: 'A set of 4 biodegradable bamboo toothbrushes with charcoal bristles.',
      priceInCents: 1299,
      stock: 50,
      slug: 'beauty',
      isFeatured: true,
      images: ['https://images.unsplash.com/photo-1607613009820-a29f7bb6dcaf?auto=format&fit=crop&w=800']
    },
    {
      name: 'Hemp Bed Sheets - Cream',
      description: 'Breathable, antimicrobial hemp sheets for a better, deeper sleep.',
      priceInCents: 14500,
      stock: 15,
      slug: 'home',
      isFeatured: true,
      images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800']
    },
    {
      name: 'Reusable Silicone bags',
      description: 'Leakproof, platinum-grade silicone food storage bags. Microwave safe.',
      priceInCents: 1800,
      stock: 75,
      slug: 'kitchen',
      isFeatured: true,
      images: ['https://images.unsplash.com/photo-1584278432378-d50c95a28249?auto=format&fit=crop&w=800']
    },
    {
      name: 'Sage Organic T-Shirt',
      description: 'Ultra-soft, GOTS certified organic cotton tee in sage green.',
      priceInCents: 2950,
      stock: 100,
      slug: 'apparel',
      isFeatured: true,
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800']
    },
    {
      name: 'Minimalist Ceramic Planter',
      description: 'Handcrafted minimalist ceramic planter for indoor and outdoor plants.',
      priceInCents: 3500,
      stock: 20,
      slug: 'gardening',
      isFeatured: true,
      images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800']
    }
  ]

  for (const p of productsData) {
    const categoryId = categoriesMap[p.slug]
    if (categoryId) {
      await prisma.product.create({
        data: {
          name: p.name,
          slug: p.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
          description: p.description,
          priceInCents: p.priceInCents,
          stock: p.stock,
          images: p.images,
          isFeatured: p.isFeatured,
          categoryId: categoryId
        }
      })
    }
  }
  console.log(`Created ${productsData.length} products`)
  console.log('🌱 Seed complete')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
