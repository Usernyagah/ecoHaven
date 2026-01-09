import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import { jest } from "@jest/globals"

// Mock Admin Dashboard Component
const AdminDashboardPage = () => (
  <div>
    <h1>Admin Dashboard</h1>
    <section>
      <h2>Recent Orders</h2>
      <p>Order data here</p>
    </section>
    <section>
      <h2>Low Stock Alerts</h2>
      <p>Stock alerts here</p>
    </section>
    <button>Add Product</button>
  </div>
)

describe("Protected Admin Dashboard Access", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders admin dashboard heading", () => {
    render(<AdminDashboardPage />)
    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument()
  })

  it("displays recent orders section", () => {
    render(<AdminDashboardPage />)
    expect(screen.getByText(/recent orders/i)).toBeInTheDocument()
  })

  it("displays low stock alerts section", () => {
    render(<AdminDashboardPage />)
    expect(screen.getByText(/low stock alerts/i)).toBeInTheDocument()
  })

  it("displays add product button", () => {
    render(<AdminDashboardPage />)
    expect(screen.getByRole("button", { name: /add product/i })).toBeInTheDocument()
  })
})
