# Missing Pages — Kitabu Library Management System

## Audit Summary

The following analysis compares every `href`, `<Link>`, and `router.push()` call found across all components, pages, and navigation structures against the actual pages that exist in the `app/` directory.

### Existing Pages (`app/` directory)
| Route | File |
|---|---|
| `/` | `app/page.tsx` |
| `/books` | `app/books/page.tsx` |
| `/books/[id]` | `app/books/[id]/page.tsx` |
| `/cart` | `app/cart/page.tsx` |
| `/checkout` | `app/checkout/page.tsx` |
| `/login` | `app/login/page.tsx` |
| `/register` | `app/register/page.tsx` |
| `/my-library` | `app/my-library/page.tsx` |
| `/orders` | `app/orders/page.tsx` |
| `/admin` | `app/admin/page.tsx` |
| `/admin/books` | `app/admin/books/page.tsx` |
| `/admin/orders` | `app/admin/orders/page.tsx` |
| `/admin/users` | `app/admin/users/page.tsx` |

---

## Missing Pages (13 total)

### 1. `/categories`
**Linked from:** `components/header.tsx` (main nav), `components/footer.tsx` (Browse section)

**Purpose:** Allow users to browse all available book categories/genres (e.g. Fiction, Science, History, Technology). Should display a grid of category cards, each linking to a filtered books listing.

**Suggested content:**
- Grid of category cards with icon/image, name, and book count
- Each card navigates to `/books?category=<slug>`
- Could include a search/filter bar
- Breadcrumb: Home → Categories

---

### 2. `/new-releases`
**Linked from:** `components/header.tsx` (main nav), `components/footer.tsx` (Browse section)

**Purpose:** Curated listing of recently added or newly published books on the platform.

**Suggested content:**
- Same layout as `/books` page but pre-filtered by `createdAt` descending
- "New" badge on each book card
- Optional date range filter (e.g. last 7 days, last 30 days)
- Breadcrumb: Home → New Releases

---

### 3. `/free-books`
**Linked from:** `components/header.tsx` (main nav), `components/footer.tsx` (Browse section), `components/hero-section.tsx` (CTA button)

**Purpose:** Dedicated listing of all books with a price of `0` — a key acquisition/marketing page linked directly from the hero section.

**Suggested content:**
- Book grid filtered to `price = 0`
- Prominent "Download for Free" CTAs instead of "Add to Cart"
- Could highlight limited-time free promotions
- Breadcrumb: Home → Free Books

---

### 4. `/settings`
**Linked from:** `components/footer.tsx` (Account section), `components/dashboard/sidebar.tsx` (user sidebar nav)

**Purpose:** User account settings page for managing account preferences.

**Suggested content:**
- Change password section
- Email/notification preferences
- Account danger zone (delete account)
- Theme / display preferences
- Breadcrumb: Dashboard → Settings

---

### 5. `/profile`
**Linked from:** `components/dashboard/sidebar.tsx` (user sidebar nav)

**Purpose:** User profile page allowing users to view and edit their personal information.

**Suggested content:**
- Display name, email, profile photo upload
- Account creation date / member since
- Reading stats (books purchased, downloads)
- Form to update display name and avatar
- Breadcrumb: Dashboard → Profile

---

### 6. `/forgot-password`
**Linked from:** `app/login/page.tsx` ("Forgot password?" link)

**Purpose:** Allows users who have forgotten their password to request a reset email.

**Suggested content:**
- Single email input field
- Submit button that triggers password reset email (via NextAuth or custom API route)
- Success state: "Check your email for a reset link"
- Link back to `/login`
- Companion page `/reset-password?token=<token>` will also be needed to complete the flow

---

### 7. `/help`
**Linked from:** `components/footer.tsx` (Support section)

**Purpose:** Help Center / knowledge base for user self-service support.

**Suggested content:**
- Searchable FAQ-style articles
- Categories: Account, Billing, Downloads, Technical Issues
- Each article links to a detail page (e.g. `/help/<slug>`)
- Contact Us CTA at the bottom
- Breadcrumb: Home → Help Center

---

### 8. `/contact`
**Linked from:** `components/footer.tsx` (Support section)

**Purpose:** Contact form for users to reach out for support or inquiries.

**Suggested content:**
- Name, email, subject, message fields
- Dropdown for inquiry type (Support, Billing, Partnership, Other)
- Submit triggers email notification or creates a support ticket
- Success confirmation message
- Breadcrumb: Home → Contact Us

---

### 9. `/faqs`
**Linked from:** `components/footer.tsx` (Support section)

**Purpose:** Frequently Asked Questions — a quick-reference page for the most common user questions.

**Suggested content:**
- Accordion-style Q&A pairs (the `accordion` UI component already exists in the codebase)
- Sections: General, Payments, Downloads, Account
- Search/filter input
- Link to `/contact` for unanswered questions
- Breadcrumb: Home → FAQs

---

### 10. `/terms`
**Linked from:** `components/footer.tsx` (Legal section), `app/register/page.tsx` (Terms of Service checkbox)

**Purpose:** Terms of Service legal page. **High priority** — referenced in the registration form checkbox, so users cannot legally agree to terms that don't exist.

**Suggested content:**
- Full Terms of Service text
- Sections: Eligibility, Purchases, Intellectual Property, Prohibited Use, Termination, Governing Law
- Last updated date
- Breadcrumb: Home → Terms of Service

---

### 11. `/privacy`
**Linked from:** `components/footer.tsx` (Legal section), `app/register/page.tsx` (Privacy Policy link)

**Purpose:** Privacy Policy legal page. **High priority** — also referenced in the registration form, and legally required in most jurisdictions for any service collecting user data.

**Suggested content:**
- Data collected, how it's used, third-party sharing
- User rights (access, deletion, portability)
- Cookie policy
- Contact details for privacy inquiries
- Last updated date
- Breadcrumb: Home → Privacy Policy

---

### 12. `/refunds`
**Linked from:** `components/footer.tsx` (Legal section)

**Purpose:** Refund Policy page explaining the platform's digital goods return/refund process.

**Suggested content:**
- Eligibility criteria for refunds (e.g. unable to download, duplicate purchase)
- How to request a refund
- Timeframe for processing
- Non-refundable scenarios
- Link to `/contact` for refund requests
- Breadcrumb: Home → Refund Policy

---

### 13. `/admin/settings`
**Linked from:** `components/admin/sidebar.tsx` (admin sidebar nav)

**Purpose:** Admin-level platform configuration settings.

**Suggested content:**
- Platform name, logo, tagline
- Payment gateway configuration (IntaSend keys)
- Email/SMTP settings
- Storage configuration (R2 bucket)
- Feature flags (enable/disable free books, new registrations, etc.)
- Breadcrumb: Admin → Settings

---

## Priority Matrix

| Priority | Pages | Reason |
|---|---|---|
| 🔴 Critical | `/terms`, `/privacy`, `/forgot-password` | Legal compliance + broken auth flow |
| 🟠 High | `/categories`, `/free-books`, `/profile`, `/settings` | Core navigation & user dashboard items |
| 🟡 Medium | `/new-releases`, `/admin/settings`, `/refunds` | Feature completeness |
| 🟢 Low | `/help`, `/contact`, `/faqs` | Support / informational |

---

## Suggested File Locations

```
app/
├── categories/
│   └── page.tsx
├── new-releases/
│   └── page.tsx
├── free-books/
│   └── page.tsx
├── settings/
│   └── page.tsx
├── profile/
│   └── page.tsx
├── forgot-password/
│   └── page.tsx
├── help/
│   └── page.tsx
├── contact/
│   └── page.tsx
├── faqs/
│   └── page.tsx
├── terms/
│   └── page.tsx
├── privacy/
│   └── page.tsx
├── refunds/
│   └── page.tsx
└── admin/
    └── settings/
        └── page.tsx
```