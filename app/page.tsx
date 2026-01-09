"use client"

import { Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"

interface Product {
  id: number
  name: string
  price: string
  image: string
  description: string
  height: "short" | "medium" | "tall"
  rotation: number
}

const products: Product[] = [
  {
    id: 1,
    name: "Bamboo Toothbrush Set",
    price: "$12.99",
    image: "/bamboo-toothbrush-eco-friendly.png",
    description: "Sustainable bamboo toothbrushes with biodegradable handles",
    height: "tall",
    rotation: -2,
  },
  {
    id: 2,
    name: "Organic Cotton Tote",
    price: "$24.99",
    image: "/organic-cotton-tote-bag-natural.jpg",
    description: "Durable organic cotton shopping bag",
    height: "tall",
    rotation: 1,
  },
  {
    id: 3,
    name: "Natural Soap Bars",
    price: "$8.99",
    image: "/natural-soap-bars-organic.jpg",
    description: "Handmade with essential oils and natural ingredients",
    height: "medium",
    rotation: -1,
  },
  {
    id: 4,
    name: "Reusable Water Bottle",
    price: "$34.99",
    image: "/reusable-stainless-steel-water-bottle-eco.jpg",
    description: "Stainless steel, keeps drinks hot or cold",
    height: "medium",
    rotation: 2,
  },
  {
    id: 5,
    name: "Plant-Based Candle",
    price: "$16.99",
    image: "/natural-soy-candle-plants-botanical.jpg",
    description: "Made from sustainable soy wax",
    height: "short",
    rotation: -1,
  },
  {
    id: 6,
    name: "Eco Bamboo Utensils",
    price: "$14.99",
    image: "/bamboo-utensils-spoon-fork-knife-eco.jpg",
    description: "Portable travel-friendly utensil set",
    height: "short",
    rotation: 1,
  },
  {
    id: 7,
    name: "Linen Bed Sheets",
    price: "$89.99",
    image: "/natural-linen-bedding-sheets-organic.jpg",
    description: "Luxurious sustainable linen in natural cream",
    height: "tall",
    rotation: 0,
  },
  {
    id: 8,
    name: "Bamboo Cutting Board",
    price: "$22.99",
    image: "/bamboo-cutting-board-kitchen-natural.jpg",
    description: "Renewable bamboo kitchen essential",
    height: "medium",
    rotation: -2,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

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
          {products.map((product) => {
            const heightMap = {
              short: "h-[320px]",
              medium: "h-[400px]",
              tall: "h-[480px]",
            }

            return (
              <div
                key={product.id}
                className="break-inside-avoid"
                style={{
                  transform: `rotate(${product.rotation}deg)`,
                }}
              >
                <Card className="overflow-hidden border-4 border-white shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
                  <div className={`${heightMap[product.height]} overflow-hidden bg-secondary`}>
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Polaroid-style content */}
                  <div className="p-4 bg-card space-y-3">
                    <div>
                      <h3 className="text-sm font-serif font-semibold text-foreground line-clamp-2">{product.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{product.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-lg font-bold text-primary">{product.price}</span>
                      <Button size="sm" className="bg-primary hover:bg-primary/90 text-white text-xs">
                        Add
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
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
