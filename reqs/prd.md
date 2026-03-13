# 📚 Digital Library Management System — Full Stack Starter Guide

> **Stack:** Next.js 14 · PostgreSQL · Prisma · IntaSend · Cloudflare R2

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Project Setup](#2-project-setup)
3. [Database Schema (Prisma)](#3-database-schema-prisma)
4. [Folder Structure](#4-folder-structure)
5. [Key Code Snippets](#5-key-code-snippets)
6. [API Routes Reference](#6-api-routes-reference)
7. [Authentication & Route Protection](#7-authentication--route-protection)
8. [IntaSend Payment Integration](#8-intasend-payment-integration)
9. [Cloudflare R2 File Storage](#9-cloudflare-r2-file-storage)
10. [Development Workflow](#10-development-workflow)
11. [Deployment Checklist](#11-deployment-checklist)
12. [Recommended Next Steps (v2 Ideas)](#12-recommended-next-steps-v2-ideas)

---

## 1. Project Overview

This guide walks you through building a full-featured digital library platform where users can browse, purchase, and download books online. The system is built on the modern JavaScript ecosystem with a clean separation between the storefront, user dashboard, and admin panel.

### What You're Building

- A searchable catalogue of digital books (PDFs / EPUBs)
- Secure user registration and role-based access
- A shopping cart and checkout powered by IntaSend (Kenya-native payments)
- A personal library dashboard — users access books they have purchased
- A Cloudflare R2-backed file system with signed, expiring download URLs
- An admin panel to manage books, users, and orders

### Tech Stack at a Glance

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 14 (App Router) | Pages, API routes, server components |
| Database | PostgreSQL | Production-grade relational database |
| ORM | Prisma | Type-safe database access layer |
| Auth | NextAuth.js v5 | Email/password + session management |
| Payments | IntaSend | STK Push (M-Pesa), card payments |
| File Storage | Cloudflare R2 | S3-compatible, cheap egress |
| UI | shadcn/ui + Tailwind CSS | Accessible component library |
| Validation | Zod | Schema validation for forms & APIs |
| Forms | React Hook Form | Performant, type-safe forms |
| State/Cache | TanStack Query | Server state and caching |

---

## 2. Project Setup

### 2.1 Scaffold the Next.js App

Run the following commands to bootstrap your project. When prompted, select: TypeScript ✓, Tailwind CSS ✓, App Router ✓, src/ directory ✓.

```bash
npx create-next-app@latest digital-library --typescript --tailwind --app
cd digital-library
```

### 2.2 Install Core Dependencies

```bash
# Database & Auth
npm install prisma @prisma/client next-auth@beta bcryptjs
npm install -D @types/bcryptjs

# Validation & Forms
npm install zod react-hook-form @hookform/resolvers

# UI Components
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input label badge

# Cloudflare R2 (S3-compatible SDK)
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# IntaSend Payment Gateway
npm install intasend-node

# State Management
npm install @tanstack/react-query

# Utilities
npm install lucide-react clsx tailwind-merge
```

### 2.3 Environment Variables

Create a `.env.local` file in the project root:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/digital_library"

# NextAuth
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Cloudflare R2
R2_ACCOUNT_ID="your-cloudflare-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key"
R2_SECRET_ACCESS_KEY="your-r2-secret-key"
R2_BUCKET_NAME="digital-library-books"
R2_PUBLIC_URL="https://your-bucket.r2.dev"

# IntaSend
INTASEND_PUBLISHABLE_KEY="ISPubKey_..."
INTASEND_SECRET_KEY="ISSecretKey_..."
INTASEND_WEBHOOK_SECRET="your-webhook-secret"
```

---

## 3. Database Schema (Prisma)

Run `npx prisma init` to create the `prisma/` folder, then replace `prisma/schema.prisma` with the schema below.

### 3.1 Initialize Prisma

```bash
npx prisma init
# Then update prisma/schema.prisma (see below)
```

### 3.2 Full Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String     @id @default(cuid())
  name         String
  email        String     @unique
  passwordHash String
  role         Role       @default(MEMBER)
  createdAt    DateTime   @default(now())
  orders       Order[]
  downloads    Download[]
  reviews      Review[]
}

model Book {
  id            String      @id @default(cuid())
  title         String
  author        String
  isbn          String?     @unique
  genres        String[]
  description   String
  coverUrl      String?
  fileKey       String      // R2 object key (never expose this directly)
  price         Decimal     @db.Decimal(10,2)
  isFree        Boolean     @default(false)
  publishedYear Int?
  pageCount     Int?
  language      String      @default("en")
  createdAt     DateTime    @default(now())
  orderItems    OrderItem[]
  downloads     Download[]
  reviews       Review[]
}

model Order {
  id          String      @id @default(cuid())
  userId      String
  user        User        @relation(fields: [userId], references: [id])
  status      OrderStatus @default(PENDING)
  totalAmount Decimal     @db.Decimal(10,2)
  currency    String      @default("KES")
  intasendRef String?     // IntaSend invoice ID
  createdAt   DateTime    @default(now())
  items       OrderItem[]
}

model OrderItem {
  id      String  @id @default(cuid())
  orderId String
  order   Order   @relation(fields: [orderId], references: [id])
  bookId  String
  book    Book    @relation(fields: [bookId], references: [id])
  price   Decimal @db.Decimal(10,2)
}

model Download {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  bookId    String
  book      Book      @relation(fields: [bookId], references: [id])
  grantedAt DateTime  @default(now())
  expiresAt DateTime? // null = lifetime access

  @@unique([userId, bookId])
}

model Review {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  bookId    String
  book      Book     @relation(fields: [bookId], references: [id])
  rating    Int      // 1–5
  comment   String?
  createdAt DateTime @default(now())

  @@unique([userId, bookId])
}

enum Role {
  MEMBER
  ADMIN
}

enum OrderStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}
```

### 3.3 Run Migrations

```bash
npx prisma migrate dev --name init
npx prisma generate

# Optional: open Prisma Studio to view your data
npx prisma studio
```

---

## 4. Folder Structure

```
src/
├── app/
│   ├── (auth)/                  # Public auth pages
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (shop)/                  # Public-facing store
│   │   ├── books/
│   │   │   ├── page.tsx         # Browse & search
│   │   │   └── [id]/page.tsx    # Book detail + buy
│   │   ├── cart/page.tsx
│   │   └── checkout/page.tsx
│   ├── (dashboard)/             # Authenticated user area
│   │   ├── my-library/page.tsx  # Purchased books
│   │   └── orders/page.tsx      # Order history
│   ├── admin/                   # Admin-only panel
│   │   ├── layout.tsx           # Admin guard
│   │   ├── books/page.tsx       # CRUD books
│   │   ├── orders/page.tsx
│   │   └── users/page.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── books/
│       │   ├── route.ts           # GET list, POST create
│       │   └── [id]/route.ts      # GET, PATCH, DELETE
│       ├── orders/
│       │   ├── route.ts           # POST: create order
│       │   └── [id]/route.ts      # GET: order status
│       ├── downloads/
│       │   └── [bookId]/route.ts  # GET: signed URL
│       └── webhooks/
│           └── intasend/route.ts  # POST: payment callback
├── lib/
│   ├── prisma.ts                # Prisma singleton
│   ├── auth.ts                  # NextAuth config
│   ├── r2.ts                    # Cloudflare R2 client
│   └── intasend.ts              # IntaSend client
├── components/
│   ├── books/BookCard.tsx
│   ├── books/SearchBar.tsx
│   ├── cart/CartDrawer.tsx
│   └── ui/                      # shadcn components
└── middleware.ts                 # Route protection
```

---

## 5. Key Code Snippets

### 5.1 Prisma Client Singleton (`lib/prisma.ts`)

```ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ['query'] })

if (process.env.NODE_ENV !== 'production')
  globalForPrisma.prisma = prisma
```

### 5.2 Cloudflare R2 Client (`lib/r2.ts`)

```ts
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

// Generate a signed URL valid for 15 minutes
export async function getSignedDownloadUrl(fileKey: string) {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: fileKey,
  })
  return getSignedUrl(r2, command, { expiresIn: 900 })
}
```

### 5.3 Download API Route — Protected (`api/downloads/[bookId]/route.ts`)

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSignedDownloadUrl } from '@/lib/r2'

export async function GET(
  req: NextRequest,
  { params }: { params: { bookId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify the user owns this book
  const download = await prisma.download.findUnique({
    where: { userId_bookId: { userId: session.user.id, bookId: params.bookId } },
    include: { book: true }
  })

  if (!download) return NextResponse.json({ error: 'Not purchased' }, { status: 403 })

  const url = await getSignedDownloadUrl(download.book.fileKey)
  return NextResponse.json({ url })
}
```

### 5.4 IntaSend Checkout (`api/orders/route.ts`)

```ts
import IntaSend from 'intasend-node'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const intasend = new IntaSend(
  process.env.INTASEND_PUBLISHABLE_KEY!,
  process.env.INTASEND_SECRET_KEY!,
  process.env.NODE_ENV !== 'production' // test mode in dev
)

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { bookIds } = await req.json()

  const books = await prisma.book.findMany({ where: { id: { in: bookIds } } })
  const total = books.reduce((sum, b) => sum + Number(b.price), 0)

  // Create order in DB as PENDING
  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      totalAmount: total,
      items: { create: books.map(b => ({ bookId: b.id, price: b.price })) }
    }
  })

  // Create IntaSend invoice
  const invoice = await intasend.collection().charge({
    first_name: session.user.name,
    email: session.user.email,
    amount: total,
    currency: 'KES',
    api_ref: order.id,
  })

  // Save IntaSend reference
  await prisma.order.update({
    where: { id: order.id },
    data: { intasendRef: invoice.id }
  })

  return Response.json({ checkoutUrl: invoice.url, orderId: order.id })
}
```

### 5.5 IntaSend Webhook — Grant Access After Payment (`api/webhooks/intasend/route.ts`)

```ts
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const payload = await req.json()

  // Verify webhook signature (see IntaSend docs)
  if (payload.state !== 'COMPLETE') return Response.json({ ok: true })

  const order = await prisma.order.findFirst({
    where: { intasendRef: payload.invoice.id },
    include: { items: true }
  })

  if (!order || order.status === 'PAID') return Response.json({ ok: true })

  // Mark order as PAID and create download access records
  await prisma.$transaction([
    prisma.order.update({ where: { id: order.id }, data: { status: 'PAID' } }),
    ...order.items.map(item =>
      prisma.download.upsert({
        where: { userId_bookId: { userId: order.userId, bookId: item.bookId } },
        create: { userId: order.userId, bookId: item.bookId },
        update: {},
      })
    )
  ])

  return Response.json({ ok: true })
}
```

---

## 6. API Routes Reference

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/books` | Public | List & search books with filters |
| `GET` | `/api/books/[id]` | Public | Single book details |
| `POST` | `/api/books` | Admin | Upload a new book record |
| `PATCH` | `/api/books/[id]` | Admin | Update book metadata |
| `DELETE` | `/api/books/[id]` | Admin | Remove a book |
| `POST` | `/api/orders` | User | Create order & get checkout URL |
| `GET` | `/api/orders/[id]` | User | Get order status |
| `GET` | `/api/downloads/[bookId]` | User (owner) | Get signed R2 download URL |
| `POST` | `/api/webhooks/intasend` | IntaSend | Payment callback → grant access |
| `GET` | `/api/admin/users` | Admin | List all users |
| `GET` | `/api/admin/orders` | Admin | List all orders |

---

## 7. Authentication & Route Protection

### 7.1 NextAuth Configuration (`lib/auth.ts`)

```ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })
        if (!user) return null
        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )
        if (!valid) return null
        return { id: user.id, name: user.name, email: user.email, role: user.role }
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) { token.id = user.id; token.role = user.role }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as string
      return session
    }
  }
})
```

### 7.2 Middleware — Protect Routes (`middleware.ts`)

```ts
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const isAdmin = req.auth?.user?.role === 'ADMIN'

  // Protect dashboard routes
  if (pathname.startsWith('/my-library') && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Protect admin routes
  if (pathname.startsWith('/admin') && !isAdmin) {
    return NextResponse.redirect(new URL('/', req.url))
  }
})

export const config = {
  matcher: ['/my-library/:path*', '/admin/:path*', '/checkout/:path*']
}
```

---

## 8. IntaSend Payment Integration

> 💡 IntaSend supports M-Pesa STK Push, Visa/Mastercard, and bank transfers. Sign up at [intasend.com](https://intasend.com) to get your API keys. Use test keys during development.

### Payment Flow

1. User adds books to cart and clicks Checkout
2. `POST /api/orders` creates order in DB (status: `PENDING`) and calls IntaSend
3. IntaSend returns a hosted checkout URL — redirect the user there
4. User completes payment on IntaSend's page (M-Pesa, card, etc.)
5. IntaSend sends a webhook to `POST /api/webhooks/intasend`
6. Webhook verifies signature, updates order to `PAID`, creates `Download` records
7. User is now able to download their books via signed R2 URLs

### Testing with IntaSend Sandbox

```bash
# Set test mode (3rd arg = true) in intasend-node init:
const intasend = new IntaSend(pubKey, secretKey, true)

# Test M-Pesa number: +254708374149
# Test card: 4000 0000 0000 0002
```

---

## 9. Cloudflare R2 File Storage

> 🪣 R2 is S3-compatible with zero egress fees — perfect for downloadable files. Never expose `fileKey` to the frontend. Always generate short-lived signed URLs.

### 9.1 Setup Bucket

1. Log into Cloudflare Dashboard → R2 → Create Bucket → name it `digital-library-books`
2. Go to R2 → Manage R2 API Tokens → Create Token with **Object Read & Write**
3. Copy Account ID, Access Key ID, and Secret Access Key to `.env.local`

### 9.2 Uploading a Book File (Admin)

```ts
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { r2 } from '@/lib/r2'

export async function uploadBookFile(file: Buffer, filename: string) {
  const key = `books/${Date.now()}-${filename}`

  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: file,
    ContentType: 'application/pdf',
  }))

  return key  // Store this in Book.fileKey — never expose to users
}
```

### 9.3 Generating Download URLs

When a user requests to download a book they've purchased, call `getSignedDownloadUrl(book.fileKey)` from `lib/r2.ts` (shown in Section 5.2). The URL expires in 15 minutes and cannot be shared or reused.

---

## 10. Development Workflow

### Recommended Build Order

1. Set up the database schema and run migrations
2. Implement auth (register, login, NextAuth session)
3. Build the books API (GET list, GET by ID)
4. Build the book browsing and search UI
5. Set up Cloudflare R2 and the admin book upload form
6. Implement cart state (Zustand or React context)
7. Build checkout flow with IntaSend (use sandbox first)
8. Implement the webhook to unlock downloads on payment
9. Build the My Library page with download buttons
10. Build the Admin dashboard (orders, users, books)
11. Write Zod validation for all API inputs
12. Add error handling, loading states, and toast notifications

### Useful Commands

```bash
npm run dev                    # Start dev server
npx prisma migrate dev         # Apply schema changes
npx prisma studio              # Visual database editor
npx prisma db seed             # Seed with test data
npx prisma generate            # Regenerate client after schema changes
```

---

## 11. Deployment Checklist

| Item | Action |
|---|---|
| Next.js App | Deploy to Vercel — automatic with GitHub integration |
| PostgreSQL | Use [Neon.tech](https://neon.tech) or Supabase (free tier available) |
| Environment Vars | Add all `.env.local` values to Vercel project settings |
| IntaSend Webhook | Set webhook URL to `https://your-domain.com/api/webhooks/intasend` |
| R2 CORS | Configure Cloudflare R2 CORS policy to allow your domain |
| NEXTAUTH_URL | Update to your production domain |
| NEXTAUTH_SECRET | Generate a strong secret: `openssl rand -base64 32` |
| Test Payments | Switch IntaSend to live keys and test a real KES 1 transaction |

---

## 12. Recommended Next Steps (v2 Ideas)

- In-browser PDF reader using `react-pdf` — so users can read without downloading
- Book wishlist / save for later
- Email notifications with [Resend](https://resend.com) — order confirmation, download ready
- Review and rating system (schema already supports this)
- Genre filtering and recommendations based on purchase history
- Discount codes and promotional pricing
- Author profiles with multiple books
- Bulk upload tool for admins (CSV import)

---

*Happy building! 🚀  Built with Next.js · Prisma · IntaSend · Cloudflare R2*