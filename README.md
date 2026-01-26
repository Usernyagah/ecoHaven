# 🌿 EcoHaven Full-Stack Platform

EcoHaven is a premium, sustainable e-commerce platform built with a high-performance monorepo architecture. It features a Next.js 14 frontend, an Express auxiliary backend, and a robust Postgres database.

## 🏗️ Project Architecture

This project is organized as a monorepo:

- **`/frontend`**: Next.js 14 Web Application (App Router, Server Actions, Lucia Auth, Stripe, Prisma).
- **`/backend`**: Express.js Service (Auxiliary tasks and microservices).
- **`/prisma`**: (Inside frontend) Shared database schema and migrations.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Stripe & Uploadthing Account (for full functionality)

### Quick Start (Local Development)

1.  **Clone the repository**
2.  **Install dependencies** in the root:
    ```bash
    npm run install:all
    ```
3.  **Setup Environment**:
    - Copy `frontend/.env.example` to `frontend/.env`.
    - Fill in your API keys (Database, Stripe, Uploadthing).
4.  **Launch the full stack**:
    ```bash
    npm run dev
    ```
    - Frontend: `http://localhost:3000`
    - Backend: `http://localhost:3001`

## 🐳 Docker Setup (Production Mode)

The entire platform is containerized for easy deployment.

### Run everything at once:

```bash
docker-compose up --build
```

- **Frontend Container**: Next.js Standalone build (Port 3000).
- **Backend Container**: Node.js Service (Port 3001).
- **Database Container**: Postgres 16 (Port 5433).

## 🛠️ Key Features

- **Storefront**: Dynamic masonry grids, responsive product cards, and detailed item pages.
- **Shopping Flow**: Robust cart logic and secure Stripe checkout.
- **Authentication**: Modern, secure session-based auth using Lucia.
- **Admin Suite**: Product management and dashboard.
- **Sustainability First**: Organic, minimalist design aesthetic with carbon-neutral values.

## 📄 License

Distributed under the MIT License. Produced for portfolio demonstration purposes.

---

*EcoHaven: Crafting a greener tomorrow, one conscious choice at a time.* 🌿✨
