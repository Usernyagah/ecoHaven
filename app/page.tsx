import { Leaf, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { ProductCard } from "@/components/ui/ProductCard"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const rawProducts = await db.product.findMany({
    where: { isFeatured: true },
    take: 8,
    orderBy: { createdAt: 'desc' },
    include: { category: true }
  });

  const featuredProducts = rawProducts.map((p: any, i: number) => ({
    id: p.id,
    name: p.name,
    price: p.priceInCents / 100,
    image: p.images[0] || "/placeholder.svg",
    description: p.description,
    category: p.category.name,
    height: (["tall", "medium", "short"][i % 3] as "tall" | "medium" | "short"),
    rotation: ((i % 3) - 1) * 2,
  }));

  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section - Asymmetrical */}
      <section id="home" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left - Large Product Image (Offset) */}
          <div className="relative md:order-2">
            <div className="relative h-[400px] md:h-[500px] overflow-hidden">
              <img
                src="/eco-friendly-products-sustainable-lifestyle-natura.jpg"
                alt="EcoHaven Featured Products"
                className="w-full h-full object-cover -translate-x-8 -translate-y-4"
              />
            </div>
          </div>

          {/* Right - Text with Generous Whitespace */}
          <div className="md:order-1 flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground text-balance leading-tight">
                Live Sustainably with EcoHaven
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Discover thoughtfully curated eco-friendly products that reduce your environmental footprint without
                compromising on quality or style.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-fit">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 py-6 text-base">
                Shop Now
              </Button>
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-secondary px-8 py-6 text-base bg-transparent"
              >
                Learn More
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex gap-6 pt-4 text-sm">
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-primary" />
                <span className="text-foreground">100% Sustainable</span>
              </div>
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-primary" />
                <span className="text-foreground">Plastic-Free</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Masonry Product Grid */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Curated Eco-Essentials</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Thoughtfully selected sustainable products for everyday living
          </p>
        </div>

        {/* Masonry Grid Layout */}
        <div className="columns-1 sm:columns-2 lg:columns-4 gap-6 space-y-6">
          {featuredProducts.map((product: any) => {
            const heightMap: Record<string, string> = {
              short: "h-[320px]",
              medium: "h-[400px]",
              tall: "h-[480px]",
            }

            return (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.image}
                category={product.category}
                description={product.description}
                height={heightMap[product.height]}
                rotation={product.rotation}
              />
            )
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.jpg" alt="EcoHaven Logo" className="w-5 h-5 object-contain rounded" />
                <span className="font-serif font-bold text-foreground">EcoHaven</span>
              </div>
              <p className="text-sm text-muted-foreground">Sustainable living starts with thoughtful choices.</p>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-3 text-sm">Shop</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    All Products
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    New Arrivals
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Sale
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-3 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Sustainability
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-3 text-sm">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    FAQs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Returns
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>&copy; 2025 EcoHaven. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-foreground transition">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-foreground transition">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
