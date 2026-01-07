// === tests/auth/components.test.tsx ===

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/login/page'
import RegisterPage from '@/app/register/page'
import { AuthNav } from '@/components/ui/AuthNav'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    }
  },
  redirect: jest.fn(),
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock auth actions
const mockLoginAction = jest.fn()
const mockRegisterAction = jest.fn()
const mockLogoutAction = jest.fn()

jest.mock('@/lib/actions/auth.actions', () => ({
  loginAction: (formData: FormData) => mockLoginAction(formData),
  registerAction: (formData: FormData) => mockRegisterAction(formData),
  logoutAction: () => mockLogoutAction(),
}))

// Mock getUser
const mockGetUser = jest.fn()

jest.mock('@/lib/auth/lucia', () => ({
  getUser: () => mockGetUser(),
  lucia: {
    sessionCookieName: 'auth_session',
    createBlankSessionCookie: jest.fn(),
    createSessionCookie: jest.fn(),
  },
  hashPassword: jest.fn(),
  verifyPassword: jest.fn(),
}))

describe('Auth Components', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Login Page', () => {
    it('should render login form with email and password fields', () => {
      render(<LoginPage />)

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('should show validation error for empty email', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      // Leave email empty, fill password
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      // HTML5 validation should prevent submission
      expect(emailInput).toBeInvalid()
    })

    it('should show validation error for invalid email format', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'invalid-email')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      // HTML5 validation should prevent submission
      expect(emailInput).toBeInvalid()
    })

    it('should call loginAction with form data on submit', async () => {
      const user = userEvent.setup()
      mockLoginAction.mockResolvedValue({ success: true })

      render(<LoginPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockLoginAction).toHaveBeenCalled()
      })

      const formData = mockLoginAction.mock.calls[0][0]
      expect(formData.get('email')).toBe('test@example.com')
      expect(formData.get('password')).toBe('password123')
    })

    it('should show link to register page', () => {
      render(<LoginPage />)

      const registerLink = screen.getByRole('link', { name: /sign up/i })
      expect(registerLink).toBeInTheDocument()
      expect(registerLink).toHaveAttribute('href', '/register')
    })
  })

  describe('Register Page', () => {
    it('should render register form with name, email, and password fields', () => {
      render(<RegisterPage />)

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    })

    it('should show password requirement hint', () => {
      render(<RegisterPage />)

      expect(screen.getByText(/must be at least 8 characters long/i)).toBeInTheDocument()
    })

    it('should call registerAction with form data on submit', async () => {
      const user = userEvent.setup()
      mockRegisterAction.mockResolvedValue({ success: true })

      render(<RegisterPage />)

      const nameInput = screen.getByLabelText(/name/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(nameInput, 'Test User')
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockRegisterAction).toHaveBeenCalled()
      })

      const formData = mockRegisterAction.mock.calls[0][0]
      expect(formData.get('name')).toBe('Test User')
      expect(formData.get('email')).toBe('test@example.com')
      expect(formData.get('password')).toBe('password123')
    })

    it('should show link to login page', () => {
      render(<RegisterPage />)

      const loginLink = screen.getByRole('link', { name: /sign in/i })
      expect(loginLink).toBeInTheDocument()
      expect(loginLink).toHaveAttribute('href', '/login')
    })
  })

  describe('AuthNav Component', () => {
    it('should show login and register links when user is not logged in', async () => {
      mockGetUser.mockResolvedValue({ user: null, session: null })

      const { container } = render(await AuthNav())

      expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument()
    })

    it('should show user name and logout button when logged in', async () => {
      mockGetUser.mockResolvedValue({
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER',
        },
        session: {
          id: 'session-1',
          userId: '1',
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        },
      })

      const { container } = render(await AuthNav())

      expect(screen.getByText(/test user/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
      expect(screen.queryByRole('link', { name: /admin/i })).not.toBeInTheDocument()
    })

    it('should show admin link only for ADMIN role', async () => {
      mockGetUser.mockResolvedValue({
        user: {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'ADMIN',
        },
        session: {
          id: 'session-1',
          userId: '1',
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        },
      })

      const { container } = render(await AuthNav())

      expect(screen.getByRole('link', { name: /admin/i })).toBeInTheDocument()
      expect(screen.getByText(/admin user/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
    })

    it('should show user email if name is not available', async () => {
      mockGetUser.mockResolvedValue({
        user: {
          id: '1',
          email: 'test@example.com',
          name: null,
          role: 'USER',
        },
        session: {
          id: 'session-1',
          userId: '1',
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        },
      })

      const { container } = render(await AuthNav())

      expect(screen.getByText(/test@example.com/i)).toBeInTheDocument()
    })

    it('should call logoutAction when logout button is clicked', async () => {
      const user = userEvent.setup()
      mockGetUser.mockResolvedValue({
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER',
        },
        session: {
          id: 'session-1',
          userId: '1',
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        },
      })

      const { container } = render(await AuthNav())

      const logoutButton = screen.getByRole('button', { name: /logout/i })
      await user.click(logoutButton)

      expect(mockLogoutAction).toHaveBeenCalled()
    })
  })
})

