// === app/api/webhook/stripe/route.ts ===

import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import Stripe from 'stripe'

export async function POST(req: Request) {
    const body = await req.text()
    const signature = (await headers()).get('stripe-signature') as string

    let event: Stripe.Event

    try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            throw new Error("Missing STRIPE_WEBHOOK_SECRET")
        }
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        )
    } catch (error: any) {
        console.error(`[WEBHOOK_ERROR] Signature verification failed: ${error.message}`)
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session

        // Retrieve the session with line_items expanded to get product details
        const extendedSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ['line_items.data.price.product'],
        })

        const userId = session.metadata?.userId
        const lineItems = extendedSession.line_items?.data

        if (!userId || !lineItems) {
            console.error('[WEBHOOK_ERROR] Missing userId or lineItems')
            return new NextResponse('Invalid session data', { status: 400 })
        }

        try {
            // Use transaction to ensure order creation and stock update happen atomically
            await db.$transaction(async (tx) => {
                // 1. Create Order
                const order = await tx.order.create({
                    data: {
                        userId,
                        totalInCents: session.amount_total || 0,
                        status: 'PAID',
                        // Default address could be added here if we parsed shipping_details
                    },
                })

                // 2. Create OrderItems & Update Stock
                for (const item of lineItems) {
                    const product = item.price?.product as Stripe.Product
                    const quantity = item.quantity || 1
                    const productId = product.metadata.productId // Recovered from checkout creation
                    const price = item.price?.unit_amount || 0

                    if (!productId) {
                        console.error(`[WEBHOOK_ERROR] Missing productId in metadata for item ${item.id}`)
                        continue
                    }

                    // Create OrderItem snapshot
                    await tx.orderItem.create({
                        data: {
                            orderId: order.id,
                            productId: productId,
                            quantity: quantity,
                            priceInCents: price,
                            productName: product.name,
                            productImageUrl: product.images?.[0] || null,
                        },
                    })

                    // Decrement Stock
                    await tx.product.update({
                        where: { id: productId },
                        data: {
                            stock: {
                                decrement: quantity,
                            },
                        },
                    })
                }
            })

            console.log(`[WEBHOOK] Order created for user ${userId}`)

        } catch (error) {
            console.error('[WEBHOOK_ERROR] DB Transaction failed:', error)
            return new NextResponse('Database Error', { status: 500 })
        }
    }

    return new NextResponse(null, { status: 200 })
}
