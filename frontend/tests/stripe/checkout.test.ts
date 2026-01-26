// === tests/stripe/checkout.test.ts ===

/**
 * @jest-environment node
 */
import { POST } from '@/app/api/checkout/route'
import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { getUser } from '@/lib/auth/lucia'

// Mocks
jest.mock('@/lib/stripe', () => ({
    stripe: {
        checkout: {
            sessions: {
                create: jest.fn(),
            },
        },
    },
}))

jest.mock('@/lib/db', () => ({
    db: {
        product: {
            findMany: jest.fn(),
        },
    },
}))

jest.mock('@/lib/auth/lucia', () => ({
    getUser: jest.fn(),
}))

describe('Checkout API', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    const mockUser = { id: 'user-123' }
    const mockCart = {
        cartItems: [{ productId: 'prod-1', quantity: 2 }]
    }

    it('returns 401 if unauthenticated', async () => {
        (getUser as jest.Mock).mockResolvedValue({ user: null })

        const req = new Request('http://localhost/api/checkout', {
            method: 'POST',
            body: JSON.stringify(mockCart)
        })
        const res = await POST(req as any)

        expect(res.status).toBe(401)
    })

    it('validates stock and creates session', async () => {
        (getUser as jest.Mock).mockResolvedValue({ user: mockUser })

            // Mock DB product
            ; (db.product.findMany as jest.Mock).mockResolvedValue([
                {
                    id: 'prod-1',
                    name: 'Test Product',
                    priceInCents: 1000,
                    stock: 10,
                    description: 'desc',
                    images: []
                }
            ])

            // Mock Stripe Session
            ; (stripe.checkout.sessions.create as jest.Mock).mockResolvedValue({
                url: 'https://checkout.stripe.com/test'
            })

        const req = new Request('http://localhost/api/checkout', {
            method: 'POST',
            body: JSON.stringify(mockCart)
        })
        const res = await POST(req as any)
        const data = await res.json()

        expect(res.status).toBe(200)
        expect(data.url).toBe('https://checkout.stripe.com/test')
        expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(expect.objectContaining({
            metadata: { userId: 'user-123' },
            line_items: expect.arrayContaining([
                expect.objectContaining({ quantity: 2 })
            ])
        }))
    })

    it('returns error for insufficient stock', async () => {
        (getUser as jest.Mock).mockResolvedValue({ user: mockUser })

            // Mock DB product with low stock
            ; (db.product.findMany as jest.Mock).mockResolvedValue([
                {
                    id: 'prod-1',
                    name: 'Test Product',
                    priceInCents: 1000,
                    stock: 1, // Less than requested 2
                    description: 'desc',
                    images: []
                }
            ])

        const req = new Request('http://localhost/api/checkout', {
            method: 'POST',
            body: JSON.stringify(mockCart)
        })
        const res = await POST(req as any)
        const data = await res.json()

        expect(res.status).toBe(400)
        expect(data.error).toContain('Insufficient stock')
        expect(stripe.checkout.sessions.create).not.toHaveBeenCalled()
    })
})
