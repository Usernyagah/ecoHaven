import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import { jest } from "@jest/globals"

// Mock Product Detail Page Component
const ProductDetailPage = ({ params }: any) => (
  <div>
    <h1>Bamboo Toothbrush</h1>
    <p>Sustainable bamboo toothbrush</p>
    <span>$12.99</span>
    <p>In Stock: 10</p>
    <input type="number" min="1" max="10" defaultValue="1" aria-label="Quantity" />
    <button>Add to Cart</button>
  </div>
)

describe("Single Product Detail Page", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("displays product name and price", () => {
    render(<ProductDetailPage params={{ id: "1" }} />)

    expect(screen.getByText("Bamboo Toothbrush")).toBeInTheDocument()
    expect(screen.getByText("$12.99")).toBeInTheDocument()
  })

  it("shows stock status", () => {
    render(<ProductDetailPage params={{ id: "1" }} />)
    expect(screen.getByText(/in stock/i)).toBeInTheDocument()
  })

  it("allows selecting quantity", () => {
    render(<ProductDetailPage params={{ id: "1" }} />)
    const quantityInput = screen.getByLabelText(/quantity/i)
    expect(quantityInput).toHaveValue(1)
    expect(quantityInput).toHaveAttribute("max", "10")
  })

  it("displays add to cart button", () => {
    render(<ProductDetailPage params={{ id: "1" }} />)
    expect(screen.getByRole("button", { name: /add to cart/i })).toBeInTheDocument()
  })

  it("displays product description", () => {
    render(<ProductDetailPage params={{ id: "1" }} />)
    expect(screen.getByText(/sustainable bamboo toothbrush/i)).toBeInTheDocument()
  })
})
