// === tests/auth/protected-routes.test.ts ===

/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { authMiddleware } from '@/lib/auth/middleware'
import { lucia } from '@/lib/auth/lucia'

// Mock Lucia
jest.mock('@/lib/auth/lucia', () => ({
  lucia: {
    sessionCookieName: 'auth_session',
    validateSession: jest.fn(),
    createSessionCookie: jest.fn(),
    createBlankSessionCookie: jest.fn(),
  },
}))

describe('Protected Routes Access', () => {
  let mockRequest: NextRequest

  beforeEach(() => {
    jest.clearAllMocks()
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

  describe('Admin Routes', () => {
    it('should redirect unauthenticated users to login', async () => {
      mockRequest.nextUrl.pathname = '/admin/dashboard'
        ; (mockRequest.cookies.get as jest.Mock).mockReturnValue(undefined)

      const response = await authMiddleware(mockRequest)
      expect(response?.status).toBe(307)
      expect(response?.headers.get('location')).toContain('/login')
    })

    it('should redirect non-admin users to home', async () => {
      mockRequest.nextUrl.pathname = '/admin/dashboard'
        ; (mockRequest.cookies.get as jest.Mock).mockReturnValue({ value: 'user-session' })

        // Mock regular user
        ; (lucia.validateSession as jest.Mock).mockResolvedValue({
          session: { id: 's1', fresh: false },
          user: { id: 'u1', role: 'USER' },
        })

      const response = await authMiddleware(mockRequest)
      expect(response?.status).toBe(307)
      expect(response?.headers.get('location')).toBe('http://localhost:3000/')
    })

    it('should allow access to admin users', async () => {
      mockRequest.nextUrl.pathname = '/admin/dashboard'
        ; (mockRequest.cookies.get as jest.Mock).mockReturnValue({ value: 'admin-session' })

        // Mock admin user
        ; (lucia.validateSession as jest.Mock).mockResolvedValue({
          session: { id: 's2', fresh: false },
          user: { id: 'u2', role: 'ADMIN' },
        })

      const response = await authMiddleware(mockRequest)
      // Should not redirect
      expect(response?.status).not.toBe(307)
      expect(response?.status).not.toBe(302)
    })
  })
})
