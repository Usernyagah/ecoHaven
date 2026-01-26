import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { ProductPageClient } from "./product-page-client"

export const dynamic = "force-dynamic"

export default async function ProductPage({ params }: { params: { id: string } }) {
  const { id } = params

  const product = await db.product.findUnique({
    where: { id },
    include: { category: true }
  })

  if (!product) {
    notFound()
  }

  const relatedProducts = await db.product.findMany({
    where: {
      categoryId: product.categoryId,
      NOT: { id: product.id }
    },
    take: 4,
    include: { category: true }
  })

  const serializedProduct = {
    ...product,
    price: product.priceInCents / 100,
    images: product.images.length > 0 ? product.images : ["/placeholder.svg"],
    categoryName: product.category.name
  }

  const serializedRelated = relatedProducts.map(p => ({
    id: p.id,
    name: p.name,
    price: p.priceInCents / 100,
    image: p.images[0] || "/placeholder.svg",
    category: p.category.name
  }))

  return (
    <ProductPageClient
      product={serializedProduct as any}
      relatedProducts={serializedRelated as any}
    />
  )
}
