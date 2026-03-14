# Kitabu — v6 Full Audit
> Focus: root cause of 500s, database access, broken feature flows
> Prisma v7 — `url` absent from schema datasource is intentional ✓

---

## Why Every API is Returning 500 — The Root Causes

There are **three compounding root causes** that make the entire database layer fail. They must all be fixed together.

---

### ROOT CAUSE 1 — Wrong Prisma generator provider (`prisma-client-js` vs `prisma-client`)
**File:** `prisma/schema.prisma`

```prisma
// ❌ Current — v6 legacy provider
generator client {
  provider = "prisma-client-js"
}

// ✅ Fix — v7 provider, with mandatory output path
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}
```

With `prisma-client-js`, Prisma v7 generates the wrong client format. The generated code is incompatible with the runtime, causing every `prisma.*` call to fail. After changing this, run `npx prisma generate` to regenerate the client.

---

### ROOT CAUSE 2 — `new PrismaClient()` called with no adapter (throws in Prisma v7)
**File:** `lib/prisma.ts`

```ts
// ❌ Current — v6 style, throws "Expected 1 argument, but got 0" in v7
export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ['query'] })
```

Prisma v7 removed the built-in Rust connection engine. The client **requires** a driver adapter — it cannot connect to Postgres on its own. Every route imports `prisma` from this file, so every single API call to the database crashes before even reaching the query.

```ts
// ✅ Fix — install @prisma/adapter-pg and pg, then:
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

function createPrismaClient() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ 
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

Also update the import path in every route that uses `@/lib/prisma` — the import itself stays the same, only the internal implementation changes.

---

### ROOT CAUSE 3 — Missing packages: `@prisma/adapter-pg`, `pg`, `dotenv`
**File:** `package.json`

```json
// ❌ None of these are in package.json
"@prisma/adapter-pg": "...",
"pg": "...",
"dotenv": "..."
```

- `@prisma/adapter-pg` and `pg` — required for the adapter pattern (Root Cause 2)
- `dotenv` — required by `prisma.config.ts` which has `import "dotenv/config"` at the top. Without it the CLI cannot load `DATABASE_URL` and migrations/seeding fail

```bash
pnpm add @prisma/adapter-pg pg dotenv
pnpm add -D @types/pg
```

After installing, run:
```bash
npx prisma generate   # regenerate client with new provider
npx prisma db push    # or migrate deploy
```

---

## Additional Bugs Causing 500s in Specific Routes

Even after fixing the three root causes above, these will still produce errors:

---

### BUG 4 — Admin stats uses `amount` field that doesn't exist on `Order`
**File:** `app/api/admin/stats/route.ts`

The `Order` model has `totalAmount`. These three references to `amount` cause Prisma to throw a runtime field validation error:

```ts
// ❌ All three wrong
_sum: { amount: true }                          // line 16
revenue: Number(totalRevenue._sum.amount || 0)  // line 40
amount: Number(o.amount),                       // line 48

// ✅ Fix
_sum: { totalAmount: true }
revenue: Number(totalRevenue._sum.totalAmount || 0)
amount: Number(o.totalAmount),
```

---

### BUG 5 — Admin orders uses `order.amount` field that doesn't exist
**File:** `app/api/admin/orders/route.ts`

```ts
// ❌ Both wrong
total: Number(order.amount),
paymentMethod: order.status === "PAID" ? "IntaSend" : order.amount > 0 ? "Pending" : "Free"

// ✅ Fix
total: Number(order.totalAmount),
paymentMethod: order.status === "PAID" ? "IntaSend" : Number(order.totalAmount) > 0 ? "Pending" : "Free"
```

---

### BUG 6 — `POST /api/books` passes `bookSchema` directly to Prisma (field mismatch → 500)
**File:** `app/api/books/route.ts` + `lib/validations/index.ts`

`bookSchema` contains `fileUrl`, `fileFormat`, and `pages` — none of which exist on the `Book` model. `prisma.book.create({ data: validatedData })` throws an unknown field error.

```ts
// ❌ bookSchema has wrong fields
fileUrl: z.string()...    // not in Prisma model
fileFormat: z.string()... // not in Prisma model
pages: z.number()...      // Prisma field is pageCount

// ✅ Option A — fix the schema
export const bookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  description: z.string().min(10),
  price: z.number().min(0),
  isFree: z.boolean().default(false),
  coverUrl: z.string().url().optional().or(z.literal("")),
  fileKey: z.string().min(1, "File key is required"),
  genres: z.array(z.string()).min(1),
  language: z.string().default("en"),
  pageCount: z.number().optional(),
})

// ✅ Option B — keep schema, manually map in the route
const book = await prisma.book.create({
  data: {
    title: validatedData.title,
    author: validatedData.author,
    description: validatedData.description,
    price: validatedData.price,
    isFree: validatedData.isFree,
    coverUrl: validatedData.coverUrl || null,
    fileKey: validatedData.fileKey || "",
    genres: validatedData.genres,
    language: validatedData.language || "en",
    pageCount: validatedData.pages || null,
  }
})
```

---

### BUG 7 — `DELETE /api/books/[id]` crashes on books with purchases or reviews
**File:** `app/api/books/[id]/route.ts`

`prisma.book.delete()` fails with a foreign key constraint error whenever the book has `OrderItem`, `Download`, or `Review` records. The schema has no `onDelete: Cascade` configured.

```ts
// ❌ Current — throws FK constraint error
await prisma.book.delete({ where: { id: params.id } })

// ✅ Fix — delete children first in a transaction
await prisma.$transaction([
  prisma.review.deleteMany({ where: { bookId: params.id } }),
  prisma.download.deleteMany({ where: { bookId: params.id } }),
  prisma.orderItem.deleteMany({ where: { bookId: params.id } }),
  prisma.book.delete({ where: { id: params.id } }),
])
```

---

### BUG 8 — Upload route uses undefined env var `R2_CUSTOM_DOMAIN`
**File:** `app/api/upload/route.ts`

```ts
// ❌ R2_CUSTOM_DOMAIN is never defined anywhere — evaluates to "https://undefined/..."
const publicUrl = `https://${process.env.R2_CUSTOM_DOMAIN}/${fileKey}`

// ✅ Fix
const publicUrl = `${process.env.R2_PUBLIC_URL}/${fileKey}`
```

---

## Broken Feature Flows

---

### FLOW 1 — Seed will fail (blocks all development)
**File:** `prisma/seed.ts`

Four separate problems:

```ts
// ❌ Problem 1: wrong field name
create: { password: adminPassword }  // → passwordHash: adminPassword

// ❌ Problem 2: upsert on non-unique field 'title' (Book has no @unique on title)
where: { title: book.title }  // → use isbn after adding it to seed books

// ❌ Problem 3: unknown field 'fileFormat' on Book model
fileFormat: "PDF, EPUB"  // → remove entirely

// ❌ Problem 4: missing required field 'fileKey' on Book
// → add fileKey: "placeholder/filename.pdf" to each seed book

// ❌ Problem 5: seed creates its own PrismaClient with no adapter
const prisma = new PrismaClient()  // → needs adapter in v7
```

The corrected seed:
```ts
import "dotenv/config"
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from "bcryptjs"

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  const adminPassword = await bcrypt.hash("admin123", 10)

  await prisma.user.upsert({
    where: { email: "admin@kitabu.com" },
    update: {},
    create: {
      email: "admin@kitabu.com",
      name: "Admin User",
      passwordHash: adminPassword,   // ✅ correct field
      role: "ADMIN",
    },
  })

  const books = [
    {
      isbn: "978-9966-001-01-1",     // ✅ unique field for upsert
      title: "The Art of Business Strategy",
      author: "James Kimani",
      description: "A comprehensive guide to modern business strategy in the African context.",
      price: 1500,
      isFree: false,
      coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop",
      fileKey: "placeholder/art-of-business-strategy.pdf",  // ✅ required field
      genres: ["Business", "Strategy"],
      language: "en",                // ✅ matches schema default
    },
    // ... other books same pattern
  ]

  for (const book of books) {
    await prisma.book.upsert({
      where: { isbn: book.isbn },    // ✅ @unique field
      update: {},
      create: book,
    })
  }

  await prisma.$disconnect()
  await pool.end()
}
```

---

### FLOW 2 — `SessionProvider` missing — all auth hooks broken
**File:** `app/layout.tsx`

`useSession()` is called in `checkout/page.tsx`, `my-library/page.tsx`, `header.tsx`, and others. Without `<SessionProvider>`, all of them return `{ data: null, status: "loading" }` forever — checkout never proceeds, my-library never loads, the header never shows the user's name.

```tsx
// ✅ Fix layout.tsx
import { SessionProvider } from 'next-auth/react'

// wrap children:
<SessionProvider>
  <QueryProvider>
    {children}
    <Toaster position="top-center" richColors />
  </QueryProvider>
</SessionProvider>
```

---

### FLOW 3 — `admin/page.tsx` missing `"use client"` — build error
**File:** `app/admin/page.tsx`

The file uses `useQuery` (a React hook) but has no `"use client"` directive. Next.js treats it as a Server Component and throws at build time. The admin dashboard never renders.

```tsx
// ✅ Add as very first line
"use client"
```

---

### FLOW 4 — `admin/books/page.tsx` uses `<Link>` without importing it — compile error
**File:** `app/admin/books/page.tsx`

`<Link>` is used in the View dropdown item but is not in the imports. This is a compile error that prevents the admin books page from building.

```ts
// ✅ Add to imports
import Link from "next/link"
```

---

### FLOW 5 — My Library shows ALL books to every user, downloads fail silently
**File:** `app/my-library/page.tsx`

Two broken endpoints:

```ts
// ❌ Query — fetches public catalogue, not purchased books
const res = await fetch(`/api/books?purchased=true`)
// 'purchased' param is ignored by GET /api/books — returns all books to everyone

// ✅ Fix — create GET /api/my-library that queries Download records
const res = await fetch(`/api/my-library`)

// ❌ Download handler — calls wrong endpoint, checks wrong field
const res = await fetch(`/api/books/${book.id}`)   // returns metadata, not a signed URL
if (data.downloadUrl) { ... }                       // field doesn't exist on that response

// ✅ Fix
const res = await fetch(`/api/downloads/${book.id}`)
if (data.url) { window.open(data.url, '_blank') }
```

Also: `<Image src={book.coverUrl} />` has no fallback — `coverUrl` is nullable in the schema and will crash `<Image>` if null.

---

### FLOW 6 — Cart page is completely disconnected from the Zustand store
**File:** `app/cart/page.tsx`

The cart page uses `useState(initialCartItems)` with hardcoded mock data. The Zustand store (`lib/store/cart.ts`) is what every other page uses — `header.tsx` (badge count), `books/[id]/page.tsx` (add to cart), `checkout/page.tsx` (items list). The cart page shows fake items, removing them has no effect on the real cart, and the checkout will proceed with different items than what the user sees.

```ts
// ❌ Current
const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems)
const removeItem = (id: string) => { setCartItems(...) }

// ✅ Fix
import { useCart } from "@/lib/store/cart"
const { items: cartItems, removeItem } = useCart()
// remove all mock data, remove initialCartItems, remove useState for cart
```

---

### FLOW 7 — Orders page shows hardcoded mock data
**File:** `app/orders/page.tsx`

The page renders a static `const orders = [...]` array — real user orders never appear. There is also no `GET /api/orders` endpoint for listing a user's own orders (only `GET /api/orders/[id]` exists for a single order lookup).

Fix requires:
1. Create `GET /api/orders` that queries `prisma.order.findMany({ where: { userId: session.user.id } })`
2. Replace the mock array in `orders/page.tsx` with a `useQuery` call to that endpoint

---

### FLOW 8 — `checkout/success` page does not exist
**File:** `app/checkout/` (only `page.tsx` present)

`POST /api/orders` tells IntaSend to redirect to:
```
${NEXTAUTH_URL}/checkout/success?orderId=${order.id}
```
After payment, IntaSend sends the user to this URL. The page doesn't exist — users land on a 404 immediately after paying. `app/checkout/success/page.tsx` needs to be created.

---

### FLOW 9 — Free books charged through IntaSend, `phoneNumber` dropped
**File:** `app/api/orders/route.ts` + `app/checkout/page.tsx`

```ts
// ❌ Free books still sent to IntaSend with amount: 0
const total = books.reduce((sum, b) => sum + Number(b.price), 0)
// No branch for total === 0

// ✅ Add before the IntaSend call:
if (total === 0) {
  await prisma.order.update({ where: { id: order.id }, data: { status: 'PAID' } })
  await prisma.download.createMany({
    data: books.map(b => ({ userId: session.user.id!, bookId: b.id })),
    skipDuplicates: true,
  })
  return NextResponse.json({ orderId: order.id, free: true })
}
```

Also: `phoneNumber` is captured in state on the checkout page but never sent in the API body. M-Pesa STK Push requires it.

```ts
// ❌ phoneNumber collected but not sent
body: JSON.stringify({ bookIds: items.map(item => item.id) })

// ✅ Fix
body: JSON.stringify({ bookIds: items.map(item => item.id), phoneNumber })
// Also add phoneNumber to orderSchema in lib/validations/index.ts
// And forward it to intasend.collection().charge({ phone_number: phoneNumber })
```

---

### FLOW 10 — Cart not cleared after checkout redirect
**File:** `app/checkout/page.tsx`

After `window.location.href = data.url`, the Zustand cart is never cleared. When the user returns from IntaSend, all paid-for items are still sitting in the cart.

```ts
// ✅ Fix — add clearCart to the component
const clearCart = useCart((state) => state.clearCart)

// in handleCheckout, before redirect:
clearCart()
window.location.href = data.url
```

---

## Full Issue List

| # | Severity | Location | Issue |
|---|---|---|---|
| 1 | 🔴 500 on all routes | `prisma/schema.prisma` | Wrong generator provider `prisma-client-js` → `prisma-client` |
| 2 | 🔴 500 on all routes | `lib/prisma.ts` | No driver adapter — v7 requires `PrismaPg` + `pg.Pool` |
| 3 | 🔴 500 on all routes | `package.json` | Missing `@prisma/adapter-pg`, `pg`, `dotenv` |
| 4 | 🔴 500 | `api/admin/stats` | `_sum: { amount }` → `totalAmount` (×3) |
| 5 | 🔴 500 | `api/admin/orders` | `order.amount` → `order.totalAmount` (×2) |
| 6 | 🔴 500 | `api/books` POST | `bookSchema` has wrong fields — Prisma create fails |
| 7 | 🔴 500 | `api/books/[id]` DELETE | No cascade — FK constraint error on books with orders/reviews |
| 8 | 🔴 broken | `api/upload` | `R2_CUSTOM_DOMAIN` undefined → `R2_PUBLIC_URL` |
| 9 | 🔴 build error | `app/admin/page.tsx` | Missing `"use client"` directive |
| 10 | 🔴 compile error | `app/admin/books/page.tsx` | Missing `import Link from "next/link"` |
| 11 | 🔴 broken | `app/layout.tsx` | Missing `<SessionProvider>` — all auth hooks return null |
| 12 | 🔴 broken | `prisma/seed.ts` | `password` → `passwordHash`, bad upsert key, unknown fields, no adapter |
| 13 | 🟠 broken feature | `app/my-library/page.tsx` | Wrong query endpoint, wrong download endpoint, no `coverUrl` fallback |
| 14 | 🟠 broken feature | `app/cart/page.tsx` | Hardcoded mock data, disconnected from Zustand store |
| 15 | 🟠 broken feature | `app/orders/page.tsx` | Hardcoded mock data, no `GET /api/orders` user list route |
| 16 | 🟠 broken feature | `app/checkout/success` | Page doesn't exist — users hit 404 after paying |
| 17 | 🟠 broken feature | `api/orders` POST | Free books charged through IntaSend |
| 18 | 🟠 broken feature | `app/checkout/page.tsx` | `phoneNumber` never sent to API |
| 19 | 🟠 broken feature | `app/checkout/page.tsx` | Cart never cleared after redirect |
| 20 | 🟠 broken feature | `lib/validations/index.ts` | `bookSchema` fields mismatch Prisma model |