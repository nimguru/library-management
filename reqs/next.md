# 📚 Library Management System — Next Phase Implementation Plan

> **Project:** Kitabu Digital Library  
> **Stack:** Next.js 16 · PostgreSQL · Prisma · IntaSend · Cloudflare R2  
> **Document Date:** March 13, 2026  

---

## Executive Summary

The project has a solid UI foundation: all major pages are scaffolded (home, books browse, book detail, cart, checkout, my-library, orders, auth, and the full admin panel) with polished shadcn/ui components and realistic mock data. However, **zero backend infrastructure exists** — no database, no auth, no API routes, no file storage, and no payment integration. Every page uses hardcoded mock data and placeholder handlers.

The next phase is to replace the static shell with a fully working backend, wire the UI to real data, and deliver a functional end-to-end product.

---

## Current State Analysis

### ✅ What Exists (Done)

| Area | Status | Notes |
|---|---|---|
| UI Pages | ✅ Complete | All pages scaffolded with mock data |
| shadcn/ui Components | ✅ Complete | Full component library installed |
| Tailwind / Styling | ✅ Complete | Theme configured, responsive layouts done |
| Form UI | ✅ Shells only | Login, register, checkout forms have no logic |
| Cart UI | ✅ Shell only | Static mock items, no state management |
| Admin Dashboard UI | ✅ Shell only | Mock stats and tables |
| Book Browse + Search | ✅ Shell only | Filters work on hardcoded array only |

### ❌ What Is Missing (Not Started)

| Area | Status | Notes |
|---|---|---|
| Prisma + PostgreSQL | ❌ Missing | No `prisma/` folder, no schema, no migrations |
| NextAuth.js | ❌ Missing | Not installed; login form is a mock `setTimeout` |
| API Routes | ❌ Missing | No `app/api/` directory exists at all |
| Middleware (route protection) | ❌ Missing | No `middleware.ts` |
| Cloudflare R2 Integration | ❌ Missing | No SDK, no file upload, no signed URLs |
| IntaSend Payment | ❌ Missing | Not installed; checkout is a fake `alert()` |
| Cart State Management | ❌ Missing | No global state; cart is a hardcoded local array |
| Zod Validation | ⚠️ Installed | Package present but unused — no schemas written |
| React Hook Form Logic | ⚠️ Installed | Package present but forms have no `useForm` wiring |
| TanStack Query | ❌ Missing | Not installed; no server state caching |
| Environment Config | ❌ Missing | No `.env.local`, no `.env.example` |
| `lib/` Utilities | ❌ Missing | No `prisma.ts`, `auth.ts`, `r2.ts`, `intasend.ts` |
| Error / Loading States | ❌ Missing | No Suspense boundaries, no error.tsx files |
| `src/` Directory Structure | ⚠️ Mismatch | PRD specifies `src/app/` but project uses `app/` at root |

---

## Implementation Phases

---

### Phase 1 — Foundation & Infrastructure
**Goal:** Get a working database, auth, and environment before building any features.  
**Estimated effort:** 2–3 days

#### 1.1 Install Missing Dependencies

```bash
# Database & Auth
pnpm add prisma @prisma/client next-auth@beta bcryptjs
pnpm add -D @types/bcryptjs

# Cloudflare R2
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# Payment
pnpm add intasend-node

# State & Data Fetching
pnpm add @tanstack/react-query @tanstack/react-query-devtools

# Cart State
pnpm add zustand
```

#### 1.2 Environment Variables

Create `.env.local` and a committed `.env.example`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/digital_library"
NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME="digital-library-books"
R2_PUBLIC_URL=""
INTASEND_PUBLISHABLE_KEY=""
INTASEND_SECRET_KEY=""
INTASEND_WEBHOOK_SECRET=""
```

#### 1.3 Prisma Setup

```bash
npx prisma init
# Paste the full schema from prd.md into prisma/schema.prisma
npx prisma migrate dev --name init
npx prisma generate
```

Create `lib/prisma.ts` (singleton pattern from PRD Section 5.1).

#### 1.4 NextAuth Setup

Create `lib/auth.ts` with CredentialsProvider (from PRD Section 7.1).  
Create `app/api/auth/[...nextauth]/route.ts`.  
Create `middleware.ts` to protect `/my-library`, `/orders`, `/checkout`, and `/admin` routes (from PRD Section 7.2).

#### 1.5 Utility Clients

- Create `lib/r2.ts` — R2 S3 client + `getSignedDownloadUrl()` (PRD Section 5.2)
- Create `lib/intasend.ts` — IntaSend client singleton

**Phase 1 Exit Criteria:** `npx prisma studio` shows the database, login/register pages authenticate against a real user record, and protected routes redirect unauthenticated users.

---

### Phase 2 — Core API Routes
**Goal:** Build all server-side API endpoints the UI needs.  
**Estimated effort:** 3–4 days

#### 2.1 Authentication API

| File | Action |
|---|---|
| `app/api/auth/register/route.ts` | POST — hash password with bcrypt, create User |
| Connect login form | Wire `handleSubmit` to `signIn()` from NextAuth |

#### 2.2 Books API

| File | Action |
|---|---|
| `app/api/books/route.ts` | GET — list with search, genre filter, pagination. POST (admin) — create book record |
| `app/api/books/[id]/route.ts` | GET — single book. PATCH (admin) — update. DELETE (admin) — remove |

Add Zod schemas for all inputs. Return proper HTTP error codes.

#### 2.3 Orders API

| File | Action |
|---|---|
| `app/api/orders/route.ts` | POST — create Order (PENDING), call IntaSend, return checkout URL |
| `app/api/orders/[id]/route.ts` | GET — return order status for the authenticated user |

#### 2.4 Downloads API

| File | Action |
|---|---|
| `app/api/downloads/[bookId]/route.ts` | GET — verify ownership via Download record, return signed R2 URL (15-min expiry) |

#### 2.5 IntaSend Webhook

| File | Action |
|---|---|
| `app/api/webhooks/intasend/route.ts` | POST — verify signature, update Order to PAID, upsert Download records in a transaction |

#### 2.6 Admin API

| File | Action |
|---|---|
| `app/api/admin/users/route.ts` | GET — paginated user list (Admin only) |
| `app/api/admin/orders/route.ts` | GET — all orders with user info (Admin only) |
| `app/api/admin/books/upload/route.ts` | POST — receive file, upload to R2, save `fileKey` to Book |

**Phase 2 Exit Criteria:** All API routes return real data from PostgreSQL. Webhook correctly marks an order as PAID. Postman/Thunder Client tests pass for all routes.

---

### Phase 3 — Connect UI to Real Data
**Goal:** Replace all mock data and placeholder handlers in the frontend.  
**Estimated effort:** 4–5 days

#### 3.1 Auth Forms

- `app/login/page.tsx` — Replace mock `setTimeout` with `signIn('credentials', {...})`. Show error messages on failure.
- `app/register/page.tsx` — Wire form to `POST /api/auth/register` using React Hook Form + Zod schema. Redirect to login on success.

#### 3.2 Global Cart State (Zustand)

Create `lib/store/cart.ts`:

```ts
// Zustand store
interface CartStore {
  items: CartItem[]
  addItem: (book: Book) => void
  removeItem: (id: string) => void
  clearCart: () => void
  total: () => number
}
```

- Replace hardcoded `initialCartItems` in `app/cart/page.tsx` with Zustand store.
- Wire the `onAddToCart` callback in `BookCard` to `addItem`.
- Update cart icon in `components/header.tsx` to show live item count badge.

#### 3.3 Books Pages

- `app/books/page.tsx` — Replace mock `allBooks` array with `useQuery` call to `GET /api/books`. Add server-side search params. Add pagination.
- `app/books/[id]/page.tsx` — Fetch single book from `GET /api/books/[id]`. Wire "Add to Cart" to Zustand store. Show "Already Purchased" state if user owns the book.

#### 3.4 Checkout Flow

- `app/checkout/page.tsx` — Replace mock `handleCheckout` with real `POST /api/orders`. On success, redirect user to IntaSend-hosted checkout URL. Handle payment success/failure redirect.

#### 3.5 My Library Page

- `app/my-library/page.tsx` — Replace mock `purchasedBooks` array with `GET /api/downloads` (or derive from user's Orders). Wire Download button to `GET /api/downloads/[bookId]` → open signed URL in new tab.

#### 3.6 Orders History Page

- `app/orders/page.tsx` — Fetch user's orders from `GET /api/orders`. Show real statuses (PENDING, PAID, FAILED).

#### 3.7 TanStack Query Setup

Wrap `app/layout.tsx` with `QueryClientProvider`. Use `useQuery` for all data-fetching pages. Add loading skeletons and error states.

**Phase 3 Exit Criteria:** A user can register, browse books, add to cart, checkout via M-Pesa (sandbox), and see their purchased book in My Library with a working download link.

---

### Phase 4 — Admin Panel
**Goal:** Make the admin panel fully functional.  
**Estimated effort:** 3–4 days

#### 4.1 Admin Book Management (`app/admin/books/page.tsx`)

- Fetch real book list from `GET /api/books`.
- Add "New Book" dialog with a form: title, author, ISBN, genres, price, description, cover image URL.
- Add file upload input for the PDF/EPUB file — upload to `POST /api/admin/books/upload` which stores to R2.
- Add Edit and Delete actions per row.

#### 4.2 Admin Orders (`app/admin/orders/page.tsx`)

- Fetch all orders from `GET /api/admin/orders`.
- Show order status with color badges.
- Add filter by status (PENDING / PAID / FAILED / REFUNDED).

#### 4.3 Admin Users (`app/admin/users/page.tsx`)

- Fetch all users from `GET /api/admin/users`.
- Show user role badge (MEMBER / ADMIN).
- Add ability to promote/demote a user role.

#### 4.4 Admin Dashboard Stats (`app/admin/page.tsx`)

- Replace mock stats with real aggregation queries (total books, users, orders, revenue) via a `GET /api/admin/stats` route.
- Replace mock "Recent Orders" table with live data.

**Phase 4 Exit Criteria:** An admin can log in, upload a new book with a PDF file, see all real orders, and view all users.

---

### Phase 5 — Validation, Error Handling & Polish
**Goal:** Production-grade robustness.  
**Estimated effort:** 2–3 days

#### 5.1 Zod Validation

Write Zod schemas for every API input:

```ts
// Example: lib/validations/book.ts
export const createBookSchema = z.object({
  title: z.string().min(1).max(200),
  author: z.string().min(1),
  price: z.number().nonnegative(),
  genres: z.array(z.string()).min(1),
  description: z.string().min(10),
  isFree: z.boolean().default(false),
})
```

Validate in every API route. Return 400 with field-level error messages.

#### 5.2 Error Boundaries

- Create `app/error.tsx` — global error fallback
- Create `app/not-found.tsx` — 404 page
- Add per-route `loading.tsx` files for Suspense streaming

#### 5.3 Toast Notifications

Wire `sonner` (already installed) to all user actions:
- "Added to cart"
- "Order placed successfully"
- "Download starting..."
- "Error: please try again"

#### 5.4 Webhook Security

Implement IntaSend webhook signature verification before processing any payment callbacks. Log webhook events.

#### 5.5 Database Seeding

Create `prisma/seed.ts` to seed initial books and an admin user for development.

---

### Phase 6 — Deployment
**Goal:** Ship to production.  
**Estimated effort:** 1 day

Follow the PRD Deployment Checklist (Section 11):

- Deploy Next.js app to **Vercel** via GitHub integration
- Provision PostgreSQL on **Neon.tech** or Supabase
- Create **Cloudflare R2** bucket with CORS policy
- Configure all environment variables in Vercel project settings
- Register **IntaSend webhook URL** pointing to production endpoint
- Switch IntaSend to live keys
- Run a real KES 1 test transaction end-to-end
- Verify signed download URLs work from production domain

---

## Recommended Build Order

Follow the PRD's recommended workflow exactly:

1. **Phase 1** — Database schema + auth (no UI changes yet)
2. **Phase 2** — API routes (test with Postman/curl before touching UI)
3. **Phase 3.1–3.2** — Auth forms + cart state
4. **Phase 3.3–3.4** — Books browsing + checkout
5. **Phase 3.5–3.6** — My Library + Orders
6. **Phase 4** — Admin panel (CRUD + file upload)
7. **Phase 5** — Validation, error handling, toast polish
8. **Phase 6** — Deploy

> **Important:** Do not start Phase 3 until Phase 2 API routes are tested and verified. Connecting UI to untested APIs wastes time debugging at two layers simultaneously.

---

## Known Gaps vs PRD

| PRD Requirement | Gap | Priority |
|---|---|---|
| `src/` directory structure | Project uses `app/` at root; PRD shows `src/app/`. Minor — either works, but choose one and be consistent | Low |
| `intasend-node` not installed | Missing from `package.json` | **Critical** |
| `next-auth@beta` not installed | Missing from `package.json` | **Critical** |
| `prisma` not installed | Missing from `package.json` | **Critical** |
| `@aws-sdk/*` not installed | Missing from `package.json` | **Critical** |
| `zustand` not mentioned in PRD | PRD uses "Zustand or React context" — recommend Zustand for simplicity | Medium |
| `bcryptjs` not installed | Needed for password hashing | **Critical** |
| No `prisma/seed.ts` | Useful for dev workflow | Low |
| No `.env.example` | Should be committed to repo | Medium |
| Review system (Rating model exists) | UI for submitting reviews not scaffolded | Low (post-launch) |

---

## v2 Backlog (Post-Launch)

Per PRD Section 12 — defer these until the core product ships:

- In-browser PDF reader (`react-pdf`)
- Email notifications with Resend (order confirmation, download ready)
- Book wishlist / save for later
- Genre-based recommendations
- Discount codes and promotional pricing
- Author profile pages
- Bulk CSV import for admins
- Review and rating submission UI

---

*Plan prepared against `reqs/prd.md` — Digital Library Management System Full Stack Starter Guide.*