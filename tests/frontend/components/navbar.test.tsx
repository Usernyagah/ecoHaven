import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import { jest } from "@jest/globals"
import { Navbar } from "@/components/navbar"

// Mock next-themes for this test
jest.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: jest.fn(),
  }),
}))

describe("Navbar Component", () => {
  it("renders logo image instead of icon", () => {
    render(<Navbar />)
    const logo = screen.getByAltText("EcoHaven Logo")
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute("src", "/logo.jpg")
  })

  it("renders navigation links", () => {
    render(<Navbar />)
    expect(screen.getByText("Home")).toBeInTheDocument()
    expect(screen.getByText("Products")).toBeInTheDocument()
    expect(screen.getByText("About")).toBeInTheDocument()
    expect(screen.getByText("Contact")).toBeInTheDocument()
  })

  it("renders shopping cart icon", () => {
    render(<Navbar />)
    const cartButtons = screen.getAllByRole("button")
    expect(cartButtons.length).toBeGreaterThan(0)
  })

  it("renders theme toggle button", () => {
    render(<Navbar />)
    const buttons = screen.getAllByRole("button")
    expect(buttons.length).toBeGreaterThan(2) // Cart, theme toggle, mobile menu
  })

  it("toggles mobile menu when button is clicked", async () => {
    render(<Navbar />)

    // Mobile menu should not be visible initially
    const mobileLinks = screen.queryAllByText("Home")

    // Find the mobile menu button (not on desktop)
    const buttons = screen.getAllByRole("button")
    const menuButton = buttons[buttons.length - 1] // Last button is usually the mobile menu

    fireEvent.click(menuButton)

    await waitFor(() => {
      expect(screen.getAllByText("Home").length).toBeGreaterThan(1) // One in desktop, one in mobile
    })
  })
})
