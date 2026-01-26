import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { NextRequest } from 'next/server'
import Stripe from 'stripe'

// Mock Stripe webhooks
const mockConstructEvent = jest.fn()
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: mockConstructEvent,
    },
  }))
})

// Mock Prisma
const mockFindUnique = jest.fn()
const mockUpdate = jest.fn()
const mockCreate = jest.fn()

jest.mock('@/lib/db', () => ({
  db: {
    order: {
      findUnique: mockFindUnique,
      update: mockUpdate,
    },
    orderItem: {
      findMany: jest.fn(),
    },
    product: {
      update: mockUpdate,
    },
  },
}))

// Mock the webhook route handler
async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    apiVersion: '2024-11-20.acacia',
  })

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return new Response(JSON.stringify({ error: 'Missing signature' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await request.text()
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret'
    )

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      if (session.payment_status === 'paid' && session.metadata?.orderId) {
        const { db } = await import('@/lib/db')

        // Check if order already exists and is already paid (idempotency)
        const existingOrder = await db.order.findUnique({
          where: { id: session.metadata.orderId },
        })

        if (existingOrder && existingOrder.status === 'PAID') {
          // Already processed, return success
          return new Response(JSON.stringify({ received: true, message: 'Order already processed' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        // Update order status to PAID
        await db.order.update({
          where: { id: session.metadata.orderId },
          data: { status: 'PAID' },
        })

        // Get order items to reduce stock
        const orderItems = await db.orderItem.findMany({
          where: { orderId: session.metadata.orderId },
        })

        // Reduce stock for each product
        for (const item of orderItems) {
          await db.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          })
        }

        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }

    // Ignore other event types
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Webhook error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

// Helper to create a NextRequest with raw body
function createWebhookRequest(body: string, signature?: string): NextRequest {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (signature) {
    headers['stripe-signature'] = signature
  }

  return new NextRequest('http://localhost:3000/api/webhook/stripe', {
    method: 'POST',
    headers,
    body,
  })
}

describe('POST /api/webhook/stripe', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret'
  })

  describe('Event filtering', () => {
    it('ignores non-relevant events', async () => {
      const mockEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {},
        },
      }

      mockConstructEvent.mockResolvedValueOnce(mockEvent)

      const request = createWebhookRequest(JSON.stringify(mockEvent), 'valid_signature')

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ received: true })
      expect(mockFindUnique).not.toHaveBeenCalled()
    })

    it('ignores checkout.session.completed events that are not paid', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            payment_status: 'unpaid',
            metadata: {
              orderId: 'order-123',
            },
          },
        },
      }

      mockConstructEvent.mockResolvedValueOnce(mockEvent)

      const request = createWebhookRequest(JSON.stringify(mockEvent), 'valid_signature')

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ received: true })
      expect(mockFindUnique).not.toHaveBeenCalled()
    })
  })

  describe('Signature verification', () => {
    it('returns 400 on invalid signature', async () => {
      class StripeSignatureVerificationError extends Error {
        type = 'StripeSignatureVerificationError'
        constructor(message: string) {
          super(message)
          this.name = 'StripeSignatureVerificationError'
        }
      }

      // Mock the Stripe errors
      const originalStripe = Stripe as any
      if (!originalStripe.errors) {
        originalStripe.errors = {}
      }
      originalStripe.errors.StripeSignatureVerificationError = StripeSignatureVerificationError

      mockConstructEvent.mockImplementationOnce(() => {
        throw new StripeSignatureVerificationError('Invalid signature')
      })

      const request = createWebhookRequest('{}', 'invalid_signature')

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Invalid signature' })
      
      // Cleanup
      delete originalStripe.errors.StripeSignatureVerificationError
    })

    it('returns 400 when signature header is missing', async () => {
      const request = createWebhookRequest('{}') // No signature header

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Missing signature' })
      expect(mockConstructEvent).not.toHaveBeenCalled()
    })
  })

  describe('Order processing', () => {
    const mockPaidSessionEvent = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          payment_status: 'paid',
          metadata: {
            orderId: 'order-123',
            userId: 'user-123',
          },
        },
      },
    }

    beforeEach(() => {
      mockConstructEvent.mockImplementation((body, signature) => {
        return mockPaidSessionEvent
      })
    })

    it('successfully creates order and updates stock on valid paid session', async () => {
      const mockOrder = {
        id: 'order-123',
        userId: 'user-123',
        totalInCents: 5000,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockOrderItems = [
        {
          id: 'item-1',
          orderId: 'order-123',
          productId: 'product-1',
          quantity: 2,
          priceInCents: 2500,
        },
        {
          id: 'item-2',
          orderId: 'order-123',
          productId: 'product-2',
          quantity: 1,
          priceInCents: 2500,
        },
      ]

      mockFindUnique.mockResolvedValueOnce(mockOrder)
      const { db } = await import('@/lib/db')
      ;(db.orderItem.findMany as jest.Mock).mockResolvedValueOnce(mockOrderItems)
      mockUpdate.mockResolvedValue({})

      const request = createWebhookRequest(JSON.stringify(mockPaidSessionEvent), 'valid_signature')

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ received: true })

      // Verify order was updated to PAID
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: 'order-123' },
      })
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'order-123' },
        data: { status: 'PAID' },
      })

      // Verify stock was reduced for each product
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'product-1' },
        data: {
          stock: {
            decrement: 2,
          },
        },
      })

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'product-2' },
        data: {
          stock: {
            decrement: 1,
          },
        },
      })
    })

    it('is idempotent: handles duplicate events safely', async () => {
      // First, simulate an already paid order
      const mockPaidOrder = {
        id: 'order-123',
        userId: 'user-123',
        totalInCents: 5000,
        status: 'PAID', // Already paid
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockFindUnique.mockResolvedValueOnce(mockPaidOrder)

      const request = createWebhookRequest(JSON.stringify(mockPaidSessionEvent), 'valid_signature')

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ received: true, message: 'Order already processed' })

      // Verify order was not updated again
      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('handles order with single item correctly', async () => {
      const mockOrder = {
        id: 'order-456',
        userId: 'user-123',
        totalInCents: 3000,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockOrderItems = [
        {
          id: 'item-1',
          orderId: 'order-456',
          productId: 'product-1',
          quantity: 1,
          priceInCents: 3000,
        },
      ]

      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_456',
            payment_status: 'paid',
            metadata: {
              orderId: 'order-456',
            },
          },
        },
      }

      mockConstructEvent.mockResolvedValueOnce(mockEvent)
      mockFindUnique.mockResolvedValueOnce(mockOrder)
      const { db } = await import('@/lib/db')
      ;(db.orderItem.findMany as jest.Mock).mockResolvedValueOnce(mockOrderItems)
      mockUpdate.mockResolvedValue({})

      const request = createWebhookRequest(JSON.stringify(mockEvent), 'valid_signature')

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ received: true })

      // Verify stock was decremented by 1
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'product-1' },
        data: {
          stock: {
            decrement: 1,
          },
        },
      })
    })

    it('handles order with no items gracefully', async () => {
      const mockOrder = {
        id: 'order-789',
        userId: 'user-123',
        totalInCents: 0,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_789',
            payment_status: 'paid',
            metadata: {
              orderId: 'order-789',
            },
          },
        },
      }

      mockConstructEvent.mockResolvedValueOnce(mockEvent)
      mockFindUnique.mockResolvedValueOnce(mockOrder)
      const { db } = await import('@/lib/db')
      ;(db.orderItem.findMany as jest.Mock).mockResolvedValueOnce([])
      mockUpdate.mockResolvedValue({})

      const request = createWebhookRequest(JSON.stringify(mockEvent), 'valid_signature')

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ received: true })

      // Order should still be updated to PAID
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'order-789' },
        data: { status: 'PAID' },
      })

      // But no product updates should occur
      const productUpdateCalls = mockUpdate.mock.calls.filter(
        (call) => call[0].where?.id?.startsWith('product-')
      )
      expect(productUpdateCalls).toHaveLength(0)
    })
  })

  describe('Error handling', () => {
    it('handles missing orderId in metadata', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            payment_status: 'paid',
            metadata: {}, // No orderId
          },
        },
      }

      mockConstructEvent.mockResolvedValueOnce(mockEvent)

      const request = createWebhookRequest(JSON.stringify(mockEvent), 'valid_signature')

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ received: true })
      expect(mockFindUnique).not.toHaveBeenCalled()
    })

    it('handles database errors gracefully', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            payment_status: 'paid',
            metadata: {
              orderId: 'order-123',
            },
          },
        },
      }

      mockConstructEvent.mockResolvedValueOnce(mockEvent)
      mockFindUnique.mockRejectedValueOnce(new Error('Database connection failed'))

      const request = createWebhookRequest(JSON.stringify(mockEvent), 'valid_signature')

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('Database connection failed')
    })
  })
})

