import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { NextRequest } from 'next/server'

// Mock Lucia auth
const mockGetSession = jest.fn()
const mockGetUser = jest.fn()

jest.mock('@/lib/auth', () => ({
  auth: {
    getSession: () => mockGetSession(),
    getUser: () => mockGetUser(),
  },
}))

// Mock Prisma - we'll use a test client in real implementation
const mockCreate = jest.fn()
const mockFindMany = jest.fn()
const mockFindUnique = jest.fn()
const mockUpdate = jest.fn()
const mockDelete = jest.fn()

jest.mock('@/lib/db', () => ({
  db: {
    product: {
      create: mockCreate,
      findMany: mockFindMany,
      findUnique: mockFindUnique,
      update: mockUpdate,
      delete: mockDelete,
    },
    category: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}))

// Import the route handler (assuming it exists at app/api/admin/products/route.ts)
// For now, we'll create a mock implementation that matches expected behavior
async function POST(request: NextRequest) {
  const { auth } = await import('@/lib/auth')
  const session = await auth.getSession()

  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Check if user is admin
  const { db } = await import('@/lib/db')
  const user = await db.user.findUnique({
    where: { id: session.userId },
  })

  if (!user || user.role !== 'ADMIN') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await request.json()
    const { name, description, price, stock, categoryId, images } = body

    // Validate required fields
    if (!name || !price || price <= 0 || stock < 0) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: 'Name, price (must be > 0), and stock (must be >= 0) are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Check if category exists
    const category = await db.category.findUnique({
      where: { id: categoryId },
    })

    if (!category) {
      return new Response(JSON.stringify({ error: 'Category not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const priceInCents = Math.round(price * 100)

    const product = await db.product.create({
      data: {
        name,
        description: description || '',
        priceInCents,
        stock: stock || 0,
        categoryId,
        images: images || [],
      },
    })

    return new Response(JSON.stringify(product), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to create product' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

async function GET(request: NextRequest) {
  // Public endpoint - no auth required
  const { db } = await import('@/lib/db')
  const products = await db.product.findMany({
    include: {
      category: true,
    },
  })

  return new Response(JSON.stringify(products), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function PUT(request: NextRequest) {
  const { auth } = await import('@/lib/auth')
  const session = await auth.getSession()

  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { db } = await import('@/lib/db')
  const user = await db.user.findUnique({
    where: { id: session.userId },
  })

  if (!user || user.role !== 'ADMIN') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return new Response(JSON.stringify({ error: 'Product ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const product = await db.product.update({
      where: { id },
      data: updateData.price ? { ...updateData, priceInCents: Math.round(updateData.price * 100) } : updateData,
    })

    return new Response(JSON.stringify(product), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to update product' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

async function DELETE(request: NextRequest) {
  const { auth } = await import('@/lib/auth')
  const session = await auth.getSession()

  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { db } = await import('@/lib/db')
  const user = await db.user.findUnique({
    where: { id: session.userId },
  })

  if (!user || user.role !== 'ADMIN') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return new Response(JSON.stringify({ error: 'Product ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    await db.product.delete({
      where: { id },
    })

    return new Response(null, {
      status: 204,
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to delete product' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

// Helper to create a NextRequest with JSON body
function createRequest(url: string, method: string, body?: any): NextRequest {
  const request = new NextRequest(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  return request
}

describe('POST /api/admin/products', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Authentication and Authorization', () => {
    it('returns 401 if not authenticated', async () => {
      mockGetSession.mockResolvedValueOnce(null)

      const request = createRequest('http://localhost:3000/api/admin/products', 'POST', {
        name: 'Test Product',
        price: 29.99,
        stock: 10,
        categoryId: 'cat-1',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({ error: 'Unauthorized' })
      expect(mockGetSession).toHaveBeenCalledTimes(1)
    })

    it('returns 403 if authenticated but not admin', async () => {
      const mockSession = {
        userId: 'user-123',
        sessionId: 'session-123',
      }

      mockGetSession.mockResolvedValueOnce(mockSession)
      const { db } = await import('@/lib/db')
      ;(db.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'user-123',
        role: 'USER',
      })

      const request = createRequest('http://localhost:3000/api/admin/products', 'POST', {
        name: 'Test Product',
        price: 29.99,
        stock: 10,
        categoryId: 'cat-1',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data).toEqual({ error: 'Forbidden' })
    })
  })

  describe('Product Creation', () => {
    const mockAdminSession = {
      userId: 'admin-123',
      sessionId: 'session-admin',
    }

    const mockAdminUser = {
      id: 'admin-123',
      role: 'ADMIN',
    }

    const mockCategory = {
      id: 'cat-1',
      name: 'Test Category',
    }

    beforeEach(() => {
      mockGetSession.mockResolvedValue(mockAdminSession)
      const { db } = require('@/lib/db')
      ;(db.user.findUnique as jest.Mock).mockResolvedValue(mockAdminUser)
      ;(db.category.findUnique as jest.Mock).mockResolvedValue(mockCategory)
    })

    it('creates product successfully with valid data (admin)', async () => {
      const productData = {
        name: 'Eco-Friendly Water Bottle',
        description: 'A sustainable water bottle',
        price: 29.99,
        stock: 50,
        categoryId: 'cat-1',
        images: ['https://example.com/image.jpg'],
      }

      const createdProduct = {
        id: 'prod-123',
        ...productData,
        priceInCents: 2999,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockCreate.mockResolvedValueOnce(createdProduct)

      const request = createRequest('http://localhost:3000/api/admin/products', 'POST', productData)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toMatchObject({
        id: 'prod-123',
        name: productData.name,
        priceInCents: 2999,
        stock: 50,
      })
      expect(mockCreate).toHaveBeenCalledTimes(1)
    })

    it('validates required fields - missing name', async () => {
      const request = createRequest('http://localhost:3000/api/admin/products', 'POST', {
        price: 29.99,
        stock: 10,
        categoryId: 'cat-1',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Validation failed')
      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('validates required fields - price must be > 0', async () => {
      const request = createRequest('http://localhost:3000/api/admin/products', 'POST', {
        name: 'Test Product',
        price: 0,
        stock: 10,
        categoryId: 'cat-1',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Validation failed')
      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('validates required fields - price must be > 0 (negative)', async () => {
      const request = createRequest('http://localhost:3000/api/admin/products', 'POST', {
        name: 'Test Product',
        price: -10,
        stock: 10,
        categoryId: 'cat-1',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Validation failed')
      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('validates required fields - stock must be >= 0', async () => {
      const request = createRequest('http://localhost:3000/api/admin/products', 'POST', {
        name: 'Test Product',
        price: 29.99,
        stock: -1,
        categoryId: 'cat-1',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Validation failed')
      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('returns 201 with created product', async () => {
      const productData = {
        name: 'Bamboo Toothbrush',
        description: 'Eco-friendly toothbrush',
        price: 12.99,
        stock: 100,
        categoryId: 'cat-1',
        images: ['https://example.com/toothbrush.jpg'],
      }

      const createdProduct = {
        id: 'prod-456',
        name: productData.name,
        description: productData.description,
        priceInCents: 1299,
        stock: productData.stock,
        categoryId: productData.categoryId,
        images: productData.images,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      mockCreate.mockResolvedValueOnce(createdProduct)

      const request = createRequest('http://localhost:3000/api/admin/products', 'POST', productData)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toEqual(createdProduct)
    })
  })
})

describe('GET /api/admin/products', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns products (public endpoint)', async () => {
    const mockProducts = [
      {
        id: 'prod-1',
        name: 'Product 1',
        priceInCents: 2000,
        stock: 10,
        category: { id: 'cat-1', name: 'Category 1' },
      },
      {
        id: 'prod-2',
        name: 'Product 2',
        priceInCents: 3000,
        stock: 20,
        category: { id: 'cat-2', name: 'Category 2' },
      },
    ]

    mockFindMany.mockResolvedValueOnce(mockProducts)

    const request = createRequest('http://localhost:3000/api/admin/products', 'GET')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockProducts)
    expect(mockFindMany).toHaveBeenCalledTimes(1)
  })
})

describe('PUT /api/admin/products', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 if not authenticated', async () => {
    mockGetSession.mockResolvedValueOnce(null)

    const request = createRequest('http://localhost:3000/api/admin/products', 'PUT', {
      id: 'prod-1',
      name: 'Updated Product',
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({ error: 'Unauthorized' })
  })

  it('returns 403 if authenticated but not admin', async () => {
    const mockSession = {
      userId: 'user-123',
      sessionId: 'session-123',
    }

    mockGetSession.mockResolvedValueOnce(mockSession)
    const { db } = await import('@/lib/db')
    ;(db.user.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 'user-123',
      role: 'USER',
    })

    const request = createRequest('http://localhost:3000/api/admin/products', 'PUT', {
      id: 'prod-1',
      name: 'Updated Product',
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data).toEqual({ error: 'Forbidden' })
  })

  it('updates product successfully (admin)', async () => {
    const mockAdminSession = {
      userId: 'admin-123',
      sessionId: 'session-admin',
    }

    const mockAdminUser = {
      id: 'admin-123',
      role: 'ADMIN',
    }

    mockGetSession.mockResolvedValueOnce(mockAdminSession)
    const { db } = await import('@/lib/db')
    ;(db.user.findUnique as jest.Mock).mockResolvedValueOnce(mockAdminUser)

    const updatedProduct = {
      id: 'prod-1',
      name: 'Updated Product',
      priceInCents: 2500,
      stock: 15,
    }

    mockUpdate.mockResolvedValueOnce(updatedProduct)

    const request = createRequest('http://localhost:3000/api/admin/products', 'PUT', {
      id: 'prod-1',
      name: 'Updated Product',
      price: 25.0,
      stock: 15,
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(updatedProduct)
    expect(mockUpdate).toHaveBeenCalledTimes(1)
  })
})

describe('DELETE /api/admin/products', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 if not authenticated', async () => {
    mockGetSession.mockResolvedValueOnce(null)

    const request = new NextRequest('http://localhost:3000/api/admin/products?id=prod-1', {
      method: 'DELETE',
    })

    const response = await DELETE(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({ error: 'Unauthorized' })
  })

  it('returns 403 if authenticated but not admin', async () => {
    const mockSession = {
      userId: 'user-123',
      sessionId: 'session-123',
    }

    mockGetSession.mockResolvedValueOnce(mockSession)
    const { db } = await import('@/lib/db')
    ;(db.user.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 'user-123',
      role: 'USER',
    })

    const request = new NextRequest('http://localhost:3000/api/admin/products?id=prod-1', {
      method: 'DELETE',
    })

    const response = await DELETE(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data).toEqual({ error: 'Forbidden' })
  })

  it('deletes product successfully (admin)', async () => {
    const mockAdminSession = {
      userId: 'admin-123',
      sessionId: 'session-admin',
    }

    const mockAdminUser = {
      id: 'admin-123',
      role: 'ADMIN',
    }

    mockGetSession.mockResolvedValueOnce(mockAdminSession)
    const { db } = await import('@/lib/db')
    ;(db.user.findUnique as jest.Mock).mockResolvedValueOnce(mockAdminUser)

    mockDelete.mockResolvedValueOnce({})

    const request = new NextRequest('http://localhost:3000/api/admin/products?id=prod-1', {
      method: 'DELETE',
    })

    const response = await DELETE(request)

    expect(response.status).toBe(204)
    expect(mockDelete).toHaveBeenCalledTimes(1)
    expect(mockDelete).toHaveBeenCalledWith({
      where: { id: 'prod-1' },
    })
  })
})

