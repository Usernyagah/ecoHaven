// === app/api/checkout/route.ts ===

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { getUser } from '@/lib/auth/lucia'
import { z } from 'zod'

const cartItemSchema = z.object({
    productId: z.string(),
    quantity: z.number().min(1),
})

const checkoutSchema = z.object({
    cartItems: z.array(cartItemSchema).min(1),
    userId: z.string().min(1, 'User ID is required'), // Client should send this or we fetch from session
})

export async function POST(req: NextRequest) {
    try {
        const { user } = await getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { cartItems } = checkoutSchema.parse({
            ...body,
            userId: user.id
        })

        // 1. Validate Stock & Fetch Product Details
        const productIds = cartItems.map((item) => item.productId)
        const products = await db.product.findMany({
            where: { id: { in: productIds } },
        })

        const line_items = []

        for (const item of cartItems) {
            const product = products.find((p) => p.id === item.productId)

            if (!product) {
                return NextResponse.json(
                    { error: `Product not found: ${item.productId}` },
                    { status: 400 }
                )
            }

            if (product.stock < item.quantity) {
                return NextResponse.json(
                    { error: `Insufficient stock for product: ${product.name}` },
                    { status: 400 }
                )
            }

            // 2. Prepare Stripe Line Items
            // We embed the productId in metadata to recover it in the webhook
            line_items.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.name,
                        images: product.images.length > 0 ? product.images : undefined,
                        description: product.description.substring(0, 100), // optional truncation
                        metadata: {
                            productId: product.id,
                        },
                    },
                    unit_amount: product.priceInCents,
                },
                quantity: item.quantity,
            })
        }

        // 3. Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
            metadata: {
                userId: user.id,
                // We could also store order metadata here, but reliance on line_items in webhook is cleaner for inventory
            },
        })

        return NextResponse.json({ url: session.url })

    } catch (error) {
        console.error('[CHECKOUT_ERROR]', error)
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
        }
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
