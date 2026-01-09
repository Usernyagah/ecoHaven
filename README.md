# 🌿 EcoHaven | Sustainable & Organic E-commerce Platform

![Build Status](https://img.shields.io/github/actions/workflow/status/Usernyagah/ecoHaven/ci.yml?branch=main&style=for-the-badge)
![Coverage](https://img.shields.io/badge/coverage-85%25-green?style=for-the-badge)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

An **advanced full-stack e-commerce application** built with the modern Next.js 14 App Router, designed for performance, scalability, and a premium user experience.

[**View Live Demo**](https://eco-haven-demo.vercel.app/) ∙ [Report Bug](https://github.com/Usernyagah/ecoHaven/issues)

---

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Core** | ![Next JS](https://img.shields.io/badge/Next-14.2-black?style=flat&logo=next.js&logoColor=white) ![React](https://img.shields.io/badge/React-18-20232A?style=flat&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white) |
| **Backend** | ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white) Server Actions |
| **Database** | ![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=flat&logo=Prisma&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white) |
| **Auth** | ![Lucia](https://img.shields.io/badge/Lucia-Auth-orange?style=flat) Role-Based Access Control (RBAC) |
| **Payments** | ![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=flat&logo=Stripe&logoColor=white) Checkout Sessions & Webhooks |
| **Uploads** | ![UploadThing](https://img.shields.io/badge/UploadThing-red?style=flat) |
| **Styling** | ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) ![Shadcn](https://img.shields.io/badge/shadcn%2Fui-000000?style=flat&logo=shadcnui&logoColor=white) |
| **DevOps** | ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white) ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat&logo=github-actions&logoColor=white) ![Jest](https://img.shields.io/badge/-Jest-%23C21325?style=flat&logo=jest&logoColor=white) |

## ✨ Key Features

*   **🔐 Robust Authentication**:
    *   Secure email/password login using **Lucia Auth** v3.
    *   Role-based protection: **ADMIN** vs **USER**.
    *   Protected route middleware for `/admin` dashboard.
*   **💳 Payments & Checkout**:
    *   Full **Stripe** integration with Checkout Sessions.
    *   Secure Webhook handling to verify signatures and process stock updates atomically.
    *   Cart management with stock validation.
*   **🛍️ Product Management (Admin)**:
    *   **Uploadthing** integration for multi-image uploads (drag & drop).
    *   Create, Read, Update, Delete (CRUD) operations for products.
    *   Real-time stock tracking.
*   **📦 Order Fulfillment**:
    *   Admin dashboard to view and update order status (Paid → Shipped → Delivered).
    *   Order history for customers.
*   **🎨 Premium UI/UX**:
    *   **Earthy, organic aesthetic** (Sage, Cream, Stone colors).
    *   Responsive, accessible components via **shadcn/ui**.
    *   Optimized images and fonts (Next/Image, Geist).

## 📸 Screenshots

| Homepage | Product Details |
|----------|-----------------|
| ![Home](https://placehold.co/600x400/EEE/31343C?text=Home+Page) | ![Product](https://placehold.co/600x400/EEE/31343C?text=Product+Page) |

| Cart & Checkout | Admin Dashboard |
|-----------------|-----------------|
| ![Checkout](https://placehold.co/600x400/EEE/31343C?text=Stripe+Checkout) | ![Admin](https://placehold.co/600x400/EEE/31343C?text=Admin+Dashboard) |

## 💻 Local Development

### Prerequisites
*   Node.js 20+
*   Docker & Docker Compose (optional, for local DB)
*   Stripe Account (Test Keys)
*   Uploadthing Account

### 1. Clone & Install
```bash
git clone https://github.com/Usernyagah/ecoHaven.git
cd ecoHaven
npm install
```

### 2. Database Setup
Start the Postgres container using Docker:
```bash
docker-compose up -d
```
*Alternatively, use a local Postgres instance or Neon/Supabase URL.*

Apply migrations and seed data:
```bash
npx prisma db push
npx prisma db seed
```

### 3. Environment Variables
Create a `.env` file in the root directory (see `.env.example`):
```bash
cp .env.example .env
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🚀 Deployment

### Vercel (Recommended)
1.  Push code to GitHub.
2.  Import project into Vercel.
3.  Add Environment Variables (Database URL, Stripe Keys, Uploadthing Keys).
4.  Deploy!

### Database (Neon/Supabase)
For production, use a managed Postgres provider like [Neon](https://neon.tech) or [Supabase](https://supabase.com). Update the `DATABASE_URL` in Vercel to point to the production DB.

## 🧪 Testing

We use **Jest** and **React Testing Library** for unit and integration testing.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## ⚙️ Environment Variables

Required variables in `.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ecohaven"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Uploadthing
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 📂 Project Structure

```bash
├── app
│   ├── (public)          # Public routes
│   ├── admin             # Protected admin routes
│   ├── api               # Route handlers (Stripe, Uploadthing)
│   └── checkout          # Checkout flow
├── components
│   └── ui                # Shadcn UI components
├── lib
│   ├── actions           # Server Actions
│   ├── auth              # Lucia config & middleware
│   └── db.ts             # Prisma client
├── prisma                # Schema & migrations
└── tests                 # Jest test suites
```

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

## 🤝 Contact

**Project Link:** [https://github.com/Usernyagah/ecoHaven](https://github.com/Usernyagah/ecoHaven)

---

*Built for the [Google Deepmind Advanced Coding Agent] portfolio.*
