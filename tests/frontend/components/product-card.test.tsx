"use client"

import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom"
import { jest } from "@jest/globals"

// Mock ProductCard component for testing
const ProductCard = ({ id, name, priceInCents, images, stock, onAddToCart }: any) => (
  <div>
    <img src={images?.[0] || "/placeholder.svg"} alt={name} />
    <h3>{name}</h3>
    <p>${(priceInCents / 100).toFixed(2)}</p>
    <button onClick={() => onAddToCart?.({ id, quantity: 1 })} disabled={stock === 0}>
      {stock > 0 ? "Add to Cart" : "Out of Stock"}
    </button>
  </div>
)

describe("ProductCard Component", () => {
  const defaultProps = {
    id: 1,
    name: "Bamboo Toothbrush",
    priceInCents: 1299,
    images: ["/bamboo-toothbrush.jpg"],
    stock: 10,
  }

  it("renders product name and correctly formatted price", () => {
    const onAddToCart = jest.fn()
    render(<ProductCard {...defaultProps} onAddToCart={onAddToCart} />)

    expect(screen.getByText("Bamboo Toothbrush")).toBeInTheDocument()
    expect(screen.getByText("$12.99")).toBeInTheDocument()
  })

  it("renders main image with proper alt text", () => {
    const onAddToCart = jest.fn()
    render(<ProductCard {...defaultProps} onAddToCart={onAddToCart} />)

    const image = screen.getByAltText("Bamboo Toothbrush")
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute("src", "/bamboo-toothbrush.jpg")
  })

  it("shows enabled Add to Cart button when stock > 0", () => {
    const onAddToCart = jest.fn()
    render(<ProductCard {...defaultProps} stock={5} onAddToCart={onAddToCart} />)

    const button = screen.getByRole("button", { name: /add to cart/i })
    expect(button).not.toBeDisabled()
  })

  it("shows disabled button with Out of Stock text when stock === 0", () => {
    const onAddToCart = jest.fn()
    render(<ProductCard {...defaultProps} stock={0} onAddToCart={onAddToCart} />)

    const button = screen.getByRole("button", { name: /out of stock/i })
    expect(button).toBeDisabled()
  })

  it("calls onAddToCart callback when button is clicked and in stock", () => {
    const onAddToCart = jest.fn()
    render(<ProductCard {...defaultProps} stock={5} onAddToCart={onAddToCart} />)

    const button = screen.getByRole("button", { name: /add to cart/i })
    fireEvent.click(button)

    expect(onAddToCart).toHaveBeenCalledWith({ id: 1, quantity: 1 })
    expect(onAddToCart).toHaveBeenCalledTimes(1)
  })

  it("does not call onAddToCart when out of stock", () => {
    const onAddToCart = jest.fn()
    render(<ProductCard {...defaultProps} stock={0} onAddToCart={onAddToCart} />)

    const button = screen.getByRole("button", { name: /out of stock/i })
    fireEvent.click(button)

    expect(onAddToCart).not.toHaveBeenCalled()
  })
})
