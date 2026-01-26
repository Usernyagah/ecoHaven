// === tests/auth/middleware.test.ts ===

/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from '@/lib/auth/middleware'
import { lucia } from '@/lib/auth/lucia'

// Mock dependencies
jest.mock('@/lib/auth/lucia', () => ({
  lucia: {
    sessionCookieName: 'auth_session',
    validateSession: jest.fn(),
    createSessionCookie: jest.fn(),
    createBlankSessionCookie: jest.fn(),
  },
}))

describe('Auth Middleware', () => {
  let mockRequest: NextRequest

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset basic request mock
    mockRequest = {
      nextUrl: {
        pathname: '/',
        searchParams: new URLSearchParams(),
      },
      url: 'http://localhost:3000/',
      cookies: {
        get: jest.fn(),
        set: jest.fn(),
      },
    } as unknown as NextRequest
  })

  it('should allow access to public routes without session', async () => {
    mockRequest.nextUrl.pathname = '/login'
      ; (mockRequest.cookies.get as jest.Mock).mockReturnValue(undefined)

    const response = await authMiddleware(mockRequest)
    // NextResponse.next() returns null/undefined in some mocks or specific object
    // In actual Next.js, it returns a response.
    // We assume allowing access means returning next() (status 200 or null body depending on mock)
    // Here we check if it didn't redirect.
    expect(response?.status).not.toBe(307)
    expect(response?.status).not.toBe(302)
  })

  it('should redirect to login for protected routes without session', async () => {
    mockRequest.nextUrl.pathname = '/admin/dashboard'
      ; (mockRequest.cookies.get as jest.Mock).mockReturnValue(undefined)

    const response = await authMiddleware(mockRequest)
    expect(response?.status).toBe(307) // Temporary redirect
    expect(response?.headers.get('location')).toContain('/login')
  })

  it('should redirect to home if authenticated user visits login page', async () => {
    mockRequest.nextUrl.pathname = '/login'
      ; (mockRequest.cookies.get as jest.Mock).mockReturnValue({ value: 'valid-session' })

      // Mock valid session
      ; (lucia.validateSession as jest.Mock).mockResolvedValue({
        session: { id: 's1', fresh: false },
        user: { id: 'u1', role: 'USER' },
      })

    const response = await authMiddleware(mockRequest)
    expect(response?.status).toBe(307)
    expect(response?.headers.get('location')).toBe('http://localhost:3000/')
  })
})
