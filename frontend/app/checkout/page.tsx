// === app/checkout/page.tsx ===

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Loader2, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

// In a real app, this would come from a Context or Global State
const DEMO_CART = [
  {
    productId: 'bamboo-toothbrush-1', // Ensure this ID exists in your seeded DB for testing or update manually
    name: 'Bamboo Toothbrush 4-Pack',
    price: 1299, // $12.99
    quantity: 1,
    image: '/bamboo-toothbrush-eco-friendly.png',
  },
  {
    productId: 'stainless-bottle-1',
    name: 'Insulated Water Bottle',
    price: 2450, // $24.50
    quantity: 2,
    image: '/reusable-stainless-steel-water-bottle-eco.jpg',
  }
]

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Calculate total
  const total = DEMO_CART.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(total / 100)

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItems: DEMO_CART.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      if (data.url) {
        // Redirect to Stripe
        router.push(data.url)
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error: any) {
      toast.error(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-12 px-4 md:px-6">
      <h1 className="text-3xl font-serif text-[#2c3e34] mb-8">Checkout</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="space-y-6">
          <Card className="bg-[#fbfbf6] border-[#d4c5a9]">
            <CardHeader>
              <CardTitle className="text-[#3d5a47]">Order Summary</CardTitle>
              <CardDescription>Review your sustainable choices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {DEMO_CART.map((item) => (
                <div key={item.productId} className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-[#2c3e34]">{item.name}</p>
                    <p className="text-sm text-stone-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-mono text-[#3d5a47]">
                    ${((item.price * item.quantity) / 100).toFixed(2)}
                  </p>
                </div>
              ))}
              <Separator className="bg-[#d4c5a9]/50" />
              <div className="flex justify-between items-center pt-2">
                <span className="font-semibold text-lg">Total</span>
                <span className="font-bold text-xl text-[#3d5a47]">{formattedTotal}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Checkout Actions */}
        <div className="space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Shipping & Payment</CardTitle>
              <CardDescription>Secure checkout processed by Stripe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-stone-50 rounded-lg text-sm text-stone-600 mb-6">
                <p>
                  <strong>Note:</strong> This is a demo checkout.
                  You will be redirected to Stripe's hosted payment page to complete your purchase securely.
                  Address information will be collected there.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-[#8da399] hover:bg-[#7a8f85] text-white py-6 text-lg transition-colors"
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Lock className="mr-2 h-5 w-5" />
                )}
                Pay Securely
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
