"use client"

import { useState } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import Link from "next/link"
import { ProductCard } from "@/components/ui/ProductCard"

interface Product {
    id: string
    name: string
    price: number
    image: string
    category: string
    material: string
    span: 1 | 2
}

interface ProductsClientProps {
    initialProducts: Product[]
    categories: string[]
}

export function ProductsClient({ initialProducts, categories }: ProductsClientProps) {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 200])
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // Filter products based on selections
    const filteredProducts = initialProducts.filter((product) => {
        const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.category)
        const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1]
        return categoryMatch && priceMatch
    })

    const toggleCategory = (category: string) => {
        setSelectedCategories((prev) =>
            prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
        )
    }

    return (
        <div className="min-h-screen bg-background text-stone-900">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <Link href="/" className="flex items-center">
                            <Leaf className="h-6 w-6 text-[#8A9A5B]" />
                            <h1 className="ml-3 text-xl font-serif font-bold text-stone-800 uppercase tracking-tighter">EcoHaven</h1>
                        </Link>
                        <div className="flex items-center gap-4">
                            <Link href="/cart" className="p-2 text-stone-700 hover:bg-stone-100 rounded-md transition-colors">
                                <ShoppingCart className="h-5 w-5" />
                            </Link>
                            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 text-stone-700">
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
                            <BreadcrumbLink href="/" className="text-stone-500 text-xs">
                                Home
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="text-xs text-stone-900 font-medium">Products</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            {/* Main Content */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Filters Sidebar */}
                    <div className={`${sidebarOpen ? "block" : "hidden"} lg:block lg:col-span-1 border-r border-stone-100 pr-8`}>
                        <div className="space-y-10">
                            <div>
                                <h3 className="font-serif text-lg font-semibold text-stone-800 mb-6">Filter By</h3>

                                {/* Categories */}
                                <div className="mb-8">
                                    <h4 className="font-bold text-stone-900 mb-4 text-xs uppercase tracking-widest">Categories</h4>
                                    <div className="space-y-3">
                                        {categories.map((category) => (
                                            <div key={category} className="flex items-center space-x-3">
                                                <Checkbox
                                                    id={`cat-${category}`}
                                                    checked={selectedCategories.includes(category)}
                                                    onCheckedChange={() => toggleCategory(category)}
                                                    className="border-stone-300 data-[state=checked]:bg-[#8A9A5B] data-[state=checked]:border-[#8A9A5B]"
                                                />
                                                <Label htmlFor={`cat-${category}`} className="text-sm cursor-pointer text-stone-600 hover:text-stone-900 transition-colors">
                                                    {category}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Range */}
                                <div>
                                    <h4 className="font-bold text-stone-900 mb-6 text-xs uppercase tracking-widest">Price Range</h4>
                                    <div className="px-2">
                                        <Slider
                                            min={0}
                                            max={200}
                                            step={5}
                                            value={priceRange}
                                            onValueChange={setPriceRange as any}
                                            className="text-[#8A9A5B]"
                                        />
                                    </div>
                                    <div className="flex justify-between mt-4 text-sm font-medium text-stone-600">
                                        <span>${priceRange[0]}</span>
                                        <span>${priceRange[1]}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="lg:col-span-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-8">
                            {filteredProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    id={product.id}
                                    name={product.name}
                                    price={product.price}
                                    image={product.image}
                                    category={product.category}
                                    height="h-[450px]"
                                />
                            ))}
                        </div>

                        {filteredProducts.length === 0 && (
                            <div className="col-span-full py-32 flex flex-col items-center">
                                <Leaf className="h-10 w-10 text-stone-200 mb-4 animate-bounce" />
                                <p className="text-stone-400 font-serif italic text-xl">
                                    Peace of mind... but no products found.
                                </p>
                                <Button
                                    variant="outline"
                                    className="mt-8 border-stone-200 text-stone-500 hover:text-stone-900"
                                    onClick={() => {
                                        setSelectedCategories([]);
                                        setPriceRange([0, 200]);
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
