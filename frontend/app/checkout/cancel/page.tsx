// === app/checkout/cancel/page.tsx ===

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { XCircle } from 'lucide-react'

export default function CheckoutCancelPage() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center space-y-6">
            <div className="rounded-full bg-red-100 p-6">
                <XCircle className="w-16 h-16 text-red-600" />
            </div>

            <div className="space-y-2">
                <h1 className="text-3xl font-serif text-[#2c3e34]">Order Cancelled</h1>
                <p className="text-muted-foreground max-w-md mx-auto">
                    Your payment was not processed. No charges were made.
                </p>
            </div>

            <div className="pt-4">
                <Link href="/checkout">
                    <Button variant="default" className="bg-[#8da399] hover:bg-[#7a8f85]">
                        Return to Checkout
                    </Button>
                </Link>
            </div>
        </div>
    )
}
