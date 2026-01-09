"use client"

import { ShoppingCart, Menu, X, Moon, Sun } from "lucide-react"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Photo Based */}
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="EcoHaven Logo" className="w-8 h-8 object-contain rounded" />
            <span className="text-xl font-serif font-bold text-foreground">EcoHaven</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-sm font-medium text-foreground hover:text-primary transition">
              Home
            </a>
            <a href="#products" className="text-sm font-medium text-foreground hover:text-primary transition">
              Products
            </a>
            <a href="#about" className="text-sm font-medium text-foreground hover:text-primary transition">
              About
            </a>
            <a href="#contact" className="text-sm font-medium text-foreground hover:text-primary transition">
              Contact
            </a>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-secondary rounded-lg transition">
              <ShoppingCart className="w-5 h-5 text-foreground" />
            </button>

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 hover:bg-secondary rounded-lg transition"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-foreground" />
                ) : (
                  <Moon className="w-5 h-5 text-foreground" />
                )}
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-secondary rounded-lg transition"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-3">
            <a href="#home" className="text-sm font-medium text-foreground hover:text-primary transition block">
              Home
            </a>
            <a href="#products" className="text-sm font-medium text-foreground hover:text-primary transition block">
              Products
            </a>
            <a href="#about" className="text-sm font-medium text-foreground hover:text-primary transition block">
              About
            </a>
            <a href="#contact" className="text-sm font-medium text-foreground hover:text-primary transition block">
              Contact
            </a>
          </div>
        )}
      </div>
    </nav>
  )
}
