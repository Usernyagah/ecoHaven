"use client"

import { useState } from "react"
import { ShoppingCart, Leaf, Recycle, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

// Sample product data
const productData = {
  id: 1,
  name: "Organic Cotton Tote Bag",
  price: 24.99,
  rating: 4.8,
  reviews: 124,
  image: "/organic-cotton-tote-bag-natural.jpg",
  galleryImages: [
    "/organic-cotton-tote-bag-natural.jpg",
    "/bamboo-plant-pot-minimalist.jpg",
    "/recycled-paper-notebook.png",
  ],
  description:
    "Introducing the EcoHaven Organic Cotton Tote – your sustainable companion for everyday adventures. Crafted from 100% certified organic cotton, this versatile bag combines durability with environmental responsibility. Perfect for farmers markets, beach trips, or daily shopping, this tote is designed to last for years while keeping your conscience clear.",
  longDescription: `Our organic cotton tote bags are carefully crafted to be your perfect sustainable companion. Each bag is made from 100% certified organic cotton sourced from responsible farms that prioritize soil health and biodiversity. The sturdy construction ensures the bag will withstand years of regular use, whether you're carrying groceries, books, or weekend essentials.

What sets our tote apart is our attention to detail and commitment to sustainability throughout the entire production process. We use natural, non-toxic dyes and ensure fair wages for all workers involved in manufacturing. The simple, timeless design means this bag will never go out of style.

With double-stitched seams and reinforced handles, this tote is built to last. The spacious interior easily accommodates groceries, gym clothes, or a weekend getaway's worth of items. It's the perfect alternative to single-use plastic bags.`,
  specifications: {
    material: "100% Organic Cotton",
    dimensions: '15" W x 16" H x 4" D',
    capacity: "20L",
    weight: "150g",
    colors: ["Natural Cream", "Sage Green", "Warm Beige"],
    care: "Machine wash cold, air dry",
  },
  sustainabilityFacts: [
    {
      icon: "leaf",
      title: "Zero Pesticides",
      description: "Made from organic cotton grown without synthetic pesticides or fertilizers",
    },
    {
      icon: "recycle",
      title: "100% Biodegradable",
      description: "Naturally decomposes in 5-6 months, returning nutrients to the soil",
    },
    {
      icon: "leaf",
      title: "Water Efficient",
      description: "Produces with 98% less water compared to conventional cotton",
    },
    {
      icon: "recycle",
      title: "Ethical Production",
      description: "Fair wages and safe working conditions for all artisans",
    },
  ],
  reviews: [
    {
      author: "Sarah M.",
      rating: 5,
      date: "2 weeks ago",
      text: "Absolutely love this tote! It's sturdy, spacious, and I feel good about my purchase knowing it's sustainable.",
    },
    {
      author: "James T.",
      rating: 5,
      date: "1 month ago",
      text: "Perfect quality for the price. The natural color is beautiful and looks even better in person.",
    },
    {
      author: "Emma R.",
      rating: 4,
      date: "2 months ago",
      text: "Great bag! My only wish is it came in more color options, but the quality is exceptional.",
    },
  ],
}

export default function ProductPage() {
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState("Natural Cream")
  const [selectedImage, setSelectedImage] = useState(0)

  const handleAddToCart = () => {
    console.log("Added to cart:", { product: productData.name, quantity, color: selectedColor })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 mt-16">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/products" className="hover:text-foreground transition">
            Products
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">{productData.name}</span>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Left: Large Lifestyle Image */}
          <div className="flex flex-col gap-4">
            <div className="relative h-[500px] md:h-[600px] bg-secondary overflow-hidden">
              <img
                src={productData.galleryImages[selectedImage] || "/placeholder.svg"}
                alt={productData.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Gallery Thumbnails */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {productData.galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-20 h-20 border-2 transition-all ${
                    selectedImage === idx ? "border-primary shadow-md" : "border-border hover:border-primary/50"
                  }`}
                >
                  <img
                    src={img || "/placeholder.svg"}
                    alt={`Product view ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Info with Generous Padding */}
          <div className="flex flex-col justify-start space-y-8">
            {/* Product Header */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">{productData.name}</h1>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-primary text-sm">
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {productData.rating} ({productData.reviews} reviews)
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="pt-2 border-t border-border">
                <p className="text-3xl font-bold text-foreground">${productData.price.toFixed(2)}</p>
              </div>
            </div>

            {/* Divider - Hand-drawn style */}
            <div className="h-px bg-gradient-to-r from-border via-border to-transparent"></div>

            {/* Color Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">Color</label>
              <div className="grid grid-cols-3 gap-3">
                {productData.specifications.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`py-2 px-3 border-2 rounded text-sm font-medium transition-all ${
                      selectedColor === color
                        ? "border-primary bg-secondary text-foreground"
                        : "border-border bg-card text-foreground hover:border-primary/50"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="space-y-2 flex-1">
                  <label className="text-sm font-semibold text-foreground">Quantity</label>
                  <div className="flex items-center border border-border rounded">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-foreground hover:bg-secondary transition"
                    >
                      −
                    </button>
                    <span className="px-4 py-2 font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 text-foreground hover:bg-secondary transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                className="w-full bg-accent hover:bg-accent/90 text-foreground font-semibold py-6 text-base rounded flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </Button>

              <Button
                variant="outline"
                className="w-full border-primary text-foreground hover:bg-secondary py-6 text-base rounded bg-transparent"
              >
                Add to Wishlist
              </Button>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-border via-border to-transparent"></div>

            {/* Quick Info */}
            <div className="space-y-2 text-sm">
              <p className="text-foreground">
                <span className="font-semibold">Free shipping</span> on orders over $50
              </p>
              <p className="text-foreground">
                <span className="font-semibold">30-day returns</span> – no questions asked
              </p>
              <p className="text-foreground">
                <span className="font-semibold">Secure checkout</span> with encrypted payment
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sustainability Facts Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 border-t border-b border-border">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-2">Sustainability Facts</h2>
            <div className="h-1 w-16 bg-primary"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {productData.sustainabilityFacts.map((fact, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex items-center gap-3">
                  {fact.icon === "leaf" ? (
                    <Leaf className="w-6 h-6 text-primary flex-shrink-0" />
                  ) : (
                    <Recycle className="w-6 h-6 text-primary flex-shrink-0" />
                  )}
                  <h3 className="font-semibold text-foreground text-sm">{fact.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{fact.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Section: Description, Specs, Reviews */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-secondary">
            <TabsTrigger
              value="description"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded text-sm font-medium"
            >
              Description
            </TabsTrigger>
            <TabsTrigger
              value="specifications"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded text-sm font-medium"
            >
              Specifications
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded text-sm font-medium"
            >
              Reviews
            </TabsTrigger>
          </TabsList>

          {/* Description Tab */}
          <TabsContent value="description" className="space-y-6">
            <div className="space-y-4">
              <p className="text-base text-foreground leading-relaxed">{productData.description}</p>
              <p className="text-base text-foreground leading-relaxed">{productData.longDescription}</p>
            </div>
          </TabsContent>

          {/* Specifications Tab */}
          <TabsContent value="specifications" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-4">Product Details</h3>
                <dl className="space-y-3">
                  <div className="border-b border-border pb-3">
                    <dt className="text-sm font-medium text-muted-foreground">Material</dt>
                    <dd className="text-base text-foreground mt-1">{productData.specifications.material}</dd>
                  </div>
                  <div className="border-b border-border pb-3">
                    <dt className="text-sm font-medium text-muted-foreground">Dimensions</dt>
                    <dd className="text-base text-foreground mt-1">{productData.specifications.dimensions}</dd>
                  </div>
                  <div className="border-b border-border pb-3">
                    <dt className="text-sm font-medium text-muted-foreground">Capacity</dt>
                    <dd className="text-base text-foreground mt-1">{productData.specifications.capacity}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Weight</dt>
                    <dd className="text-base text-foreground mt-1">{productData.specifications.weight}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-4">Care Instructions</h3>
                <p className="text-base text-foreground leading-relaxed mb-4">{productData.specifications.care}</p>
                <div className="bg-secondary p-4 rounded space-y-2">
                  <p className="text-sm font-medium text-foreground">Recommended:</p>
                  <ul className="text-sm text-foreground space-y-1">
                    <li>• Use natural detergent</li>
                    <li>• Avoid bleach and fabric softener</li>
                    <li>• Dry naturally in sunlight</li>
                    <li>• Store in cool, dry place</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <div className="space-y-6">
              {productData.reviews.map((review, idx) => (
                <div key={idx} className="border-b border-border pb-6 last:border-b-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-foreground">{review.author}</p>
                      <p className="text-sm text-muted-foreground">{review.date}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-sm ${i < review.rating ? "text-primary" : "text-border"}`}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-base text-foreground leading-relaxed">{review.text}</p>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-border">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3">
                Write a Review
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products Teaser */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 border-t border-border">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-2">You Might Like</h2>
            <div className="h-1 w-16 bg-primary"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((_, idx) => (
              <div
                key={idx}
                className="bg-card border border-border rounded overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square bg-secondary overflow-hidden">
                  <img
                    src={`/eco-friendly-product-.jpg?height=300&width=300&query=eco-friendly product ${idx + 1}`}
                    alt="Related product"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-serif font-semibold text-foreground text-sm line-clamp-2">
                    Related Eco Product {idx + 1}
                  </h3>
                  <p className="text-lg font-bold text-primary">${(24.99 + idx * 5).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
