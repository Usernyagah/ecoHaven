"use client"

import { ShoppingCart, Menu, X, Moon, Sun } from "lucide-react"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navbar({ authNav }: { authNav?: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.jpg" alt="EcoHaven Logo" className="w-8 h-8 object-contain rounded" />
            <span className="text-xl font-serif font-bold text-foreground">EcoHaven</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-[#8A9A5B] ${pathname === link.href ? "text-[#8A9A5B]" : "text-foreground"
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Auth Slot */}
            <div className="hidden sm:block">
              {authNav}
            </div>

            <Link href="/cart" className="p-2 hover:bg-secondary rounded-lg transition text-foreground">
              <ShoppingCart className="w-5 h-5" />
            </Link>

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 hover:bg-secondary rounded-lg transition"
                aria-label="Toggle theme"
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
          <div className="md:hidden border-t border-border mt-1 py-4 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`text-base font-medium ${pathname === link.href ? "text-[#8A9A5B]" : "text-foreground"
                  }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-border pt-4">
              {authNav}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
