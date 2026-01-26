import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import { jest } from "@jest/globals"

// Mock Checkout Page Component
const CheckoutPage = () => (
  <div>
    <h1>Checkout</h1>
    <form>
      <input type="email" placeholder="Email" aria-label="Email" />
      <input type="text" placeholder="Name" aria-label="Name" />
      <input type="text" placeholder="Address" aria-label="Shipping Address" />
      <button type="submit">Complete Purchase</button>
    </form>
  </div>
)

describe("Checkout Page", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders form with email, name, shipping fields", () => {
    render(<CheckoutPage />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/shipping address/i)).toBeInTheDocument()
  })

  it("renders complete purchase button", () => {
    render(<CheckoutPage />)
    expect(screen.getByRole("button", { name: /complete purchase/i })).toBeInTheDocument()
  })

  it("displays checkout form on page", () => {
    render(<CheckoutPage />)
    expect(screen.getByText("Checkout")).toBeInTheDocument()
  })
})
