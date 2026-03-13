# Kitabu — Data Flow & Access Audit
> Focused on how data moves through the system: what's exposed, what's trusted, what's missing.
> Prisma v7 `DATABASE_URL`-in-config-only is noted as intentional — not flagged.

---

## 🔴 Critical Data Issues

---

### 1. `fileKey` is exposed to every unauthenticated user
**Files:** `GET /api/books` · `GET /api/books/[id]`

Both public endpoints call `prisma.book.findMany()` and `prisma.book.findUnique()` with no `select` clause. This means the full `Book` record is returned — including `fileKey`, the private R2 object key. Any visitor can open DevTools on the books page and harvest the storage keys for every book in the library, then construct direct R2 URLs to download without paying.

```ts
// ❌ Current — returns fileKey to everyone
const books = await prisma.book.findMany({ where: { ... } })
return NextResponse.json(books)

// ✅ Fix — use select to strip the private field
const books = await prisma.book.findMany({
  where: { ... },
  select: {
    id: true, title: true, author: true, isbn: true,
    genres: true, description: true, coverUrl: true,
    price: true, isFree: true, publishedYear: true,
    pageCount: true, language: true, createdAt: true,
    // fileKey intentionally omitted
  }
})
```

---

### 2. `lib/prisma.ts` uses the Prisma v6 client pattern — incompatible with v7
**File:** `lib/prisma.ts`

The schema uses `provider = "prisma-client-js"` (v6 legacy) and `lib/prisma.ts` instantiates the client with `new PrismaClient()` (no adapter). Per the Prisma v7 architecture, the correct provider is `prisma-client` and instantiation requires a driver adapter — otherwise the constructor throws `"Expected 1 argument, but got 0"`. Every single API route imports from this file, so this breaks the entire application.

```ts
// ❌ Current schema generator
generator client {
  provider = "prisma-client-js"   // v6 legacy
}

// ✅ v7 schema generator (also needs output path)
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

// ❌ Current lib/prisma.ts — no adapter
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: ['query'] })

// ✅ v7 lib/prisma.ts — with pg adapter
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })
```

---

### 3. Admin stats and orders still reference `order.amount` — field doesn't exist
**Files:** `app/api/admin/stats/route.ts` · `app/api/admin/orders/route.ts`

The Prisma `Order` model defines `totalAmount`. Both admin routes still use `amount` in three places: the aggregate `_sum`, the revenue mapping, and the orders list formatting. These will return `NaN` / `0` for all revenue data and crash the admin dashboard at runtime.

```ts
// ❌ In stats route (3 occurrences)
_sum: { amount: true }
revenue: Number(totalRevenue._sum.amount || 0)
amount: Number(o.amount)

// ✅ Fix
_sum: { totalAmount: true }
revenue: Number(totalRevenue._sum.totalAmount || 0)
amount: Number(o.totalAmount)

// ❌ In admin orders route (2 occurrences)
total: Number(order.amount)
order.amount > 0 ? "Pending" : "Free"

// ✅ Fix
total: Number(order.totalAmount)
Number(order.totalAmount) > 0 ? "Pending" : "Free"
```

---

## 🟠 Logic & Flow Bugs

---

### 4. Users can re-purchase books they already own
**File:** `app/api/orders/route.ts`

Before creating an order, the route validates that the books exist but never checks whether the user already has a `Download` record for any of them. A user can add a book they already purchased back to their cart and pay for it again — creating a duplicate order and charging them twice.

```ts
// ✅ Fix — add a check before creating the order
const existingDownloads = await prisma.download.findMany({
  where: {
    userId: session.user.id!,
    bookId: { in: bookIds }
  }
})

if (existingDownloads.length > 0) {
  const alreadyOwned = existingDownloads.map(d => d.bookId)
  return NextResponse.json(
    { error: "You already own some of these books", bookIds: alreadyOwned },
    { status: 400 }
  )
}
```

---

### 5. Partial `bookIds` are silently accepted — price can be manipulated
**File:** `app/api/orders/route.ts`

The client sends `bookIds: ["id1", "id2"]` and the server fetches whatever books match. If one ID is invalid (typo, deleted book, wrong ID), it's silently dropped. The order is then created for fewer books than the user intended, at a lower total — potentially `0` — with no error. A crafty user could also send a mix of real IDs and garbage to manipulate the total.

```ts
// ❌ Current — silently proceeds with partial results
const books = await prisma.book.findMany({ where: { id: { in: bookIds } } })
if (books.length === 0) { return error }  // only catches total failure

// ✅ Fix — validate all requested IDs were found
if (books.length !== bookIds.length) {
  return NextResponse.json(
    { error: "One or more books could not be found" },
    { status: 400 }
  )
}
```

---

### 6. Webhook returns `404` for unknown orders — IntaSend will keep retrying
**File:** `app/api/webhooks/intasend/route.ts`

When IntaSend sends a webhook for an order ID that doesn't exist (race condition, test event, replayed payload), the route returns `{ status: 404 }`. Most payment providers treat any non-`2xx` response as a failure and retry — potentially dozens of times. This can cause noise in logs, unnecessary DB queries, and alert fatigue.

Standard webhook practice is to always return `200` even for unrecognized or irrelevant events, and handle the logic internally.

```ts
// ❌ Current
if (!order) {
  return NextResponse.json({ error: "Order not found" }, { status: 404 })
}

// ✅ Fix — acknowledge receipt, log internally
if (!order) {
  console.warn("Webhook received for unknown orderId:", orderId)
  return NextResponse.json({ message: "Order not found, ignoring" }, { status: 200 })
}
```

---

### 7. `PATCH /api/admin/users` accepts any string as a role
**File:** `app/api/admin/users/route.ts`

The role update endpoint reads `role` from the request body and passes it directly to Prisma with no validation. An admin (or anyone who spoofs an admin session) could set a user's role to any arbitrary string — `"SUPERADMIN"`, `"root"`, `""` — causing a Prisma enum validation error or corrupting the user record.

```ts
// ❌ Current — unvalidated role written to DB
const { userId, role } = await req.json()
await prisma.user.update({ where: { id: userId }, data: { role } })

// ✅ Fix — validate against the known enum values
const validRoles = ['ADMIN', 'MEMBER'] as const
if (!validRoles.includes(role)) {
  return NextResponse.json({ error: "Invalid role" }, { status: 400 })
}
```

---

### 8. `POST /api/orders` creates a PENDING order even when IntaSend fails
**File:** `app/api/orders/route.ts`

The flow is: create order in DB → call IntaSend → if IntaSend throws, return `502`. But the order record already exists in the database as `PENDING` with no way for the user to retry or for the system to clean it up. Over time this produces orphaned PENDING orders that inflate counts and pollute admin reporting.

```ts
// ✅ Fix — defer DB creation until after IntaSend succeeds, or clean up on failure
try {
  const checkout = await intasend.collection().charge({ ... })

  // Only create order after payment gateway confirms
  const order = await prisma.order.create({ ... })
  await prisma.order.update({ where: { id: order.id }, data: { intasendRef: checkout.id } })

  return NextResponse.json({ url: checkout.url, orderId: order.id })
} catch (intasendError) {
  // No orphaned DB record
  return NextResponse.json({ error: "Payment gateway error" }, { status: 502 })
}
```

Alternatively, add a cleanup job or set a TTL-based status sweep for stale PENDING orders.

---

### 9. `GET /api/orders/[id]` fetches the order before verifying ownership
**File:** `app/api/orders/[id]/route.ts`

The route fetches the full order (including all items and book details) and then checks `order.userId !== session.user.id`. If the check fails, a `403` is returned — but the data was already fetched from the database. This is not an exploitable leak since the response is never sent, but it's an unnecessary DB query on every unauthorized access and a pattern that becomes risky if the ownership check is ever accidentally removed or reordered.

```ts
// ✅ Fix — push userId into the query itself, fetch only if owned
const order = await prisma.order.findUnique({
  where: {
    id: params.id,
    userId: session.user.id   // ownership enforced at DB level
  },
  include: { ... }
})

if (!order) {
  // Covers both "not found" and "not yours" without leaking which it is
  return NextResponse.json({ error: "Order not found" }, { status: 404 })
}
```

---

## 🟡 Minor Data Concerns

---

### 10. `log: ['query']` is on in production
**File:** `lib/prisma.ts`

```ts
new PrismaClient({ log: ['query'] })
```

This logs every SQL query — including those with user emails, order IDs, and potentially partial data — to stdout in all environments including production. On a hosted platform this ends up in logs that may be retained, searched, or accessible to support staff. Query logging should be development-only.

```ts
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query'] : [],
})
```

---

### 11. `GET /api/books` returns all books with no pagination
**File:** `app/api/books/route.ts`

The query has no `take` or `skip`. As the catalogue grows, this returns the entire table in a single response — increasing latency, memory usage, and response payload size. At a few hundred books this becomes noticeable; at thousands it becomes a problem.

```ts
// ✅ Add basic pagination
const page = Number(searchParams.get("page") || 1)
const limit = Number(searchParams.get("limit") || 20)

const books = await prisma.book.findMany({
  where: { ... },
  orderBy: { createdAt: 'desc' },
  take: limit,
  skip: (page - 1) * limit,
})
```

---

### 12. Admin role check uses `@ts-ignore` instead of proper session typing
**Files:** Multiple admin routes

Every admin route suppresses TypeScript with `// @ts-ignore` to access `session?.user?.role`. This means if the session type is ever changed or the role is renamed, there's no compile-time safety net — it silently breaks. The fix is to extend the NextAuth session type once in a `types/next-auth.d.ts` declaration file.

```ts
// types/next-auth.d.ts
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "ADMIN" | "MEMBER"
    } & DefaultSession["user"]
  }
}
```

This removes all `@ts-ignore` comments and gives full type safety on `session.user.role` and `session.user.id` across every route.

---

## Summary

| # | Severity | Issue |
|---|---|---|
| 1 | 🔴 | `fileKey` exposed on all public book endpoints |
| 2 | 🔴 | `lib/prisma.ts` uses v6 client pattern — incompatible with v7 |
| 3 | 🔴 | Admin stats/orders still use `order.amount` instead of `totalAmount` |
| 4 | 🟠 | No duplicate ownership check — users can pay for a book twice |
| 5 | 🟠 | Partial `bookIds` silently accepted — price can be under-counted |
| 6 | 🟠 | Webhook returns 404 on unknown order — causes IntaSend retries |
| 7 | 🟠 | `PATCH /api/admin/users` accepts any arbitrary role string |
| 8 | 🟠 | Orphaned PENDING orders created when IntaSend call fails |
| 9 | 🟠 | Ownership check happens after order data is already fetched |
| 10 | 🟡 | Query logging active in production |
| 11 | 🟡 | No pagination on `GET /api/books` |
| 12 | 🟡 | Admin role checks use `@ts-ignore` instead of typed session |