// === app/checkout/success/page.tsx ===

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

export default function CheckoutSuccessPage({
    searchParams,
}: {
    searchParams: { session_id?: string }
}) {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center space-y-6">
            <div className="rounded-full bg-green-100 p-6">
                <CheckCircle2 className="w-16 h-16 text-green-600" />
            </div>

            <div className="space-y-2">
                <h1 className="text-3xl font-serif text-[#2c3e34]">Order Confirmed!</h1>
                <p className="text-muted-foreground max-w-md mx-auto">
                    Thank you for shopping sustainably with EcoHaven. Your order has been placed successfully.
                </p>
                <p className="text-sm font-mono text-stone-500">
                    Session ID: {searchParams.session_id}
                </p>
            </div>

            <div className="flex gap-4 pt-4">
                <Link href="/">
                    <Button variant="outline">Continue Shopping</Button>
                </Link>
                <Link href="/admin/orders">
                    <Button className="bg-[#8da399] hover:bg-[#7a8f85]">View Orders</Button>
                </Link>
            </div>
        </div>
    )
}
