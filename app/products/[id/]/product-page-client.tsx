"use client"

import { useState } from "react"
import { ShoppingCart, Leaf, Recycle, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import Image from "next/image"
import { ProductCard } from "@/components/ui/ProductCard"

interface ProductPageClientProps {
    product: {
        id: string
        name: string
        price: number
        description: string
        images: string[]
        categoryName: string
        stock: number
    }
    relatedProducts: Array<{
        id: string
        name: string
        price: number
        image: string
        category: string
    }>
}

export function ProductPageClient({ product, relatedProducts }: ProductPageClientProps) {
    const [quantity, setQuantity] = useState(1)
    const [selectedImage, setSelectedImage] = useState(0)

    const handleAddToCart = () => {
        // Simplified alert for portfolio demo
        alert(`Added ${quantity} x ${product.name} to cart!`)
    }

    return (
        <div className="min-h-screen bg-stone-50/30">
            {/* Breadcrumb Navigation */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 mt-6">
                <div className="flex items-center gap-2 text-xs text-stone-500">
                    <Link href="/" className="hover:text-[#8A9A5B] transition">Home</Link>
                    <ChevronRight className="w-3 h-3 text-stone-300" />
                    <Link href="/products" className="hover:text-[#8A9A5B] transition">Products</Link>
                    <ChevronRight className="w-3 h-3 text-stone-300" />
                    <span className="text-stone-800 font-medium">{product.name}</span>
                </div>
            </div>

            {/* Main Product Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                    {/* Left: Product Images */}
                    <div className="space-y-6">
                        <div className="relative aspect-square bg-white border border-stone-100 overflow-hidden rounded-sm shadow-sm group">
                            <Image
                                src={product.images[selectedImage] || "/placeholder.svg"}
                                alt={product.name}
                                fill
                                priority
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>

                        {/* Gallery Thumbnails */}
                        {product.images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`relative flex-shrink-0 w-24 h-24 border-2 transition-all rounded-sm overflow-hidden ${selectedImage === idx ? "border-[#8A9A5B] ring-2 ring-[#8A9A5B]/10" : "border-white hover:border-stone-200"
                                            }`}
                                    >
                                        <Image
                                            src={img || "/placeholder.svg"}
                                            alt={`${product.name} view ${idx + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Info */}
                    <div className="flex flex-col space-y-8">
                        <div className="space-y-4">
                            <p className="text-[#8A9A5B] text-xs font-bold uppercase tracking-[0.2em]">{product.categoryName}</p>
                            <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 leading-tight">
                                {product.name}
                            </h1>
                            <div className="flex items-center gap-4 pt-2">
                                <span className="text-3xl font-mono font-bold text-[#8A9A5B]">
                                    ${product.price.toFixed(2)}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-none border ${product.stock > 0 ? "border-[#8A9A5B] text-[#8A9A5B]" : "border-red-200 text-red-500"
                                    }`}>
                                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                                </span>
                            </div>
                        </div>

                        <div className="h-px bg-stone-200 w-full"></div>

                        <p className="text-stone-600 leading-relaxed text-lg italic font-serif">
                            "{product.description}"
                        </p>

                        {/* Quantity & Add to Cart */}
                        <div className="space-y-6">
                            <div className="flex items-end gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Quantity</label>
                                    <div className="flex items-center border border-stone-200 rounded-none bg-white">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="px-4 py-3 text-stone-400 hover:text-stone-900 transition"
                                        >
                                            −
                                        </button>
                                        <span className="px-4 py-3 font-mono font-bold text-lg min-w-[50px] text-center">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="px-4 py-3 text-stone-400 hover:text-stone-900 transition"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleAddToCart}
                                    disabled={product.stock <= 0}
                                    className="flex-1 bg-[#8A9A5B] hover:bg-[#5A6A3B] text-white font-bold py-8 text-lg rounded-none shadow-lg shadow-[#8A9A5B]/20 transition-all active:scale-[0.98] group"
                                >
                                    <ShoppingCart className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                                    Add to Cart
                                </Button>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="flex items-center gap-3 p-4 bg-white border border-stone-100">
                                <Leaf className="w-5 h-5 text-[#8A9A5B]" />
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-stone-800">100% Organic</p>
                                    <p className="text-[10px] text-stone-400">Certified GOTS Cotton</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-white border border-stone-100">
                                <Recycle className="w-5 h-5 text-[#8A9A5B]" />
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-stone-800">Circular</p>
                                    <p className="text-[10px] text-stone-400">Eco-Friendly Pack</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Details Tabs */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                <Tabs defaultValue="description" className="w-full">
                    <TabsList className="flex justify-center border-b border-stone-200 rounded-none bg-transparent h-auto p-0 mb-12">
                        <TabsTrigger
                            value="description"
                            className="px-8 py-4 data-[state=active]:border-b-2 data-[state=active]:border-[#8A9A5B] data-[state=active]:text-[#8A9A5B] rounded-none text-sm font-bold uppercase tracking-widest text-stone-400 transition-all bg-transparent"
                        >
                            Description
                        </TabsTrigger>
                        <TabsTrigger
                            value="impact"
                            className="px-8 py-4 data-[state=active]:border-b-2 data-[state=active]:border-[#8A9A5B] data-[state=active]:text-[#8A9A5B] rounded-none text-sm font-bold uppercase tracking-widest text-stone-400 transition-all bg-transparent"
                        >
                            Eco Impact
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="description" className="max-w-3xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h2 className="text-3xl font-serif font-bold text-stone-800">About this {product.name}</h2>
                        <p className="text-stone-600 text-lg leading-relaxed">
                            {product.description}. This product is carefully crafted with sustainability at its heart, ensuring
                            that every stage of its lifecycle minimizes environmental impact while maximizing quality and durability.
                        </p>
                    </TabsContent>

                    <TabsContent value="impact" className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            <div className="space-y-4 p-8 bg-white border border-stone-100">
                                <Leaf className="w-8 h-8 text-[#8A9A5B] mx-auto" />
                                <h3 className="font-serif font-bold text-xl">Zero Waste</h3>
                                <p className="text-stone-500 text-sm">Reduced water consumption and zero synthetic pesticides during cultivation.</p>
                            </div>
                            <div className="space-y-4 p-8 bg-white border border-stone-100">
                                <Recycle className="w-8 h-8 text-[#8A9A5B] mx-auto" />
                                <h3 className="font-serif font-bold text-xl">Biodegradable</h3>
                                <p className="text-stone-500 text-sm">Designed to return to the earth naturally without leaving harmful microplastics.</p>
                            </div>
                            <div className="space-y-4 p-8 bg-white border border-stone-100">
                                <div className="w-8 h-8 border-2 border-[#8A9A5B] rounded-full flex items-center justify-center font-bold text-[#8A9A5B] mx-auto">UT</div>
                                <h3 className="font-serif font-bold text-xl">Ethical Flow</h3>
                                <p className="text-stone-500 text-sm">Every artisan involved in production receives above-market wages and safe conditions.</p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <section className="bg-stone-100 py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-end justify-between mb-12">
                            <div className="space-y-2">
                                <p className="text-[#8A9A5B] text-xs font-bold uppercase tracking-widest">Selected for you</p>
                                <h2 className="text-3xl font-serif font-bold text-stone-800">Similar Essentials</h2>
                            </div>
                            <Link href="/products" className="text-sm font-bold text-[#8A9A5B] border-b border-[#8A9A5B] pb-1 hover:text-[#5A6A3B] transition">
                                View All
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {relatedProducts.map((p) => (
                                <ProductCard
                                    key={p.id}
                                    id={p.id}
                                    name={p.name}
                                    price={p.price}
                                    image={p.image}
                                    category={p.category}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    )
}
