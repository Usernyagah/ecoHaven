"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "./button"
import { Card } from "./card"

interface ProductCardProps {
    id: string
    name: string
    price: number
    image: string
    category: string
    rotation?: number
    height?: string
    description?: string
    priority?: boolean
}

export function ProductCard({
    id,
    name,
    price,
    image,
    category,
    rotation = 0,
    height = "h-[400px]",
    description,
    priority = false
}: ProductCardProps) {
    return (
        <div
            className="break-inside-avoid group"
            style={{
                transform: `rotate(${rotation}deg)`,
            }}
        >
            <Link href={`/products/${id}`} className="block">
                <Card className="overflow-hidden border-4 border-white shadow-lg hover:shadow-xl transition-all duration-300 bg-card">
                    <div className={`${height} relative overflow-hidden bg-stone-50`}>
                        <Image
                            src={image || "/placeholder.svg"}
                            alt={name}
                            fill
                            priority={priority}
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        {/* Quick Add Overlay */}
                        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-white/90 to-transparent">
                            <Button
                                className="w-full bg-[#8A9A5B] hover:bg-[#5A6A3B] text-white rounded-none border-none shadow-none"
                                size="sm"
                                onClick={(e) => {
                                    e.preventDefault();
                                    alert("Item added to cart");
                                }}
                            >
                                Quick Add
                            </Button>
                        </div>
                    </div>

                    <div className="p-4 bg-card space-y-2 text-center">
                        <p className="text-[10px] text-[#8A9A5B] font-bold uppercase tracking-widest">{category}</p>
                        <h3 className="text-sm font-serif font-semibold text-stone-800 line-clamp-2">{name}</h3>
                        {description && <p className="text-xs text-muted-foreground line-clamp-1">{description}</p>}

                        <div className="flex items-center justify-center pt-2 border-t border-stone-100">
                            <span className="text-lg font-mono font-bold text-[#8A9A5B]">${price.toFixed(2)}</span>
                        </div>
                    </div>
                </Card>
            </Link>
        </div>
    )
}
