// === tests/stripe/components.test.tsx ===

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import CheckoutPage from '@/app/checkout/page'
import CheckoutSuccessPage from '@/app/checkout/success/page'

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush
    })
}))

// Mock fetch
global.fetch = jest.fn()

describe('Checkout Pages', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Checkout Page', () => {
        it('renders cart summary info', () => {
            render(<CheckoutPage />)
            expect(screen.getByText(/Order Summary/i)).toBeInTheDocument()
            expect(screen.getByText(/Bamboo Toothbrush/i)).toBeInTheDocument()
        })

        it('triggers checkout API on button click', async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ url: 'https://stripe.com/checkout' })
            })

            render(<CheckoutPage />)

            const payButton = screen.getByRole('button', { name: /Pay Securely/i })
            fireEvent.click(payButton)

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith('/api/checkout', expect.any(Object))
                expect(mockPush).toHaveBeenCalledWith('https://stripe.com/checkout')
            })
        })

        it('handles API errors', async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: false,
                json: () => Promise.resolve({ error: 'Stock error' })
            })

            render(<CheckoutPage />)
            fireEvent.click(screen.getByRole('button', { name: /Pay Securely/i }))

            // Just ensure it didn't redirect
            await waitFor(() => {
                expect(mockPush).not.toHaveBeenCalled()
            })
        })
    })

    describe('Success Page', () => {
        it('renders confirmation message', () => {
            render(<CheckoutSuccessPage searchParams={{ session_id: '123' }} />)
            expect(screen.getByText('Order Confirmed!')).toBeInTheDocument()
            expect(screen.getByText('Session ID: 123')).toBeInTheDocument()
        })
    })
})
