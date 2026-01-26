import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import Stripe from 'stripe'
import { createCheckoutSession } from '@/app/actions/checkout'

// Mock Stripe
const mockStripeCheckoutSessionsCreate = jest.fn()
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: mockStripeCheckoutSessionsCreate,
      },
    },
    errors: {
      StripeError: class StripeError extends Error {
        constructor(message: string) {
          super(message)
          this.name = 'StripeError'
        }
      },
    },
  }))
})

// Mock Prisma
const mockFindMany = jest.fn()
const mockCreate = jest.fn()

jest.mock('@/lib/db', () => ({
  db: {
    product: {
      findMany: mockFindMany,
    },
    order: {
      create: mockCreate,
    },
  },
}))

// Mock environment variables
const originalEnv = process.env

describe('createCheckoutSession', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env = {
      ...originalEnv,
      STRIPE_SECRET_KEY: 'sk_test_mock_key',
      NEXT_PUBLIC_BASE_URL: 'http://localhost:3000',
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('Product validation', () => {
    it('throws error if product not found', async () => {
      const cartItems = [
        { productId: 'non-existent-product', quantity: 1 },
      ]

      mockFindMany.mockResolvedValueOnce([])

      const result = await createCheckoutSession({
        cartItems,
        userId: 'user-123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Products not found')
      expect(result.error).toContain('non-existent-product')
      expect(mockStripeCheckoutSessionsCreate).not.toHaveBeenCalled()
    })

    it('throws error if some products not found', async () => {
      const cartItems = [
        { productId: 'product-1', quantity: 1 },
        { productId: 'product-2', quantity: 2 },
        { productId: 'non-existent', quantity: 1 },
      ]

      const existingProducts = [
        {
          id: 'product-1',
          name: 'Product 1',
          description: 'Description 1',
          priceInCents: 2000,
          stock: 10,
          images: ['https://example.com/img1.jpg'],
        },
        {
          id: 'product-2',
          name: 'Product 2',
          description: 'Description 2',
          priceInCents: 3000,
          stock: 20,
          images: ['https://example.com/img2.jpg'],
        },
      ]

      mockFindMany.mockResolvedValueOnce(existingProducts)

      const result = await createCheckoutSession({
        cartItems,
        userId: 'user-123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Products not found')
      expect(result.error).toContain('non-existent')
      expect(mockStripeCheckoutSessionsCreate).not.toHaveBeenCalled()
    })
  })

  describe('Stock validation', () => {
    it('throws error if insufficient stock', async () => {
      const cartItems = [
        { productId: 'product-1', quantity: 10 },
      ]

      const products = [
        {
          id: 'product-1',
          name: 'Product 1',
          description: 'Description 1',
          priceInCents: 2000,
          stock: 5, // Only 5 in stock, but requesting 10
          images: ['https://example.com/img1.jpg'],
        },
      ]

      mockFindMany.mockResolvedValueOnce(products)

      const result = await createCheckoutSession({
        cartItems,
        userId: 'user-123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Insufficient stock')
      expect(result.error).toContain('Product 1')
      expect(result.error).toContain('Available: 5')
      expect(result.error).toContain('Requested: 10')
      expect(mockStripeCheckoutSessionsCreate).not.toHaveBeenCalled()
    })

    it('throws error if stock is zero', async () => {
      const cartItems = [
        { productId: 'product-1', quantity: 1 },
      ]

      const products = [
        {
          id: 'product-1',
          name: 'Product 1',
          description: 'Description 1',
          priceInCents: 2000,
          stock: 0,
          images: ['https://example.com/img1.jpg'],
        },
      ]

      mockFindMany.mockResolvedValueOnce(products)

      const result = await createCheckoutSession({
        cartItems,
        userId: 'user-123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Insufficient stock')
      expect(mockStripeCheckoutSessionsCreate).not.toHaveBeenCalled()
    })
  })

  describe('Stripe session creation', () => {
    const mockProducts = [
      {
        id: 'product-1',
        name: 'Eco-Friendly Water Bottle',
        description: 'A sustainable water bottle',
        priceInCents: 2999,
        stock: 50,
        images: ['https://example.com/bottle.jpg'],
      },
      {
        id: 'product-2',
        name: 'Bamboo Toothbrush',
        description: 'Eco-friendly toothbrush',
        priceInCents: 1299,
        stock: 100,
        images: ['https://example.com/toothbrush.jpg'],
      },
    ]

    beforeEach(() => {
      mockFindMany.mockResolvedValue(mockProducts)
    })

    it('creates session with correct line items (price, quantity, name)', async () => {
      const cartItems = [
        { productId: 'product-1', quantity: 2 },
        { productId: 'product-2', quantity: 1 },
      ]

      const mockOrder = {
        id: 'order-123',
        userId: 'user-123',
        totalInCents: 7297, // (2999 * 2) + (1299 * 1)
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockStripeSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/c/pay/cs_test_123',
      }

      mockCreate.mockResolvedValueOnce(mockOrder)
      mockStripeCheckoutSessionsCreate.mockResolvedValueOnce(mockStripeSession)

      const result = await createCheckoutSession({
        cartItems,
        userId: 'user-123',
      })

      expect(result.success).toBe(true)
      expect(result.data).toMatchObject({
        sessionId: 'cs_test_123',
        url: 'https://checkout.stripe.com/c/pay/cs_test_123',
        orderId: 'order-123',
      })

      // Verify Stripe session was created with correct line items
      expect(mockStripeCheckoutSessionsCreate).toHaveBeenCalledTimes(1)
      const stripeCall = mockStripeCheckoutSessionsCreate.mock.calls[0][0]

      expect(stripeCall.line_items).toHaveLength(2)
      
      // Check first line item
      expect(stripeCall.line_items[0]).toMatchObject({
        price_data: {
          currency: 'usd',
          unit_amount: 2999,
          product_data: {
            name: 'Eco-Friendly Water Bottle',
            description: 'A sustainable water bottle',
            images: ['https://example.com/bottle.jpg'],
          },
        },
        quantity: 2,
      })

      // Check second line item
      expect(stripeCall.line_items[1]).toMatchObject({
        price_data: {
          currency: 'usd',
          unit_amount: 1299,
          product_data: {
            name: 'Bamboo Toothbrush',
            description: 'Eco-friendly toothbrush',
            images: ['https://example.com/toothbrush.jpg'],
          },
        },
        quantity: 1,
      })

      // Verify session configuration
      expect(stripeCall.payment_method_types).toEqual(['card'])
      expect(stripeCall.mode).toBe('payment')
      expect(stripeCall.metadata).toMatchObject({
        orderId: 'order-123',
        userId: 'user-123',
      })
    })

    it('creates session with correct line items when product has no images', async () => {
      const productsWithoutImages = [
        {
          id: 'product-1',
          name: 'Product Without Images',
          description: 'No images',
          priceInCents: 2000,
          stock: 10,
          images: [],
        },
      ]

      mockFindMany.mockResolvedValueOnce(productsWithoutImages)

      const cartItems = [
        { productId: 'product-1', quantity: 1 },
      ]

      const mockOrder = {
        id: 'order-456',
        userId: 'user-123',
        totalInCents: 2000,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockStripeSession = {
        id: 'cs_test_456',
        url: 'https://checkout.stripe.com/c/pay/cs_test_456',
      }

      mockCreate.mockResolvedValueOnce(mockOrder)
      mockStripeCheckoutSessionsCreate.mockResolvedValueOnce(mockStripeSession)

      const result = await createCheckoutSession({
        cartItems,
        userId: 'user-123',
      })

      expect(result.success).toBe(true)

      const stripeCall = mockStripeCheckoutSessionsCreate.mock.calls[0][0]
      expect(stripeCall.line_items[0].price_data.product_data.images).toBeUndefined()
    })

    it('returns session.url', async () => {
      const cartItems = [
        { productId: 'product-1', quantity: 1 },
      ]

      const mockOrder = {
        id: 'order-789',
        userId: 'user-123',
        totalInCents: 2999,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockStripeSession = {
        id: 'cs_test_789',
        url: 'https://checkout.stripe.com/c/pay/cs_test_789',
      }

      mockCreate.mockResolvedValueOnce(mockOrder)
      mockStripeCheckoutSessionsCreate.mockResolvedValueOnce(mockStripeSession)

      const result = await createCheckoutSession({
        cartItems,
        userId: 'user-123',
      })

      expect(result.success).toBe(true)
      expect(result.data?.url).toBe('https://checkout.stripe.com/c/pay/cs_test_789')
    })

    it('creates pending order in database before Stripe session', async () => {
      const cartItems = [
        { productId: 'product-1', quantity: 2 },
      ]

      const mockOrder = {
        id: 'order-999',
        userId: 'user-123',
        totalInCents: 5998,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockStripeSession = {
        id: 'cs_test_999',
        url: 'https://checkout.stripe.com/c/pay/cs_test_999',
      }

      mockCreate.mockResolvedValueOnce(mockOrder)
      mockStripeCheckoutSessionsCreate.mockResolvedValueOnce(mockStripeSession)

      await createCheckoutSession({
        cartItems,
        userId: 'user-123',
      })

      // Verify order was created with correct data
      expect(mockCreate).toHaveBeenCalledTimes(1)
      const orderCall = mockCreate.mock.calls[0][0]

      expect(orderCall.data).toMatchObject({
        userId: 'user-123',
        totalInCents: 5998,
        status: 'PENDING',
        orderItems: {
          create: [
            {
              productId: 'product-1',
              quantity: 2,
              priceInCents: 2999,
            },
          ],
        },
      })

      // Verify Stripe was called after order creation
      expect(mockStripeCheckoutSessionsCreate).toHaveBeenCalledTimes(1)
    })
  })

  describe('Error handling', () => {
    it('handles Stripe errors', async () => {
      const cartItems = [
        { productId: 'product-1', quantity: 1 },
      ]

      const products = [
        {
          id: 'product-1',
          name: 'Product 1',
          description: 'Description 1',
          priceInCents: 2000,
          stock: 10,
          images: [],
        },
      ]

      mockFindMany.mockResolvedValueOnce(products)

      const mockOrder = {
        id: 'order-123',
        userId: 'user-123',
        totalInCents: 2000,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockCreate.mockResolvedValueOnce(mockOrder)

      const stripeError = new Error('Stripe API error')
      stripeError.name = 'StripeError'
      mockStripeCheckoutSessionsCreate.mockRejectedValueOnce(stripeError)

      const result = await createCheckoutSession({
        cartItems,
        userId: 'user-123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Stripe error')
    })

    it('handles validation errors', async () => {
      const result = await createCheckoutSession({
        cartItems: [], // Empty cart
        userId: 'user-123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Cart must contain at least one item')
    })

    it('handles missing userId', async () => {
      const result = await createCheckoutSession({
        cartItems: [{ productId: 'product-1', quantity: 1 }],
        userId: '', // Empty userId
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('User ID is required')
    })
  })
})

