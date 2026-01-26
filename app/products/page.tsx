import { db } from "@/lib/db"
import { ProductsClient } from "@/app/products/products-client"

export const dynamic = "force-dynamic"

export default async function ProductsPage() {
  const rawProducts = await db.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  })

  const dbProducts = rawProducts.map((p: any) => ({
    id: p.id,
    name: p.name,
    price: p.priceInCents / 100,
    image: p.images[0] || "/placeholder.svg",
    category: p.category.name,
    material: "Sustainable",
    span: (p.name.length > 25 ? 2 : 1) as 1 | 2,
  }))

  const categories = Array.from<string>(new Set(dbProducts.map((p: any) => p.category)))

  return <ProductsClient initialProducts={dbProducts as any} categories={categories} />
}
