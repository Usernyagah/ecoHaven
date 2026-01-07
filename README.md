# EcoHaven 🌿

A modern, sustainable e-commerce platform built with Next.js 14+ App Router, featuring full authentication, role-based access control, and a beautiful organic design aesthetic.

![EcoHaven](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192?style=for-the-badge&logo=postgresql)
![Lucia](https://img.shields.io/badge/Lucia-3.2-4A5568?style=for-the-badge)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

EcoHaven is a full-stack e-commerce platform designed for selling sustainable, eco-friendly products. The platform features:

- **Modern Architecture**: Built with Next.js 14+ App Router for optimal performance
- **Type-Safe**: Full TypeScript implementation with strict type checking
- **Secure Authentication**: Lucia-based auth with role-based access control (USER/ADMIN)
- **Beautiful UI**: Earthy, organic design using shadcn/ui components
- **Comprehensive Testing**: Full test coverage with Jest and React Testing Library
- **Production Ready**: Optimized for deployment on Vercel with PostgreSQL

## ✨ Features

### 🔐 Authentication & Authorization
- **Credentials-based authentication** (email + password)
- **Session management** with secure HTTP-only cookies
- **Role-based access control** (USER and ADMIN roles)
- **Protected admin routes** (`/admin/**`)
- **Login, Register, and Logout** functionality
- **Conditional UI** (Admin link only visible to admins)

### 🛍️ E-Commerce Features
- **Product Catalog**: Browse and search eco-friendly products
- **Product Categories**: Organized product browsing
- **Product Details**: Detailed product pages with images
- **Shopping Cart**: Add products to cart
- **Checkout Process**: Secure checkout with Stripe integration
- **Order Management**: Track order status (PENDING, PAID, SHIPPED, DELIVERED, CANCELLED)

### 👨‍💼 Admin Dashboard
- **Sales Analytics**: Visual charts and metrics
- **Product Management**: Add, edit, and delete products
- **Order Management**: View and manage customer orders
- **Low Stock Alerts**: Monitor inventory levels
- **Customer Insights**: Track sales and performance

### 🎨 User Experience
- **Dark Mode**: System preference detection with manual toggle
- **Responsive Design**: Mobile-first, works on all devices
- **Organic Design**: Earthy color palette and minimal aesthetic
- **Fast Performance**: Optimized with Next.js App Router
- **Accessibility**: WCAG compliant with semantic HTML

## 🛠️ Tech Stack

### Frontend
- **Next.js 16.0.10** - React framework with App Router
- **React 19.2.0** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4.1.9** - Utility-first CSS
- **shadcn/ui** - High-quality component library
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **next-themes** - Dark mode support

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Server Actions** - Type-safe server-side mutations
- **Prisma 5.0** - Type-safe database ORM
- **PostgreSQL** - Relational database
- **Lucia 3.2.2** - Authentication library
- **@node-rs/argon2** - Secure password hashing

### Testing
- **Jest 30.2.0** - Test runner
- **React Testing Library** - Component testing
- **Supertest** - API testing
- **@testing-library/user-event** - User interaction simulation

### DevOps
- **Docker** - Containerized PostgreSQL
- **Vercel** - Deployment platform
- **Neon** - Serverless PostgreSQL (production)

## 📁 Project Structure

```
eco-haven/
├── app/                          # Next.js App Router
│   ├── actions/                  # Server actions
│   │   └── checkout.ts          # Checkout server action
│   ├── admin/                   # Admin routes (protected)
│   │   └── dashboard/           # Admin dashboard
│   ├── api/                     # API routes
│   │   └── auth/               # Authentication endpoints
│   ├── checkout/                # Checkout page
│   ├── login/                   # Login page
│   ├── register/                # Registration page
│   ├── products/                # Product pages
│   │   ├── [id]/               # Product detail page
│   │   └── page.tsx            # Product listing
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/                   # React components
│   ├── ui/                     # shadcn/ui components
│   │   ├── AuthNav.tsx         # Authentication navigation
│   │   └── ...                 # Other UI components
│   ├── navbar.tsx               # Main navigation
│   └── theme-provider.tsx       # Theme context
├── lib/                         # Utility libraries
│   ├── actions/                # Server actions
│   │   ├── auth.actions.ts     # Auth server actions
│   │   └── products.ts         # Product server actions
│   ├── auth/                   # Authentication
│   │   ├── lucia.ts            # Lucia configuration
│   │   └── middleware.ts       # Auth middleware
│   ├── db.ts                   # Prisma client
│   └── utils.ts                # Utility functions
├── prisma/                      # Database
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Database seeder
├── public/                      # Static assets
├── tests/                       # Test files
│   ├── auth/                   # Authentication tests
│   ├── backend/                # Backend tests
│   ├── db/                     # Database tests
│   └── frontend/               # Frontend tests
├── middleware.ts               # Next.js middleware
├── jest.config.js              # Jest configuration
├── jest.setup.js               # Jest setup
├── next.config.mjs             # Next.js configuration
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ installed
- **pnpm** or **npm** package manager
- **Docker** (for local PostgreSQL)
- **Git** for version control

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Usernyagah/ecoHaven.git
   cd eco-haven
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/ecohaven"
   NODE_ENV="development"
   ```

4. **Start PostgreSQL with Docker:**
   ```bash
   docker run --name ecohaven-postgres \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=ecohaven \
     -p 5432:5432 \
     -d postgres:16-alpine
   ```

5. **Set up the database:**
   ```bash
   # Push schema to database
   pnpm db:push
   
   # Or create and run migrations
   pnpm db:migrate
   ```

6. **Seed the database:**
   ```bash
   pnpm db:seed
   ```
   
   This creates:
   - Admin user: `admin@ecohaven.com` / `password123`
   - 5 product categories
   - 15 eco-friendly products

7. **Start the development server:**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

8. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Database Scripts

```bash
pnpm db:push      # Push schema changes (development)
pnpm db:migrate   # Create and run migrations
pnpm db:studio    # Open Prisma Studio (database GUI)
pnpm db:seed      # Seed database with initial data
pnpm db:reset     # Reset database (WARNING: deletes all data)
```

## 🔐 Authentication

EcoHaven uses [Lucia](https://lucia-auth.com/) for authentication with the following features:

### User Roles

- **USER**: Standard customer role with access to shopping features
- **ADMIN**: Administrative role with access to `/admin/**` routes

### Authentication Flow

1. **Registration**: Users can create accounts with email and password
2. **Login**: Secure login with session creation
3. **Session Management**: HTTP-only cookies for secure session storage
4. **Logout**: Session invalidation and cookie cleanup

### Protected Routes

- `/admin/**` - Requires ADMIN role
- `/login` and `/register` - Redirect authenticated users to home

### Password Security

- Passwords are hashed using **Argon2** (`@node-rs/argon2`)
- Secure password verification with timing attack protection
- Minimum 8 characters required

### Implementation Files

- `lib/auth/lucia.ts` - Lucia configuration and utilities
- `lib/auth/middleware.ts` - Route protection middleware
- `lib/actions/auth.actions.ts` - Server actions for auth
- `app/api/auth/[...lucia]/route.ts` - API route handler
- `app/login/page.tsx` - Login page
- `app/register/page.tsx` - Registration page
- `components/ui/AuthNav.tsx` - Authentication navigation component

## 💻 Development

### Available Scripts

```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm test             # Run tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Generate test coverage report
```

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for Next.js
- **Prettier**: Code formatting (if configured)
- **Conventional Commits**: Commit message format

### Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Write tests for new features
4. Run tests: `pnpm test`
5. Commit changes: `git commit -m "feat: your feature"`
6. Push to remote: `git push origin feature/your-feature`
7. Create a pull request

## 🧪 Testing

EcoHaven includes comprehensive test coverage:

### Test Structure

```
tests/
├── auth/                    # Authentication tests
│   ├── lucia.test.ts       # Core auth functionality
│   ├── protected-routes.test.ts  # Route protection
│   ├── components.test.tsx # Auth components
│   └── middleware.test.ts  # Middleware tests
├── backend/                 # Backend tests
│   ├── actions/            # Server action tests
│   └── routes/            # API route tests
├── db/                     # Database tests
│   ├── schema.test.ts     # Schema validation
│   └── seed.test.ts       # Seeder tests
└── frontend/               # Frontend tests
    ├── components/        # Component tests
    └── pages/             # Page tests
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

### Test Coverage

- ✅ Authentication flows (login, register, logout)
- ✅ Protected routes and middleware
- ✅ Server actions and API routes
- ✅ React components and pages
- ✅ Database operations
- ✅ Form validation

See [TESTING.md](./TESTING.md) for detailed testing documentation.

## 🚢 Deployment

### Vercel Deployment

1. **Push to GitHub:**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel:**
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables:**
   - `DATABASE_URL` - Your production database URL (Neon recommended)
   - `NODE_ENV` - Set to `production`

4. **Deploy:**
   - Vercel will automatically deploy on push to main

### Production Database (Neon)

1. **Create Neon Project:**
   - Go to [neon.tech](https://neon.tech)
   - Create a new project
   - Copy the connection string

2. **Update Environment Variables:**
   - Add `DATABASE_URL` in Vercel dashboard
   - Ensure SSL parameters are included

3. **Run Migrations:**
   ```bash
   pnpm db:migrate
   ```

4. **Seed Database (Optional):**
   ```bash
   pnpm db:seed
   ```

### Environment Variables

Required environment variables:

```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
NODE_ENV="production"
```

Optional:
```env
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
```

## 📊 Database Schema

### Models

- **User**: User accounts with authentication
- **Session**: User sessions for Lucia auth
- **Account**: OAuth account connections (future)
- **Category**: Product categories
- **Product**: Product catalog
- **Order**: Customer orders
- **OrderItem**: Order line items

### Enums

- **Role**: USER, ADMIN
- **OrderStatus**: PENDING, PAID, SHIPPED, DELIVERED, CANCELLED

See `prisma/schema.prisma` for complete schema definition.

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m "feat: add amazing feature"`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Contribution Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Update documentation as needed
- Follow conventional commit messages
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Lucia](https://lucia-auth.com/) - Authentication library
- [Prisma](https://www.prisma.io/) - Database ORM
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

## 📞 Support

For issues, questions, or contributions, please open an issue on [GitHub](https://github.com/Usernyagah/ecoHaven/issues).

---

**Built with ❤️ for sustainable living**
