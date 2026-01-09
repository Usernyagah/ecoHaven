# EcoHaven Test Suite Documentation

This project includes a comprehensive test suite covering critical e-commerce user flows and components using Jest and React Testing Library.

## Setup

### Installation

All testing dependencies are included in `package.json`. Install them with:

```bash
npm install
```

Required dependencies:
- `jest` - Test runner
- `@testing-library/react` - React component testing utilities
- `@testing-library/user-event` - User interaction simulation
- `@testing-library/jest-dom` - Custom Jest matchers for DOM
- `jest-environment-jsdom` - DOM environment for Jest
- `@types/jest` - TypeScript types for Jest
- `next-themes` - Dark mode support

### Configuration Files

- **jest.config.js** - Jest configuration with Next.js support and module path mapping
- **jest.setup.js** - Global test setup including DOM environment and mocking (includes next-themes mock)
- **tsconfig.json** - Updated to include Jest types

## Running Tests

### Run all tests once
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Generate coverage report
```bash
npm run test:coverage
```

## Test Structure

Tests are organized by feature in the `tests/frontend/` directory:

```
tests/
├── frontend/
│   ├── components/
│   │   ├── navbar.test.tsx             # NEW: Navbar component with dark mode toggle
│   │   └── product-card.test.tsx       # ProductCard component tests
│   └── pages/
│       ├── products.test.tsx            # Product listing page tests
│       ├── product-detail.test.tsx      # Single product page tests
│       ├── cart.test.tsx                # Shopping cart page tests
│       ├── checkout.test.tsx            # Checkout form and submission tests
│       └── admin-dashboard.test.tsx     # Admin dashboard protection tests
```

## Test Coverage

### 1. Navbar Component (`components/navbar.test.tsx`) - NEW
- ✅ Renders photo-based logo image instead of icon
- ✅ Renders navigation links (Home, Products, About, Contact)
- ✅ Renders shopping cart icon button
- ✅ Renders theme toggle button for dark mode
- ✅ Toggles mobile menu when button is clicked

### 2. ProductCard Component (`components/product-card.test.tsx`)
- ✅ Renders product name and correctly formatted price ($XX.XX)
- ✅ Displays main image with proper alt text
- ✅ Shows enabled "Add to Cart" button when stock > 0
- ✅ Shows disabled "Out of Stock" button when stock = 0
- ✅ Calls onAddToCart callback only when in stock
- ✅ Matches snapshot

### 3. Product Listing Page (`pages/products.test.tsx`)
- ✅ Renders products heading
- ✅ Renders loading state initially
- ✅ Has products region for accessibility
- ✅ Applies category and price filters correctly

### 4. Single Product Page (`pages/product-detail.test.tsx`)
- ✅ Displays product name and price
- ✅ Shows stock status
- ✅ Allows selecting quantity (1 to stock limit)
- ✅ Displays add to cart button
- ✅ Displays product description

### 5. Cart Page (`pages/cart.test.tsx`)
- ✅ Shows empty state with message when cart is empty
- ✅ Displays continue shopping link
- ✅ Has cart items region for accessibility
- ✅ Renders shopping cart heading

### 6. Checkout Page (`pages/checkout.test.tsx`)
- ✅ Renders form with email, name, and shipping fields
- ✅ Renders complete purchase button
- ✅ Displays checkout form on page

### 7. Protected Admin Dashboard (`pages/admin-dashboard.test.tsx`)
- ✅ Renders admin dashboard heading
- ✅ Displays recent orders section
- ✅ Displays low stock alerts section
- ✅ Displays add product button

## Testing Best Practices Used

### 1. **Descriptive Test Names**
Each test clearly describes what it's testing using the "should..." pattern:
```typescript
it("renders photo-based logo image instead of icon", () => {
  // test implementation
})
```

### 2. **AAA Pattern (Arrange-Act-Assert)**
```typescript
it("calls onAddToCart callback when button is clicked", () => {
  // Arrange
  const onAddToCart = jest.fn()
  render(<ProductCard {...defaultProps} stock={5} onAddToCart={onAddToCart} />)

  // Act
  const button = screen.getByRole("button", { name: /add to cart/i })
  fireEvent.click(button)

  // Assert
  expect(onAddToCart).toHaveBeenCalledWith({ id: 1, quantity: 1 })
})
```

### 3. **User-Centric Testing**
Tests verify actual user interactions and accessibility:
```typescript
const logo = screen.getByAltText("EcoHaven Logo")
expect(logo).toHaveAttribute("src", "/logo.jpg")
```

### 4. **Async Handling with waitFor**
Tests properly handle async operations:
```typescript
await waitFor(() => {
  expect(screen.getByText("Bamboo Toothbrush")).toBeInTheDocument()
})
```

### 5. **Proper Mocking**
- Mock `next/navigation` hooks (useRouter, redirect)
- Mock `next-themes` for dark mode support
- Mock server actions and fetch calls
- Use `jest.fn()` for callback verification

### 6. **Type Safety**
All tests are written in TypeScript for full type safety and IDE support.

### 7. **Accessibility Testing**
Tests use semantic queries like `getByRole`, `getByLabelText`, `getByAltText`:
```typescript
const button = screen.getByRole("button", { name: /add to cart/i })
const logo = screen.getByAltText("EcoHaven Logo")
```

## Dark Mode Testing

The test suite includes support for dark mode via the `next-themes` mocking in `jest.setup.js`:

```typescript
jest.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: jest.fn(),
    systemTheme: "light",
    themes: ["light", "dark"],
    resolvedTheme: "light",
  }),
  ThemeProvider: ({ children }) => children,
}))
```

### Testing Theme Toggle
```typescript
it("renders theme toggle button", () => {
  render(<Navbar />)
  const buttons = screen.getAllByRole("button")
  expect(buttons.length).toBeGreaterThan(2) // Cart, theme toggle, mobile menu
})
```

## Common Testing Patterns

### Testing Protected Routes
```typescript
it("redirects to /login if no session", () => {
  mockGetSession.mockResolvedValueOnce(null)
  expect(() => render(<AdminDashboardPage />)).toThrow("REDIRECT /login")
  expect(redirect).toHaveBeenCalledWith("/login")
})
```

### Testing Accessibility Features
```typescript
it("renders photo-based logo image instead of icon", () => {
  render(<Navbar />)
  const logo = screen.getByAltText("EcoHaven Logo")
  expect(logo).toBeInTheDocument()
  expect(logo).toHaveAttribute("src", "/logo.jpg")
})
```

## Debugging Tests

### View the DOM state
```typescript
import { screen, debug } from "@testing-library/react"

debug(screen.getByRole("button"))
```

### Use getByRole for better queries
Prefer:
```typescript
screen.getByRole("button", { name: /submit/i })
```

Over:
```typescript
screen.getByTestId("submit-btn")
```

### Check rendered HTML
```typescript
const { container } = render(<Component />)
console.log(container.innerHTML)
```

## Extending the Tests

### Adding New Component Tests
1. Create file: `tests/frontend/components/my-component.test.tsx`
2. Follow the same structure and patterns
3. Test user interactions, not implementation details
4. Include snapshot tests for UI components

### Adding New Page Tests
1. Create file: `tests/frontend/pages/my-page.test.tsx`
2. Mock any server dependencies (fetch, server actions, next-themes)
3. Test the complete user flow
4. Verify proper redirects and error handling

## Continuous Integration

These tests are designed to run in CI/CD pipelines. Add to your CI config:

```bash
npm install
npm run test:coverage
npm run lint
npm run build
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Best Practices](https://testing-library.com/docs/queries/about)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)
- [next-themes Documentation](https://github.com/pacocoursey/next-themes)
