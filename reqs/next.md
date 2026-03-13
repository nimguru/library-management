# 🔍 Kitabu — Audit Report: Requirements vs. Implementation

> **Analysed against:** `reqs/prd.md`  
> **Date:** March 13, 2026

---

## ✅ What You've Completed (Great Progress!)

You've done a significant amount of work since the last review. Here's what is now genuinely done:

| Area | Status |
|---|---|
| All critical packages installed (Prisma, NextAuth, IntaSend, R2 SDK, bcryptjs, Zustand) | ✅ Done |
| Prisma schema — full, matches PRD exactly | ✅ Done |
| Prisma seed file | ✅ Done |
| `lib/prisma.ts` singleton | ✅ Done |
| `lib/auth.ts` with CredentialsProvider, JWT + session callbacks | ✅ Done |
| `lib/r2.ts` with S3 client + `getSignedDownloadUrl` | ✅ Done |
| `lib/intasend.ts` client singleton | ✅ Done |
| `lib/store/cart.ts` Zustand store with persistence | ✅ Done |
| `lib/validations/index.ts` Zod schemas (book, register, login, order) | ✅ Done |
| `middleware.ts` protecting `/my-library`, `/admin`, `/checkout` | ✅ Done |
| `app/api/auth/[...nextauth]/route.ts` | ✅ Done |
| `app/api/auth/register/route.ts` | ✅ Done |
| `app/api/books/route.ts` (GET list + POST create) | ✅ Done |
| `app/api/books/[id]/route.ts` (GET + PATCH + DELETE) | ✅ Done |
| `app/api/orders/route.ts` (POST with IntaSend integration) | ✅ Done |
| `app/api/orders/[id]/route.ts` (GET with ownership check) | ✅ Done |
| `app/api/downloads/[bookId]/route.ts` (signed URL) | ✅ Done |
| `app/api/webhooks/intasend/route.ts` (payment → Download records) | ✅ Done |
| `app/api/upload/route.ts` (presigned upload URL for R2) | ✅ Done |
| `app/api/admin/stats/route.ts` | ✅ Done |
| `app/api/admin/orders/route.ts` | ✅ Done |
| `app/api/admin/users/route.ts` (GET + PATCH role) | ✅ Done |
| Login page wired to `signIn()` with toast feedback | ✅ Done |
| Register page wired to `POST /api/auth/register` | ✅ Done |
| Books page (`/books`) uses `useQuery` → real API | ✅ Done |
| Cart page uses Zustand store (real state) | ✅ Done |
| Checkout page wired to `POST /api/orders` + IntaSend redirect | ✅ Done |
| My Library uses `useQuery` with loading/error states | ✅ Done |
| Admin dashboard pulls real stats via `useQuery` | ✅ Done |
| Admin books page: list, search, delete mutation | ✅ Done |
| `QueryProvider` wrapping the app in `layout.tsx` | ✅ Done |
| Sonner `<Toaster>` in layout | ✅ Done |
| `app/error.tsx` global error boundary | ✅ Done |
| `app/books/loading.tsx` and `app/admin/loading.tsx` | ✅ Done |
| Header shows live cart badge count + session-aware auth buttons | ✅ Done |

---

## ❌ What Is Still Missing

### 1. `DATABASE_URL` Missing from Prisma Schema
**File:** `prisma/schema.prisma`  
The `datasource db` block has no `url` field:
```prisma
// ❌ CURRENT — will fail to connect
datasource db {
  provider = "postgresql"
}

// ✅ REQUIRED
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
Without this, `npx prisma migrate dev` and all database operations will fail entirely.

---

### 2. No `.env.local` / `.env.example` File
The project has no environment configuration file committed. Every developer who clones this will be stuck. Add a `.env.example` (committed) listing all required keys:
```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
R2_CUSTOM_DOMAIN=
INTASEND_PUBLISHABLE_KEY=
INTASEND_SECRET_KEY=
INTASEND_WEBHOOK_SECRET=
```

---

### 3. No `SessionProvider` in Layout
**File:** `app/layout.tsx`  
`next-auth/react` hooks (`useSession`, `signIn`, `signOut`) require a `<SessionProvider>` wrapping the app. It is missing — these hooks will silently return `null` or throw errors at runtime.

```tsx
// ✅ Required addition to layout.tsx
import { SessionProvider } from "next-auth/react"
// Wrap children with <SessionProvider>
```

---

### 4. No `checkout/success` Page
**File:** `app/api/orders/route.ts` references a redirect URL:
```ts
redirect_url: `${process.env.NEXTAUTH_URL}/checkout/success?orderId=${order.id}`
```
The page `app/checkout/success/page.tsx` does not exist. After payment, users will land on a 404. This page should show a confirmation message, clear the cart, and link to My Library.

---

### 5. `app/orders/page.tsx` Still Uses Mock Data
The user-facing Orders History page was **not updated**. It still uses a hardcoded `const orders: Order[]` array instead of fetching from `GET /api/orders/[id]` or a user orders list endpoint. There is also no `GET /api/orders` (list all user orders) route — only `GET /api/orders/[id]` exists.

**Needs:**
- A `GET /api/orders` route (list all orders for the current user, not just admin)
- The `/orders` page wired to `useQuery` calling that endpoint

---

### 6. `my-library/page.tsx` Calls the Wrong API
**File:** `app/my-library/page.tsx`  
The download handler calls `GET /api/books/${book.id}` and looks for `data.downloadUrl`, but that route only returns a book record — not a download URL. The correct endpoint is `GET /api/downloads/${book.id}`.

Also, the query fetches `/api/books?purchased=true` — but the books API has no `purchased` filter. There is no mechanism to return only books the current user has purchased. A separate endpoint like `GET /api/my-library` or a `purchased=true` filter in the books API is needed.

---

### 7. Admin Books Page — "Add Book" Button Does Nothing
**File:** `app/admin/books/page.tsx`  
The `<Button>Add Book</Button>` exists in the UI but has no `onClick` handler and no dialog/form wired to it. Admins cannot create books from the UI. The `POST /api/books` and `POST /api/upload` routes exist but are never called from the frontend.

---

### 8. Admin Dashboard Page — Missing `"use client"` Directive
**File:** `app/admin/page.tsx`  
This page uses `useQuery` (a React hook), which requires it to be a Client Component. The file has no `"use client"` directive at the top. This will cause a build error:
> Error: `useState` and `useQuery` cannot be used in a Server Component.

---

### 9. IntaSend Webhook Has No Signature Verification
**File:** `app/api/webhooks/intasend/route.ts`  
The webhook processes payment callbacks with zero authentication. Anyone can hit this endpoint with a fake payload and mark any order as PAID. The PRD mentions verifying the webhook signature — this critical security step is not implemented.

---

### 10. No `not-found.tsx` (404 Page)
The PRD's Phase 5 polish list includes this. `app/error.tsx` exists but `app/not-found.tsx` does not.

---

### 11. Admin Books Page — No "Edit Book" Form
The edit (pencil) icon in the books table dropdown exists but likely has no form wired to it. The `PATCH /api/books/[id]` endpoint exists server-side, but the admin UI has no dialog/modal to actually edit a book's details.

---

### 12. Free Books Flow Not Handled
When `book.isFree === true`, the order flow still calls `POST /api/orders` → IntaSend. A free book should bypass payment entirely and directly create a `Download` record. Currently, free books would go through the payment gateway unnecessarily, which will either fail or charge KES 0.

---

## 🐛 Bugs Found

### Bug 1 — `prisma.order.aggregate` Queries Wrong Field (Will Crash)
**File:** `app/api/admin/stats/route.ts`, line ~18  
```ts
// ❌ BUG — 'amount' does not exist on Order model
const totalRevenue = await prisma.order.aggregate({
  where: { status: "PAID" },
  _sum: { amount: true }  // ← Field is 'totalAmount', not 'amount'
})
```
The Prisma schema names the field `totalAmount`. This will throw a runtime error every time the admin dashboard loads.  
**Fix:**
```ts
_sum: { totalAmount: true }
// and update reference:
revenue: Number(totalRevenue._sum.totalAmount || 0)
```

---

### Bug 2 — Admin Orders API References Wrong Field (`order.amount`)
**File:** `app/api/admin/orders/route.ts`, line ~53  
```ts
// ❌ BUG — same issue
total: Number(order.amount),  // 'amount' doesn't exist
paymentMethod: order.amount > 0 ? "Pending" : "Free"  // also broken
```
**Fix:** Replace with `order.totalAmount`.

---

### Bug 3 — Admin Stats API References Wrong Field (`o.amount`)
**File:** `app/api/admin/stats/route.ts`, in `recentOrders.map()`
```ts
amount: Number(o.amount),  // ❌ should be o.totalAmount
```

---

### Bug 4 — Seed File References Wrong Field (`password` instead of `passwordHash`)
**File:** `prisma/seed.ts`, line ~14  
```ts
// ❌ BUG — Prisma schema has 'passwordHash', not 'password'
create: {
  email: "admin@kitabu.com",
  name: "Admin User",
  password: adminPassword,  // ← wrong field name
  role: "ADMIN",
},
```
Running `npx prisma db seed` will throw a Prisma validation error.  
**Fix:** Change `password` to `passwordHash`.

---

### Bug 5 — Seed File Uses Non-Existent Unique Field for `upsert`
**File:** `prisma/seed.ts`, line ~43  
```ts
// ❌ BUG — 'title' is not a @unique field on Book
await prisma.book.upsert({
  where: { title: book.title },  // ← will throw error
```
Prisma `upsert` requires a unique field. `title` is not marked `@unique` in the schema.  
**Fix:** Either use `isbn` (if you set it in seed data) or use `create`/`findFirst` pattern instead of `upsert`.

---

### Bug 6 — `books/route.ts` POST Sends Wrong Shape to Prisma
**File:** `app/api/books/route.ts`  
The `bookSchema` in `lib/validations/index.ts` includes fields like `fileUrl`, `fileFormat`, `pages` which do **not exist** on the Prisma `Book` model. The model expects `fileKey`, `pageCount`, and has no `fileFormat` or `fileUrl`. Calling `prisma.book.create({ data: validatedData })` will fail because of unknown fields.  
**Fix:** Map `validatedData` to the correct Prisma model shape before calling create.

---

### Bug 7 — `R2_CUSTOM_DOMAIN` env var is Undefined in Upload Route
**File:** `app/api/upload/route.ts`, line ~35  
```ts
const publicUrl = `https://${process.env.R2_CUSTOM_DOMAIN}/${fileKey}`
```
`R2_CUSTOM_DOMAIN` is not listed in the PRD env vars (it uses `R2_PUBLIC_URL`). If undefined, all upload responses return `"https://undefined/..."` as the public URL.  
**Fix:** Use `process.env.R2_PUBLIC_URL` consistently, or add `R2_CUSTOM_DOMAIN` to `.env`.

---

### Bug 8 — Register Page Says "8 characters" but Zod Validates Minimum 6
**File:** `app/register/page.tsx`, UI hint reads:
> "Must be at least 8 characters"

But `lib/validations/index.ts`:
```ts
password: z.string().min(6, "Password must be at least 6 characters")
```
This is a minor UX inconsistency — users will see the UI hint say 8 but can register with 6.

---

### Bug 9 — `checkout/page.tsx` Phone Number Not Passed to IntaSend
**File:** `app/checkout/page.tsx`  
The M-Pesa phone number input is captured in state (`phoneNumber`) but is **never sent** in the `POST /api/orders` request body. IntaSend requires the phone number for STK Push to work. M-Pesa payments will either fail or fall back to a generic hosted page that re-asks for the number.

---

### Bug 10 — `my-library` Download Handler Calls Wrong Endpoint
**File:** `app/my-library/page.tsx`  
```ts
// ❌ BUG — calls the book detail API, not the download API
const res = await fetch(`/api/books/${book.id}`)
const data = await res.json()
if (data.downloadUrl) { ... }  // 'downloadUrl' never exists in book response
```
**Fix:**
```ts
const res = await fetch(`/api/downloads/${book.id}`)
const data = await res.json()
if (data.url) { window.open(data.url, '_blank') }
```

---

## Summary Table

| Category | Count |
|---|---|
| ✅ Requirements completed | ~33 items |
| ❌ Requirements still missing | 12 items |
| 🐛 Bugs (will crash or break functionality) | 10 bugs |

### Priority Order for Fixes

**Fix immediately (blockers):**
1. Add `url = env("DATABASE_URL")` to schema — nothing works without this
2. Fix `passwordHash` field name in seed — seeding fails
3. Fix `totalAmount` field name in admin stats/orders APIs — admin dashboard crashes
4. Add `SessionProvider` to `layout.tsx` — auth hooks won't work
5. Fix `bookSchema` → Prisma field mapping in `POST /api/books`
6. Fix download handler in `my-library` to call correct endpoint

**Fix soon (broken features):**
7. Wire "Add Book" form in admin books page
8. Create `app/checkout/success/page.tsx`
9. Add user orders list API + wire `/orders` page off mock data
10. Handle free books bypass in checkout flow
11. Pass phone number to `POST /api/orders` for M-Pesa STK Push
12. Fix seed `upsert` to use a valid unique field

**Polish:**
13. Add webhook signature verification
14. Add `.env.example`
15. Add `"use client"` to admin dashboard page
16. Add `app/not-found.tsx`
17. Fix `R2_CUSTOM_DOMAIN` → `R2_PUBLIC_URL` env var
18. Fix password minimum length inconsistency (UI says 8, Zod validates 6)

---

*Audited against `reqs/prd.md` — Digital Library Management System.*