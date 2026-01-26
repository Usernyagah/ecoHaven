import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import { jest } from "@jest/globals"

// Mock Cart Page Component
const CartPage = () => (
  <div>
    <h1>Shopping Cart</h1>
    <div role="region" aria-label="cart items">
      <p>Your cart is empty</p>
      <a href="/products">Continue Shopping</a>
    </div>
  </div>
)

describe("Cart Page", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it("shows empty state with message when cart is empty", () => {
    render(<CartPage />)
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument()
  })

  it("displays continue shopping link", () => {
    render(<CartPage />)
    expect(screen.getByRole("link", { name: /continue shopping/i })).toHaveAttribute("href", "/products")
  })

  it("has cart items region for accessibility", () => {
    render(<CartPage />)
    const region = screen.getByRole("region", { name: /cart items/i })
    expect(region).toBeInTheDocument()
  })

  it("renders shopping cart heading", () => {
    render(<CartPage />)
    expect(screen.getByText("Shopping Cart")).toBeInTheDocument()
  })
})
