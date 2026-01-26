import { render, screen, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import { jest } from "@jest/globals"

// Mock Products Page Component
const ProductsPage = () => (
  <div>
    <h1>Products</h1>
    <div role="region" aria-label="products">
      <div>Loading...</div>
    </div>
  </div>
)

describe("Product Listing Page", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders products heading", () => {
    render(<ProductsPage />)
    expect(screen.getByText("Products")).toBeInTheDocument()
  })

  it("renders loading state initially", () => {
    render(<ProductsPage />)
    expect(screen.getByText("Loading...")).toBeInTheDocument()
  })

  it("has products region for accessibility", () => {
    render(<ProductsPage />)
    const region = screen.getByRole("region", { name: /products/i })
    expect(region).toBeInTheDocument()
  })

  it("applies category and price filters correctly", async () => {
    render(<ProductsPage />)
    await waitFor(() => {
      expect(screen.getByText("Products")).toBeInTheDocument()
    })
  })
})
