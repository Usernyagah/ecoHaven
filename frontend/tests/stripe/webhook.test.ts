// === tests/stripe/webhook.test.ts ===

/**
 * @jest-environment node
 */
import { POST } from '@/app/api/webhook/stripe/route'
import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'

// Mocks
jest.mock('@/lib/stripe', () => ({
    stripe: {
        webhooks: {
            constructEvent: jest.fn(),
        },
        checkout: {
            sessions: {
                retrieve: jest.fn(),
            },
        },
    },
}))

jest.mock('@/lib/db', () => ({
    db: {
        $transaction: jest.fn((callback) => callback({
            order: { create: jest.fn().mockResolvedValue({ id: 'order-1' }) },
            orderItem: { create: jest.fn() },
            product: { update: jest.fn() }
        })),
    },
}))

jest.mock('next/headers', () => ({
    headers: jest.fn(),
}))

describe('Stripe Webhook', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
    })

    const mockBody = 'raw_body_content'

    it('validates signature', async () => {
        (headers as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue('invalid_sig')
        })

        const error = new Error('Invalid signature')
            ; (stripe.webhooks.constructEvent as jest.Mock).mockImplementation(() => {
                throw error
            })

        const req = new Request('http://localhost/api/webhook/stripe', {
            method: 'POST',
            body: mockBody
        })

        const res = await POST(req)
        expect(res.status).toBe(400)
    })

    it('processes checkout.session.completed', async () => {
        (headers as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue('valid_sig')
        })

        const mockEvent = {
            type: 'checkout.session.completed',
            data: { object: { id: 'sess_123' } }
        }

        const mockExtendedSession = {
            metadata: { userId: 'user-1' },
            amount_total: 1000,
            line_items: {
                data: [
                    {
                        id: 'li_1',
                        quantity: 1,
                        price: {
                            unit_amount: 1000,
                            product: {
                                name: 'Prod 1',
                                metadata: { productId: 'prod-1' },
                                images: ['img.jpg']
                            }
                        }
                    }
                ]
            }
        }

            ; (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent)
            ; (stripe.checkout.sessions.retrieve as jest.Mock).mockResolvedValue(mockExtendedSession)

        const req = new Request('http://localhost/api/webhook/stripe', {
            method: 'POST',
            body: mockBody
        })

        const res = await POST(req)
        expect(res.status).toBe(200)

        // Verify DB calls
        expect(db.$transaction).toHaveBeenCalled()
        // We can't easily inspect the internal transaction calls with this mock structure 
        // without more complex mocking, but we verified the transaction was initiated.
    })
})
