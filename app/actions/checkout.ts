'use server'

import Stripe from 'stripe'
import { z } from 'zod'
import { db } from '@/lib/db'

// Initialize Stripe with test key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-11-20.acacia',
})

// Zod schema for cart item validation
const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be positive'),
})

const createCheckoutSessionSchema = z.object({
  cartItems: z.array(cartItemSchema).min(1, 'Cart must contain at least one item'),
  userId: z.string().min(1, 'User ID is required'),
})

export async function createCheckoutSession(input: {
  cartItems: Array<{ productId: string; quantity: number }>
  userId: string
}) {
  try {
    // Validate input
    const validatedData = createCheckoutSessionSchema.parse(input)

    // Fetch all products from the cart
    const productIds = validatedData.cartItems.map((item) => item.productId)
    const products = await db.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    })

    // Check if all products exist
    if (products.length !== productIds.length) {
      const foundIds = new Set(products.map((p) => p.id))
      const missingIds = productIds.filter((id) => !foundIds.has(id))
      return {
        success: false,
        error: `Products not found: ${missingIds.join(', ')}`,
      }
    }

    // Create a map for quick lookup
    const productMap = new Map(products.map((p) => [p.id, p]))

    // Validate stock and prepare line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []
    const orderItems: Array<{ productId: string; quantity: number; priceInCents: number }> = []
    let totalInCents = 0

    for (const cartItem of validatedData.cartItems) {
      const product = productMap.get(cartItem.productId)

      if (!product) {
        return {
          success: false,
          error: `Product not found: ${cartItem.productId}`,
        }
      }

      // Validate stock
      if (product.stock < cartItem.quantity) {
        return {
          success: false,
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${cartItem.quantity}`,
        }
      }

      // Add to Stripe line items
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: product.description,
            images: product.images.length > 0 ? product.images : undefined,
          },
          unit_amount: product.priceInCents,
        },
        quantity: cartItem.quantity,
      })

      // Track for order creation
      orderItems.push({
        productId: product.id,
        quantity: cartItem.quantity,
        priceInCents: product.priceInCents,
      })

      totalInCents += product.priceInCents * cartItem.quantity
    }

    // Create pending order in database
    const order = await db.order.create({
      data: {
        userId: validatedData.userId,
        totalInCents,
        status: 'PENDING',
        orderItems: {
          create: orderItems,
        },
      },
    })

    // Get base URL for success and cancel URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url: `${baseUrl}/checkout?canceled=true`,
      metadata: {
        orderId: order.id,
        userId: validatedData.userId,
      },
    })

    return {
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
        orderId: order.id,
      },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => e.message).join(', '),
      }
    }

    if (error instanceof Stripe.errors.StripeError) {
      return {
        success: false,
        error: `Stripe error: ${error.message}`,
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create checkout session',
    }
  }
}

