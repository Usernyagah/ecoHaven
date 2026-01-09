"use client"

import { useState } from "react"
import Image from "next/image"
import { ShoppingCart, Leaf, Menu, X } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

// Sample product data with varying sizes for asymmetric grid
const PRODUCTS = [
  {
    id: 1,
    name: "Bamboo Toothbrush Set",
    price: 12.99,
    image: "/bamboo-toothbrush-eco-friendly.png",
    category: "Personal Care",
    material: "Bamboo",
    span: 1,
  },
  {
    id: 2,
    name: "Organic Cotton Tote",
    price: 24.99,
    image: "/organic-cotton-tote-bag-natural.jpg",
    category: "Accessories",
    material: "Organic Cotton",
    span: 2,
  },
  {
    id: 3,
    name: "Natural Soap Bars",
    price: 8.99,
    image: "/natural-soap-bars-organic.jpg",
    category: "Personal Care",
    material: "Natural",
    span: 1,
  },
  {
    id: 4,
    name: "Stainless Steel Water Bottle",
    price: 34.99,
    image: "/reusable-stainless-steel-water-bottle-eco.jpg",
    category: "Drinkware",
    material: "Stainless Steel",
    span: 1,
  },
  {
    id: 5,
    name: "Soy Candle Collection",
    price: 19.99,
    image: "/natural-soy-candle-plants-botanical.jpg",
    category: "Home",
    material: "Natural Soy",
    span: 2,
  },
  {
    id: 6,
    name: "Bamboo Utensil Set",
    price: 16.99,
    image: "/bamboo-utensils-spoon-fork-knife-eco.jpg",
    category: "Kitchen",
    material: "Bamboo",
    span: 1,
  },
  {
    id: 7,
    name: "Organic Linen Bedding",
    price: 89.99,
    image: "/natural-linen-bedding-sheets-organic.jpg",
    category: "Home",
    material: "Organic Linen",
    span: 2,
  },
  {
    id: 8,
    name: "Recycled Notebook",
    price: 7.99,
    image: "/recycled-paper-notebook.png",
    category: "Stationery",
    material: "Recycled Paper",
    span: 1,
  },
  {
    id: 9,
    name: "Bamboo Plant Pot",
    price: 21.99,
    image: "/bamboo-plant-pot-minimalist.jpg",
    category: "Home",
    material: "Bamboo",
    span: 1,
  },
]

const CATEGORIES = ["Personal Care", "Accessories", "Drinkware", "Home", "Kitchen", "Stationery"]
const MATERIALS = ["Bamboo", "Organic Cotton", "Natural", "Stainless Steel", "Organic Linen", "Recycled Paper"]

export default function ProductsPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Filter products based on selections
  const filteredProducts = PRODUCTS.filter((product) => {
    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.category)
    const materialMatch = selectedMaterials.length === 0 || selectedMaterials.includes(product.material)
    const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1]
    return categoryMatch && materialMatch && priceMatch
  })

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const toggleMaterial = (material: string) => {
    setSelectedMaterials((prev) => (prev.includes(material) ? prev.filter((m) => m !== material) : [...prev, material]))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Leaf className="h-6 w-6 text-primary" />
            <h1 className="flex-1 ml-3 text-xl font-serif font-bold text-foreground">EcoHaven</h1>
            <div className="flex items-center gap-4">
              <button className="hidden sm:inline-flex p-2 text-foreground hover:bg-secondary rounded-md transition-colors">
                <ShoppingCart className="h-5 w-5" />
              </button>
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="sm:hidden p-2 text-foreground">
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="text-muted-foreground text-xs">
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-xs">Products</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar - Mobile as Accordion */}
          <div className={`lg:block ${sidebarOpen ? "block" : "hidden"} lg:col-span-1`}>
            <div className="space-y-6">
              <div className="hidden lg:block">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-4">Filters</h3>
              </div>

              {/* Mobile Accordion Filters */}
              <div className="lg:hidden">
                <Accordion type="single" collapsible defaultValue="categories">
                  {/* Categories Filter */}
                  <AccordionItem value="categories">
                    <AccordionTrigger className="text-foreground">Categories</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        {CATEGORIES.map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox
                              id={`mobile-cat-${category}`}
                              checked={selectedCategories.includes(category)}
                              onCheckedChange={() => toggleCategory(category)}
                            />
                            <Label htmlFor={`mobile-cat-${category}`} className="text-sm cursor-pointer">
                              {category}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Materials Filter */}
                  <AccordionItem value="materials">
                    <AccordionTrigger className="text-foreground">Materials</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        {MATERIALS.map((material) => (
                          <div key={material} className="flex items-center space-x-2">
                            <Checkbox
                              id={`mobile-mat-${material}`}
                              checked={selectedMaterials.includes(material)}
                              onCheckedChange={() => toggleMaterial(material)}
                            />
                            <Label htmlFor={`mobile-mat-${material}`} className="text-sm cursor-pointer">
                              {material}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Price Range Filter */}
                  <AccordionItem value="price">
                    <AccordionTrigger className="text-foreground">Price Range</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <Slider min={0} max={100} step={5} value={priceRange} onValueChange={setPriceRange} />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>${priceRange[0]}</span>
                          <span>${priceRange[1]}</span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* Desktop Filters */}
              <div className="hidden lg:space-y-6">
                {/* Categories */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3 text-sm">Categories</h4>
                  <div className="space-y-2">
                    {CATEGORIES.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`cat-${category}`}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <Label htmlFor={`cat-${category}`} className="text-sm cursor-pointer">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Materials */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3 text-sm">Materials</h4>
                  <div className="space-y-2">
                    {MATERIALS.map((material) => (
                      <div key={material} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mat-${material}`}
                          checked={selectedMaterials.includes(material)}
                          onCheckedChange={() => toggleMaterial(material)}
                        />
                        <Label htmlFor={`mat-${material}`} className="text-sm cursor-pointer">
                          {material}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3 text-sm">Price Range</h4>
                  <Slider min={0} max={100} step={5} value={priceRange} onValueChange={setPriceRange} />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid - Asymmetric Masonry */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-max gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className={`${product.span === 2 ? "sm:col-span-2 lg:col-span-2" : ""} group`}>
                  <div
                    className="flex flex-col h-full bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200"
                    style={{
                      transform: `rotate(${((product.id % 3) - 1) * 1.5}deg)`,
                    }}
                  >
                    {/* Product Image Container */}
                    <div className="relative w-full aspect-square overflow-hidden">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col flex-1 p-4">
                      <h3 className="font-serif font-semibold text-foreground text-base mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-3">${product.price.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground mb-4">{product.material}</p>

                      {/* Add to Cart Button */}
                      <Button
                        className="w-full mt-auto bg-accent hover:bg-accent/90 text-accent-foreground transition-colors"
                        size="sm"
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results Message */}
            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No products match your filters. Try adjusting your selections.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
