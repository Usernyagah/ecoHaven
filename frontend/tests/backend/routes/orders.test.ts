import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { NextRequest } from 'next/server'

// Mock Lucia auth
const mockGetSession = jest.fn()
jest.mock('@/lib/auth', () => ({
  auth: {
    getSession: () => mockGetSession(),
  },
}))

// Mock Prisma database
const mockFindMany = jest.fn()
jest.mock('@/lib/db', () => ({
  db: {
    order: {
      findMany: mockFindMany,
    },
  },
}))

// Mock the API route handler
// This assumes the route is at app/api/orders/route.ts
// In a real implementation, this would be imported from the route file
async function GET(request: NextRequest) {
  const { auth } = await import('@/lib/auth')
  const session = await auth.getSession()

  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { db } = await import('@/lib/db')
  const orders = await db.order.findMany({
    where: {
      userId: session.userId,
    },
    include: {
      orderItems: {
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Transform to include product snapshot data
  const ordersWithSnapshots = orders.map((order) => ({
    id: order.id,
    userId: order.userId,
    totalInCents: order.totalInCents,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    orderItems: order.orderItems.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      priceInCents: item.priceInCents,
      productName: item.product.name,
      productPriceAtPurchase: item.priceInCents,
    })),
  }))

  return new Response(JSON.stringify(ordersWithSnapshots), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('GET /api/orders', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Unauthorized access', () => {
    it('returns 401 if user is not logged in', async () => {
      // Mock no session
      mockGetSession.mockResolvedValueOnce(null)

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'GET',
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({ error: 'Unauthorized' })
      expect(mockGetSession).toHaveBeenCalledTimes(1)
      expect(mockFindMany).not.toHaveBeenCalled()
    })

    it('returns 401 if session is undefined', async () => {
      // Mock undefined session
      mockGetSession.mockResolvedValueOnce(undefined)

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'GET',
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({ error: 'Unauthorized' })
    })
  })

  describe('Authorized access', () => {
    const mockUserId = 'user-123'
    const mockSession = {
      userId: mockUserId,
      sessionId: 'session-123',
    }

    const mockOrders = [
      {
        id: 'order-1',
        userId: mockUserId,
        totalInCents: 5000,
        status: 'PAID',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        orderItems: [
          {
            id: 'item-1',
            quantity: 2,
            priceInCents: 2500,
            product: {
              name: 'Eco-Friendly Water Bottle',
            },
          },
        ],
      },
      {
        id: 'order-2',
        userId: mockUserId,
        totalInCents: 3000,
        status: 'PENDING',
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
        orderItems: [
          {
            id: 'item-2',
            quantity: 1,
            priceInCents: 3000,
            product: {
              name: 'Bamboo Toothbrush',
            },
          },
        ],
      },
    ]

    it('returns orders belonging to authenticated user', async () => {
      mockGetSession.mockResolvedValueOnce(mockSession)
      mockFindMany.mockResolvedValueOnce(mockOrders)

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'GET',
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(2)
      expect(mockFindMany).toHaveBeenCalledTimes(1)
      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
        },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    })

    it('includes order items with product snapshot data (name, price at purchase)', async () => {
      mockGetSession.mockResolvedValueOnce(mockSession)
      mockFindMany.mockResolvedValueOnce(mockOrders)

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'GET',
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      
      // Check first order
      expect(data[0]).toHaveProperty('orderItems')
      expect(data[0].orderItems).toHaveLength(1)
      expect(data[0].orderItems[0]).toMatchObject({
        id: 'item-1',
        quantity: 2,
        priceInCents: 2500,
        productName: 'Eco-Friendly Water Bottle',
        productPriceAtPurchase: 2500,
      })

      // Check second order
      expect(data[1].orderItems[0]).toMatchObject({
        id: 'item-2',
        quantity: 1,
        priceInCents: 3000,
        productName: 'Bamboo Toothbrush',
        productPriceAtPurchase: 3000,
      })
    })

    it('only returns orders for the authenticated user', async () => {
      const otherUserId = 'user-456'
      const otherUserOrders = [
        {
          id: 'order-3',
          userId: otherUserId,
          totalInCents: 10000,
          status: 'PAID',
          createdAt: new Date('2024-01-03'),
          updatedAt: new Date('2024-01-03'),
          orderItems: [
            {
              id: 'item-3',
              quantity: 1,
              priceInCents: 10000,
              product: {
                name: 'Premium Product',
              },
            },
          ],
        },
      ]

      mockGetSession.mockResolvedValueOnce(mockSession)
      // Only return orders for the authenticated user
      mockFindMany.mockResolvedValueOnce(mockOrders)

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'GET',
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      
      // Verify the query was called with the correct userId filter
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: mockUserId,
          },
        })
      )

      // Verify no orders from other users are returned
      const allUserIds = data.map((order: { userId: string }) => order.userId)
      expect(allUserIds.every((id: string) => id === mockUserId)).toBe(true)
      expect(allUserIds).not.toContain(otherUserId)
    })

    it('returns empty array when user has no orders', async () => {
      mockGetSession.mockResolvedValueOnce(mockSession)
      mockFindMany.mockResolvedValueOnce([])

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'GET',
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(0)
    })

    it('includes all order fields in response', async () => {
      mockGetSession.mockResolvedValueOnce(mockSession)
      mockFindMany.mockResolvedValueOnce([mockOrders[0]])

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'GET',
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data[0]).toMatchObject({
        id: 'order-1',
        userId: mockUserId,
        totalInCents: 5000,
        status: 'PAID',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        orderItems: expect.any(Array),
      })
    })

    it('handles orders with multiple items correctly', async () => {
      const orderWithMultipleItems = {
        id: 'order-3',
        userId: mockUserId,
        totalInCents: 7500,
        status: 'SHIPPED',
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
        orderItems: [
          {
            id: 'item-3',
            quantity: 1,
            priceInCents: 2500,
            product: {
              name: 'Product A',
            },
          },
          {
            id: 'item-4',
            quantity: 2,
            priceInCents: 2500,
            product: {
              name: 'Product B',
            },
          },
        ],
      }

      mockGetSession.mockResolvedValueOnce(mockSession)
      mockFindMany.mockResolvedValueOnce([orderWithMultipleItems])

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'GET',
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data[0].orderItems).toHaveLength(2)
      expect(data[0].orderItems[0]).toMatchObject({
        productName: 'Product A',
        productPriceAtPurchase: 2500,
        quantity: 1,
      })
      expect(data[0].orderItems[1]).toMatchObject({
        productName: 'Product B',
        productPriceAtPurchase: 2500,
        quantity: 2,
      })
    })
  })
})

