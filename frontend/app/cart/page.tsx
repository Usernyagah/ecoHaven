"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CartItem {
    id: string
    name: string
    price: number
    image: string
    quantity: number
}

export default function CartPage() {
    const [items, setItems] = useState<CartItem[]>([])
    const [loading, setLoading] = useState(true)

    // Mock data for initial view if local storage is empty
    useEffect(() => {
        const mockItems: CartItem[] = [
            {
                id: "1",
                name: "Eco-Friendly Bamboo Toothbrush",
                price: 12.99,
                image: "https://images.unsplash.com/photo-1607613009820-a29f7bb6dcaf?auto=format&fit=crop&w=400",
                quantity: 2,
            },
            {
                id: "3",
                name: "Reusable Silicone Food Bags",
                price: 18.00,
                image: "https://images.unsplash.com/photo-1584278432378-d50c95a28249?auto=format&fit=crop&w=400",
                quantity: 1,
            },
        ]
        setItems(mockItems)
        setLoading(false)
    }, [])

    const updateQuantity = (id: string, delta: number) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
            )
        )
    }

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id))
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shipping = subtotal > 50 ? 0 : 5.99
    const total = subtotal + shipping

    if (loading) return null

    return (
        <div className="min-h-screen bg-stone-50">

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <div className="flex items-center gap-4 mb-10">
                    <ShoppingBag className="h-8 w-8 text-[#8A9A5B]" />
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-800">Your Shopping Bag</h1>
                </div>

                {items.length === 0 ? (
                    <div className="bg-white border border-stone-100 p-12 text-center rounded-sm shadow-sm space-y-6">
                        <Leaf className="h-12 w-12 text-stone-200 mx-auto animate-pulse" />
                        <p className="text-xl text-stone-500 font-serif italic">Your bag is as light as a leaf...</p>
                        <Button asChild className="bg-[#8A9A5B] hover:bg-[#5A6A3B]">
                            <Link href="/products">Browse Products</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Items List */}
                        <div className="lg:col-span-2 space-y-6">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex flex-col sm:flex-row gap-6 bg-white p-6 border border-stone-100 shadow-sm rounded-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="relative h-32 w-32 bg-stone-50 overflow-hidden flex-shrink-0">
                                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-serif font-semibold text-stone-800 mb-1">{item.name}</h3>
                                                <p className="text-[#8A9A5B] font-mono font-bold">${item.price.toFixed(2)}</p>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-stone-300 hover:text-red-500 transition-colors p-1"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-4 mt-4">
                                            <div className="flex items-center border border-stone-200 rounded-sm">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="p-2 hover:bg-stone-50 transition-colors"
                                                >
                                                    <Minus className="h-4 w-4 text-stone-600" />
                                                </button>
                                                <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="p-2 hover:bg-stone-50 transition-colors"
                                                >
                                                    <Plus className="h-4 w-4 text-stone-600" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-8 border border-stone-100 shadow-sm rounded-sm sticky top-24">
                                <h2 className="text-xl font-serif font-bold text-stone-800 mb-6 border-b border-stone-50 pb-4">
                                    Order Summary
                                </h2>

                                <div className="space-y-4 text-sm text-stone-600">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span className="font-mono">${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Shipping</span>
                                        <span className="font-mono">{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
                                    </div>
                                    <div className="border-t border-stone-50 pt-4 mt-4 flex justify-between text-lg font-serif font-bold text-stone-900">
                                        <span>Total</span>
                                        <span className="text-[#8A9A5B]">${total.toFixed(2)}</span>
                                    </div>
                                </div>

                                <Button
                                    className="w-full mt-8 bg-[#8A9A5B] hover:bg-[#5A6A3B] text-white py-6 rounded-none group"
                                >
                                    Proceed to Checkout
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>

                                <p className="text-[11px] text-stone-400 mt-6 text-center italic">
                                    Eco-friendly packaging and carbon-neutral shipping included 🌿
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
