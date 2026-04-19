# 📄 Product Requirements Document (PRD)
## Invoizmo — Invoice Generator SaaS

---

**Version:** 1.1 (Revised)
**Brand:** Invoizmo
**Industry:** Invoice Generation / SaaS
**Audience:** Freelancers, small businesses, solopreneurs
**Stack:** React.js · Node.js · Express.js · MongoDB

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Tech Stack](#2-tech-stack)
3. [Repository Structure](#3-repository-structure)
4. [Environment Variables](#4-environment-variables)
5. [Public Pages](#5-public-pages)
6. [Authentication](#6-authentication)
7. [App Navigation & Layout](#7-app-navigation--layout)
8. [App Features & Pages](#8-app-features--pages)
9. [Invoice Generator — Core Module](#9-invoice-generator--core-module)
10. [Database Schema](#10-database-schema)
11. [API Endpoints](#11-api-endpoints)
12. [Pricing & Plans](#12-pricing--plans)
13. [Security Checklist](#13-security-checklist)
14. [UI / Brand Guidelines](#14-ui--brand-guidelines)
15. [Deployment](#15-deployment)
16. [Master Prompts](#16-master-prompts)

---

## 1. Product Overview

**Invoizmo** is a clean, fast, SaaS invoice generator that lets freelancers and small businesses create, manage, download, and send professional invoices without accounting complexity.

**Core value:** *From "Create" to PDF in under 60 seconds.*

### Goals

- Provide a free tier that converts users to paid
- Offer a dead-simple invoice creation flow
- Allow PDF download and email delivery of invoices
- Track payment statuses (draft → sent → paid → overdue)
- Support multiple business profiles per account (paid plan)

### Non-Goals (v1)

- No multi-currency conversion (display only)
- No accounting integrations (QuickBooks, Xero) in v1
- No mobile app in v1
- No Stripe payment integration in v1 (manual upgrade via contact)

---

## 2. Tech Stack

> **Rule:** Never hardcode version numbers. Always `npm show <pkg> version` + web search before installing.

| Layer | Choice | Notes |
|---|---|---|
| **Runtime** | Node.js Active LTS | Search `nodejs.org` for current Active LTS |
| **Backend Framework** | Express.js | Search `npm show express version` |
| **Language** | TypeScript (strict) | Both frontend and backend |
| **Database** | MongoDB Atlas | Cloud-hosted, IP allowlist required |
| **ODM** | Mongoose | Verify compatibility with Atlas driver |
| **Validation** | Zod | Env + request bodies + frontend forms |
| **Auth** | Email/Password only | JWT access + refresh token pattern |
| **JWT** | jsonwebtoken | Search latest + advisory |
| **Password hashing** | bcryptjs | Cost factor ≥ 10 |
| **Security headers** | helmet | Tune CSP for SPA/CDN |
| **CORS** | cors | Explicit origin allowlist |
| **Rate limiting** | express-rate-limit | Strict on auth, moderate on API |
| **NoSQL sanitize** | express-mongo-sanitize | Prevent injection |
| **Email** | nodemailer | Invoice delivery + auth emails |
| **PDF generation** | puppeteer or pdfkit | Server-side PDF rendering |
| **File storage** | Cloudinary | Logo uploads — store URL in MongoDB, never the file |
| **Logging** | winston | Structured, no PII |
| **Monitoring** | @sentry/node | Error tracking + scrubbing |
| **Scheduling** | node-cron | Overdue invoice detection |
| **Frontend** | React.js + Vite | SPA |
| **Routing** | react-router-dom | Protected routes |
| **Server state** | TanStack Query | Caching + retries |
| **HTTP client** | Axios | Interceptors for refresh |
| **Forms** | React Hook Form + Zod | Validated forms |
| **Notifications** | react-hot-toast | Success/error toast system |
| **PDF preview** | react-pdf or iframe | In-browser invoice preview |
| **Styling** | Tailwind CSS | Purple-toned design system |
| **Deploy: Frontend** | Vercel | Set all `VITE_*` env vars |
| **Deploy: Backend** | Render or Railway | Set all env vars in dashboard |
| **Deploy: DB** | MongoDB Atlas | IP allowlist required |

**Token lifetime:**
- Access JWT: `15 minutes` — sent in `Authorization: Bearer` header
- Refresh token: `7 days` — stored in `HttpOnly; Secure; SameSite=Strict` cookie

---

## 3. Repository Structure

```
invoizmo/
├── backend/
│   ├── src/
│   │   ├── server.ts
│   │   ├── app.ts
│   │   ├── config/
│   │   │   ├── env.ts                  # Zod-validated env — crash on bad config
│   │   │   ├── db.ts                   # mongoose.connect + disconnect
│   │   ├── middleware/
│   │   │   ├── requireAuth.ts          # JWT verify → attach req.user
│   │   │   ├── validate.ts             # Zod schema factory → 400 on failure
│   │   │   ├── planGuard.ts            # Enforce Free vs Pro limits
│   │   │   └── errorHandler.ts         # Central error → standard JSON
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── auth.schema.ts
│   │   │   ├── users/
│   │   │   │   ├── user.routes.ts
│   │   │   │   ├── user.controller.ts
│   │   │   │   ├── user.service.ts
│   │   │   │   ├── user.model.ts
│   │   │   │   └── user.schema.ts
│   │   │   ├── invoices/
│   │   │   │   ├── invoice.routes.ts
│   │   │   │   ├── invoice.controller.ts
│   │   │   │   ├── invoice.service.ts
│   │   │   │   ├── invoice.model.ts
│   │   │   │   └── invoice.schema.ts
│   │   │   ├── clients/
│   │   │   │   ├── client.routes.ts
│   │   │   │   ├── client.controller.ts
│   │   │   │   ├── client.service.ts
│   │   │   │   ├── client.model.ts
│   │   │   │   └── client.schema.ts
│   │   │   └── business/
│   │   │       ├── business.routes.ts
│   │   │       ├── business.controller.ts
│   │   │       ├── business.service.ts
│   │   │       ├── business.model.ts
│   │   │       └── business.schema.ts
│   │   ├── services/
│   │   │   ├── email.service.ts        # Nodemailer: invoice delivery + auth emails
│   │   │   ├── pdf.service.ts          # PDF generation (puppeteer or pdfkit)
│   │   │   ├── upload.service.ts       # Cloudinary upload wrapper
│   │   │   └── cron.service.ts         # Overdue invoice detection (node-cron)
│   │   └── utils/
│   │       ├── jwt.ts
│   │       ├── ownershipCheck.ts
│   │       └── tokenCompare.ts
│   ├── postman/
│   │   ├── collection.json
│   │   └── environment.json
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── lib/
│   │   │   ├── env.ts                  # VITE_* Zod validation
│   │   │   └── api/
│   │   │       ├── client.ts           # Axios + interceptors
│   │   │       └── refreshClient.ts
│   │   ├── auth/
│   │   │   ├── AuthProvider.tsx
│   │   │   └── tokenStore.ts
│   │   ├── components/
│   │   │   ├── RequireAuth.tsx
│   │   │   ├── PlanGuard.tsx           # Block feature if free user
│   │   │   ├── AppLayout.tsx           # Sidebar + topbar shell
│   │   │   ├── Sidebar.tsx             # Nav items
│   │   │   ├── Toast.tsx               # react-hot-toast wrapper
│   │   │   └── ErrorBoundary.tsx
│   │   ├── features/
│   │   │   ├── invoices/
│   │   │   │   ├── api.ts
│   │   │   │   ├── InvoiceList.tsx
│   │   │   │   ├── InvoiceBuilder.tsx  # Core invoice creation/edit UI
│   │   │   │   ├── InvoiceDetail.tsx   # Read-only view for sent/paid/overdue
│   │   │   │   ├── InvoicePreview.tsx  # PDF preview panel
│   │   │   │   ├── SendConfirmModal.tsx # Confirm before emailing client
│   │   │   │   └── types.ts
│   │   │   ├── clients/
│   │   │   ├── business/
│   │   │   └── dashboard/
│   │   └── pages/
│   │       ├── Home.tsx
│   │       ├── About.tsx
│   │       ├── Contact.tsx
│   │       ├── Pricing.tsx
│   │       ├── PrivacyPolicy.tsx
│   │       ├── Terms.tsx
│   │       ├── NotFound.tsx            # 404 page
│   │       ├── Login.tsx
│   │       ├── Signup.tsx
│   │       └── app/
│   │           ├── Dashboard.tsx
│   │           ├── Invoices.tsx
│   │           ├── CreateInvoice.tsx
│   │           ├── EditInvoice.tsx
│   │           ├── ViewInvoice.tsx
│   │           ├── Clients.tsx
│   │           ├── Upgrade.tsx
│   │           └── settings/
│   │               ├── Account.tsx
│   │               ├── Business.tsx
│   │               ├── Notifications.tsx
│   │               └── DangerZone.tsx
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
│
└── docs/
    └── PRD.md
```

---

## 4. Environment Variables

### Backend `.env.example`

```env
# ── Server ───────────────────────────────────────────────────────────────
NODE_ENV=development
PORT=5000

# ── Database ──────────────────────────────────────────────────────────────
MONGODB_URI=mongodb://localhost:27017/invoizmo_dev
# Production: mongodb+srv://<user>:<pass>@cluster.mongodb.net/invoizmo

# ── JWT ───────────────────────────────────────────────────────────────────
# Generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_ACCESS_SECRET=replace_with_64_char_hex
JWT_REFRESH_SECRET=replace_with_different_64_char_hex
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ── Frontend URL ──────────────────────────────────────────────────────────
CLIENT_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173

# ── Email (Nodemailer) ────────────────────────────────────────────────────
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=your_smtp_api_key
EMAIL_FROM=noreply@invoizmo.com

# ── File Storage (Cloudinary) ─────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ── Monitoring ────────────────────────────────────────────────────────────
SENTRY_DSN=https://your_sentry_dsn_here

# ── App Config ────────────────────────────────────────────────────────────
FREE_PLAN_INVOICE_LIMIT=5
FREE_PLAN_CLIENT_LIMIT=10
FREE_PLAN_BUSINESS_LIMIT=1
```

### Frontend `.env.example`

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_NAME=Invoizmo
VITE_FREE_INVOICE_LIMIT=5
```

---

## 5. Public Pages

All pages below are accessible without authentication.

### Route List

| Route | Page | Notes |
|---|---|---|
| `/` | Home | Main landing page |
| `/about` | About | Brand story |
| `/contact` | Contact | Contact form |
| `/pricing` | Pricing | Plan comparison |
| `/privacy` | Privacy Policy | Required for SaaS |
| `/terms` | Terms of Service | Required for paid SaaS |
| `/login` | Login | Auth page |
| `/signup` | Sign Up | Auth page |
| `/forgot-password` | Forgot Password | Auth flow |
| `/reset-password` | Reset Password | Auth flow |
| `*` | 404 Not Found | Catch-all branded error page |

### 5.1 Home Page (`/`)

**Purpose:** Convert visitors to sign-ups.

**Sections:**

| Section | Content |
|---|---|
| **Hero** | Headline: *"Create professional invoices in seconds"* · Primary CTA: "Start Free → `/signup`" · Secondary CTA: "See how it works" (smooth scroll to How it works section) · Subheadline: *"No credit card required"* |
| **How it works** | 3-step visual: 1. Sign Up Free → 2. Fill Invoice Details → 3. Download or Send PDF |
| **Features** | Cards: PDF Download, Email Delivery, Client Management, Invoice Tracking, Custom Logo, Recurring Invoices (Pro) |
| **Pricing teaser** | Free vs $6/mo comparison table · CTA to `/pricing` |
| **Testimonials** | 3 quotes (placeholder in v1) |
| **Footer** | Links: Home, About, Pricing, Contact, Privacy Policy, Terms of Service |

### 5.2 About Page (`/about`)

- Brand story, mission: *"Built for freelancers, by freelancers"*
- Small team section (placeholder avatars in v1)
- Values: Simplicity, Privacy, Speed

### 5.3 Contact Page (`/contact`)

- Contact form: Name, Email, Subject, Message
- On submit → `POST /api/v1/contact` (rate-limited: 3/hr per IP)
- **Success state:** Replace form with confirmation message — *"Thanks! We'll get back to you within 24 hours."*
- **Error state:** Show inline error banner — *"Something went wrong. Please try again or email us directly at hello@invoizmo.com."*
- No auth required

### 5.4 Pricing Page (`/pricing`)

See [Section 12 — Pricing & Plans](#12-pricing--plans) for full detail.

### 5.5 Privacy Policy Page (`/privacy`)

- Standard SaaS privacy policy content
- Sections: Data collected, how it's used, cookies, third-party services (Cloudinary, Sentry), contact for data deletion requests
- Last updated date displayed at top

### 5.6 Terms of Service Page (`/terms`)

- Sections: Acceptance, Account responsibilities, Permitted use, Payment terms, Termination, Limitation of liability, Governing law
- Last updated date displayed at top
- Required for a paid SaaS product alongside the privacy policy

### 5.7 404 Not Found Page (`*`)

- Branded Invoizmo 404 page — not the browser default
- Headline: *"Page not found"*
- Short message: *"The page you're looking for doesn't exist or has been moved."*
- CTA: "Go to Home" → `/`
- If user is logged in: show "Go to Dashboard" → `/app/dashboard` instead

---

## 6. Authentication

Email/password only. No OAuth in v1.

### 6.1 Sign Up (`/signup`)

**Fields:** Full Name, Email, Password (min 8 chars, 1 uppercase, 1 number), Confirm Password

**Flow:**
1. User submits form → `POST /api/v1/auth/register`
2. Server validates with Zod, checks email uniqueness → 409 `CONFLICT` if taken
3. Password hashed with bcryptjs (cost 10)
4. User document created with `plan: "free"`, `invoiceSequence: 0`, `invoiceCount: 0`
5. Verification email sent with a 24-hour token link
6. Refresh token set in `HttpOnly` cookie, access token returned in JSON
7. Redirect to `/app/dashboard`

**Validations:** Zod schema · email uniqueness · password strength

### 6.2 Email Verification

- After signup, user is sent a verification email with link: `invoizmo.com/verify-email?token=<raw_token>`
- Token generated with `crypto.randomBytes(32)`, hashed, stored with 24-hour TTL
- `POST /api/v1/auth/verify-email` with `{ token }` → sets `emailVerified: true`
- Unverified users can still use the app in v1 but see a banner: *"Please verify your email. [Resend email]"*
- Resend verification: `POST /api/v1/auth/resend-verification` (rate-limited: 3/hr per user)

### 6.3 Log In (`/login`)

**Fields:** Email, Password

**Flow:**
1. `POST /api/v1/auth/login`
2. Find user by email, verify password with bcryptjs
3. Account lockout after 5 failed attempts → 15-minute lock (TTL index on `lockUntil`)
4. Issue access + refresh tokens
5. Redirect to `/app/dashboard`

**Error handling:** Always respond with *"Invalid email or password"* — never reveal which field is wrong (prevents enumeration)

### 6.4 Forgot Password (`/forgot-password`)

1. User enters email → `POST /api/v1/auth/forgot-password`
2. Always respond: *"If this email exists, you'll receive a reset link"* (prevents enumeration)
3. Token generated with `crypto.randomBytes(32)`, hashed, stored with 1-hour TTL index
4. Email sent with reset link: `invoizmo.com/reset-password?token=<raw_token>`

### 6.5 Reset Password (`/reset-password`)

1. `POST /api/v1/auth/reset-password` with `{ token, password, confirmPassword }`
2. Find token, compare with `crypto.timingSafeEqual`, check TTL
3. Hash new password, update user, invalidate all refresh tokens for this user
4. Redirect to `/login` with success toast

### 6.6 Change Email (in Settings)

1. User enters new email + current password → `PATCH /api/v1/users/me/email`
2. Server verifies current password before allowing change
3. New verification email sent to the new address with 24-hour token
4. Email only updates in DB after the new address is verified
5. Old email receives a security notification: *"Your Invoizmo email address was changed."*

### 6.7 Logout

1. `POST /api/v1/auth/logout`
2. Clear refresh token from DB + clear `HttpOnly` cookie
3. Redirect to `/login`

---

## 7. App Navigation & Layout

All `/app/*` pages share a common shell: a fixed sidebar on the left and a top bar across the top.

### 7.1 Sidebar Navigation

| Item | Route | Icon | Notes |
|---|---|---|---|
| Dashboard | `/app/dashboard` | Grid icon | |
| Invoices | `/app/invoices` | Document icon | |
| Clients | `/app/clients` | People icon | |
| Settings | `/app/settings/account` | Gear icon | Links to first settings tab |

- Active item highlighted with purple background pill
- Invoizmo logo at the top of sidebar, links to `/app/dashboard`
- Bottom of sidebar: current plan badge (Free / Pro) + "Upgrade" link for free users → `/app/upgrade`

### 7.2 Top Bar

- Page title (matches current route)
- `[+ Create Invoice]` button — always visible, primary purple button
- User menu (avatar/initials dropdown): Profile link → `/app/settings/account`, Logout

### 7.3 Toast Notification System

All async actions provide user feedback via toasts (react-hot-toast).

| Action | Toast type | Message |
|---|---|---|
| Invoice saved as draft | Success (green) | *"Draft saved"* |
| Invoice sent via email | Success (green) | *"Invoice sent to client@email.com"* |
| Invoice marked as paid | Success (green) | *"Invoice marked as paid"* |
| PDF downloaded | Success (green) | *"PDF downloaded"* |
| Invoice duplicated | Success (green) | *"Invoice duplicated as draft"* |
| Client saved | Success (green) | *"Client saved"* |
| Any API error | Error (red) | Error message from API response |

- Auto-dismiss after 3 seconds
- Max 3 toasts visible at once (queue additional)

### 7.4 Mobile Responsive Behavior

- Sidebar collapses to a bottom navigation bar on screens < 768px
- Invoice builder split-panel: stacks vertically on mobile — form on top, preview hidden behind a "Preview" tab toggle button
- All tables become card-based lists on mobile

---

## 8. App Features & Pages

All pages under `/app/*` are protected by `<RequireAuth>`.

### 8.1 Dashboard (`/app/dashboard`)

**Purpose:** Bird's eye view of invoice activity.

**Empty state (new user, zero invoices):**
- No stats cards shown
- Onboarding checklist:
  1. Add your business profile → `/app/settings/business`
  2. Add your first client → `/app/clients`
  3. Create your first invoice → `/app/invoices/create`
- Each checklist item shows a checkmark once completed

**Active state (has invoices):**

| Stat Card | Data | Notes |
|---|---|---|
| Total Invoices | Count of all non-deleted invoices | |
| Total Earned | Sum of all `paid` invoice grandTotals | Shown in user's default currency only; footnote: "Shown in [currency]" |
| Pending Amount | Sum of `sent` + `overdue` grandTotals | Same currency note |
| Overdue Count | Count of overdue invoices | Red badge if > 0 |

**Sections:**
- Recent Invoices table (last 5): Invoice #, Client Name, Amount, Status badge, Due Date, Actions (View, Download)
- Free plan upgrade banner — shown when `invoiceCount >= 4` (one before the limit): *"You've used X of 5 free invoices — Upgrade to Pro for unlimited invoices."* · CTA: "Upgrade" → `/app/upgrade`

### 8.2 Invoice List (`/app/invoices`)

**UI:**
- Table with columns: Invoice #, Client, Issue Date, Due Date, Amount, Status badge, Actions
- Filters: Status (All / Draft / Sent / Paid / Overdue), Date range (Issue Date)
- Search: by client name or invoice number (debounced, 300ms)
- Pagination: 10 per page with page controls
- Status badges: Draft (gray) · Sent (purple) · Paid (green) · Overdue (red)

**Actions per row:**
- **View** → `/app/invoices/:id` (read-only detail page)
- **Edit** → `/app/invoices/:id/edit` (drafts only — button hidden for non-draft)
- **Duplicate** → clones invoice as new draft, opens `/app/invoices/:id/edit`
- **Download PDF** → triggers `GET /api/v1/invoices/:id/pdf`
- **Send via Email** → opens send confirmation modal
- **Mark as Paid** → confirmation prompt → `PATCH /api/v1/invoices/:id/mark-paid`
- **Delete** → soft delete confirmation prompt (drafts only)

**Empty state (no invoices or no filter results):**
- If no invoices exist: *"No invoices yet. Create your first one."* + Create button
- If filters return nothing: *"No invoices match your filters."* + Clear filters link

### 8.3 Create Invoice (`/app/invoices/create`)

**Free plan guard:** If `invoiceCount >= 5`, redirect to `/app/upgrade` with message: *"You've reached the free plan limit. Upgrade to create unlimited invoices."*

See [Section 9 — Invoice Generator](#9-invoice-generator--core-module) for the full builder spec.

### 8.4 Edit Invoice (`/app/invoices/:id/edit`)

- Same layout and form as Create Invoice, but pre-filled with existing invoice data
- Only accessible for invoices with `status: "draft"` — attempting to access a non-draft invoice redirects to the view page with a toast: *"Only draft invoices can be edited."*
- Auto-saves draft on blur (debounced 1s) — shows *"Saving..."* indicator in top bar
- All actions identical to create: Save Draft, Preview, Download PDF, Send via Email

### 8.5 View Invoice (`/app/invoices/:id`)

**Purpose:** Read-only detail view for sent, paid, and overdue invoices.

**Layout:**
- Left panel: rendered invoice preview (same visual as PDF)
- Right panel: invoice metadata and actions

**Metadata panel:**
- Invoice number and status badge
- Issue date and due date
- Timeline: Created → Sent (with sentAt timestamp) → Paid (with paidAt timestamp, if applicable)
- Overdue warning banner (red) if status is `overdue`

**Actions (right panel):**
- Download PDF
- Send Again (for sent/overdue — opens send confirmation modal)
- Mark as Paid (for sent/overdue)
- Duplicate (creates a new draft clone)
- Back to Invoices

### 8.6 Client Management (`/app/clients`)

**Purpose:** Save client details for reuse in invoices.

**Table columns:** Name, Company, Email, Invoices count, Last Invoice date, Actions

**Actions per row:** Edit, View past invoices (filtered invoice list), Delete (soft delete — only if client has no active invoices)

**Add / Edit client form fields:**
- Client Name (required)
- Company Name (optional)
- Email (required)
- Phone (optional)
- Address (optional)
- Tax / GST ID (optional)

**Plan limits:** Free plan: max 10 saved clients · Pro plan: unlimited

**Empty state:** *"No clients yet. Add your first client to start invoicing."* + Add Client button

### 8.7 Business Profile (`/app/settings/business`)

**Purpose:** Your sender details that appear on every invoice.

**Form fields:**
- Business / Freelancer Name (required)
- Logo upload (image — JPG/PNG, max 2MB — uploaded to Cloudinary; URL stored in MongoDB)
- Email
- Phone
- Address
- Tax / GST Number (optional)
- Invoice Number Prefix (optional, default: `INV` — e.g. set `ACME` to get `ACME-0001`)
- Default Currency (USD, EUR, INR, GBP, AUD, CAD — display only, no conversion)
- Default Payment Terms (Net 7 / Net 15 / Net 30 / Due on Receipt / Custom)
- Default Notes / Footer text (used as starting value in new invoices)

**Plan limits:** Free plan: 1 business profile · Pro plan: up to 3 business profiles

### 8.8 Settings (`/app/settings/*`)

Settings are organized into sub-routes under `/app/settings/`, rendered as tabs in a shared settings layout.

| Tab | Route | Description |
|---|---|---|
| Account | `/app/settings/account` | Name, email change, password change |
| Business | `/app/settings/business` | Business profile(s) management |
| Notifications | `/app/settings/notifications` | Email toggle preferences |
| Danger Zone | `/app/settings/danger` | Delete account |

**Account tab fields:**
- Full Name (editable inline)
- Email (shows current email + "Change email" flow — see Section 6.6)
- Change Password: Current Password, New Password, Confirm New Password
- Email verification status badge + "Resend verification" link if unverified

**Notifications tab toggles:**
- Invoice sent confirmation email to me (default: on)
- Overdue invoice reminder email to me (default: on)
- Weekly summary email (default: off)

**Danger Zone tab:**
- Delete Account section — requires typing `DELETE MY ACCOUNT` to confirm
- Warning text: *"This will permanently delete your account, all invoices, clients, and business profiles. This cannot be undone."*
- Action: `DELETE /api/v1/users/me` with `{ confirmText }` body

### 8.9 Upgrade Page (`/app/upgrade`)

**Purpose:** Convert free users to Pro. In v1, upgrade is handled manually.

**Layout:**
- Plan comparison table (same as Pricing page)
- CTA section: *"To upgrade to Pro, contact us and we'll activate your account within 24 hours."*
- Button: "Contact us to upgrade" → opens email client with pre-filled subject: *"Invoizmo Pro Upgrade Request"* + user's account email pre-populated in body
- Alternative: embedded simple form (Name, Email, Message) → `POST /api/v1/contact` with tag `upgrade_request`
- Current plan badge displayed at top: *"You're on the Free plan"*

---

## 9. Invoice Generator — Core Module

This is the central feature of Invoizmo. The flow is a single-page form with a live PDF preview panel.

### 9.1 UI Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  Top bar: [Saving... / Saved] ·········· [Preview] [Save Draft] [Send] [Download PDF]
├──────────────────────────────┬──────────────────────────────────────┤
│                              │                                      │
│   LEFT: Form Panel           │   RIGHT: Live PDF Preview            │
│   (scrollable)               │   (sticky, updates on keystroke)     │
│                              │                                      │
│   1. From (Business info)    │   Rendered invoice — same visual     │
│   2. To (Client info)        │   as the downloaded PDF              │
│   3. Invoice details         │                                      │
│   4. Line items table        │   Mobile: hidden behind              │
│   5. Totals + discount       │   "Preview" tab toggle               │
│   6. Notes / Terms           │                                      │
│   7. Template selector       │                                      │
│                              │                                      │
└──────────────────────────────┴──────────────────────────────────────┘
```

### 9.2 Form Sections

**Section 1 — From (Your Business)**
- Auto-populated from the user's default Business Profile
- Fields displayed (editable for this invoice only, not saved back to profile): Business Name, Logo, Address, Email, Phone, Tax Number
- If no business profile exists: prompt to create one with a link → `/app/settings/business`

**Section 2 — To (Client)**
- Dropdown: Select saved client (search/filter by name) OR "Add new client" inline (name + email minimum, saved to clients collection)
- Fields displayed after selection: Client/Company Name, Email, Address, Tax ID
- All fields editable for this invoice (snapshot, does not update the saved client)

**Section 3 — Invoice Details**
- Invoice Number: auto-generated as `[PREFIX]-[SEQUENCE]` (e.g. `INV-0042`). Sequence is a monotonic counter on the User model — never reused, even if invoices are deleted
- Issue Date: date picker, defaults to today
- Due Date: date picker, or shortcut selector: Net 7 / Net 15 / Net 30 / Due on Receipt / Custom
- Currency: dropdown (USD, EUR, INR, GBP, AUD, CAD) — defaults to business profile default

**Section 4 — Line Items**

| Column | Type | Notes |
|---|---|---|
| # | Auto-number | Non-editable |
| Description | Text input | Required |
| Qty | Number input | Min 1, decimal allowed |
| Unit Price | Number input | Min 0, stored in smallest unit (cents) |
| Tax % | Number input | Optional, 0–100, per-line |
| Total | Computed display | Qty × Unit Price (pre-tax) |

- `[+ Add Item]` button adds a new empty row below
- `[×]` remove icon on each row — minimum 1 row required
- Drag-to-reorder rows (optional, v1.1)

**Section 5 — Totals (auto-computed, display only)**

| Row | Calculation |
|---|---|
| Subtotal | Sum of all line totals (Qty × Unit Price) |
| Tax Total | Sum of all per-line tax amounts |
| Discount | Optional — toggle between Flat (amount) and Percent (%) with a number input |
| **Grand Total** | Subtotal + Tax Total − Discount |

- Discount row: shows a `[+ Add Discount]` link by default; clicking it reveals the discount input with flat/percent toggle and a remove button

**Section 6 — Notes & Terms**
- Notes: freetext textarea (e.g. *"Thank you for your business"*) — pre-filled from business profile default
- Payment Terms: freetext or dropdown (Net 7 / Net 15 / Net 30 / Due on Receipt) — pre-filled from business profile default

**Section 7 — Template Selector**
- Free Plan: 1 template available — Classic Purple (selected by default, selector hidden for free users)
- Pro Plan: 5 templates with thumbnail previews

| Template | Description |
|---|---|
| Classic Purple | Purple header bar, white body, purple accent on totals |
| Modern | Left sidebar with business info, white right panel for items |
| Minimal | All white, thin gray borders, elegant typography |
| Bold | Dark charcoal header, white text, colored accents |
| Compact | Condensed layout for many line items |

### 9.3 Invoice Number Logic

- `invoiceSequence` is a separate field on the User model from `invoiceCount`
- `invoiceCount` tracks total active invoices (for free plan enforcement)
- `invoiceSequence` is a monotonically incrementing integer — it only ever increases, never resets
- On invoice creation: `invoiceSequence += 1`, invoice number = `${prefix}-${String(invoiceSequence).padStart(4, '0')}`
- If a draft is deleted, `invoiceSequence` is NOT decremented — gaps in numbering are acceptable and expected

### 9.4 Create / Edit Invoice Flow

```
User clicks [+ Create Invoice]
      ↓
Free plan check: invoiceCount >= 5 → redirect to /app/upgrade
      ↓
/app/invoices/create loads with empty form
      ↓
User fills form → live preview updates on every change
      ↓
[Save Draft] → POST /api/v1/invoices (status: draft)
             → invoiceCount++ and invoiceSequence++
             → Success toast: "Draft saved"
             → URL updates to /app/invoices/:id/edit
      ↓
[Download PDF] → GET /api/v1/invoices/:id/pdf
              → Stream PDF file → browser download
              → Success toast: "PDF downloaded"
      ↓
[Send via Email] → Opens SendConfirmModal
              → Modal shows: recipient email, subject line, PDF attachment name
              → [Confirm Send] → POST /api/v1/invoices/:id/send
              → Status becomes "sent", sentAt set
              → Success toast: "Invoice sent to [email]"
```

### 9.5 Send Confirmation Modal

Before any invoice email is sent, a confirmation modal is shown:

- **Title:** "Send invoice to client?"
- **Content:**
  - To: `[client email]`
  - Subject: `Invoice [INV-0042] from [Business Name]`
  - Attachment: `Invoice-INV-0042.pdf`
  - Preview of email body (short)
- **Buttons:** "Cancel" (close modal) and "Send Invoice" (confirm)

### 9.6 Duplicate Invoice

- Available from: invoice list row actions, view invoice page
- Action: clones all fields (business snapshot, client snapshot, line items, notes, terms, template) into a new draft
- Invoice number is freshly auto-generated (new sequence number)
- Status is `draft`
- Issue date resets to today
- Due date recalculated from the same payment terms
- Redirects to `/app/invoices/:newId/edit`
- Success toast: *"Invoice duplicated as draft"*

### 9.7 Invoice States

```
draft ──────────────────────────────────────► sent ──────────────────► paid
  │                                             │                       (terminal)
  │ (user clicks Send, confirm modal)           │ (cron job, daily)
  │                                             ▼
  │                                          overdue
  │
  └── deleted (soft delete, drafts only)
```

State transition rules:
- `draft → sent`: user clicks Send via Email and confirms in modal
- `sent → paid`: user clicks Mark as Paid (manual)
- `sent → overdue`: automated by node-cron daily job (`dueDate < now && status === "sent"`)
- `overdue → paid`: user clicks Mark as Paid
- `paid`: terminal — no further transitions
- `draft`: editable and deletable
- `sent / paid / overdue`: read-only — no editing, no deletion

---

## 10. Database Schema

### User

```typescript
{
  _id: ObjectId,
  name: string,                    // required
  email: string,                   // unique, lowercase, indexed
  passwordHash: string,
  plan: "free" | "pro",            // default: "free"
  invoiceCount: number,            // active (non-deleted) invoices — for free plan limit
  invoiceSequence: number,         // monotonic counter for invoice numbering — never decrements
  refreshTokens: [{                // array for multi-device support
    tokenHash: string,
    createdAt: Date,
    expiresAt: Date
  }],
  loginAttempts: number,           // for account lockout
  lockUntil: Date,                 // TTL-indexed
  emailVerified: boolean,          // default: false
  emailVerificationToken: string,  // hashed, TTL-indexed (24hr)
  emailVerificationExpires: Date,
  passwordResetToken: string,      // hashed, TTL-indexed (1hr)
  passwordResetExpires: Date,
  notificationPreferences: {
    invoiceSentConfirmation: boolean,  // default: true
    overdueReminder: boolean,          // default: true
    weeklySummary: boolean             // default: false
  },
  createdAt: Date,
  updatedAt: Date,
  isDeleted: boolean,              // soft delete
  deletedAt: Date
}
```

### Business Profile

```typescript
{
  _id: ObjectId,
  userId: ObjectId,                // ref: User, indexed
  name: string,                    // required
  logoUrl: string,                 // Cloudinary URL — optional
  email: string,
  phone: string,
  address: string,
  taxNumber: string,               // optional
  invoicePrefix: string,           // default: "INV" — used in invoice number generation
  currency: string,                // default: "USD"
  defaultPaymentTerms: string,     // default: "Net 30"
  defaultNotes: string,
  isDefault: boolean,              // one default per user
  createdAt: Date,
  updatedAt: Date,
  isDeleted: boolean
}
```

### Client

```typescript
{
  _id: ObjectId,
  userId: ObjectId,                // ref: User, indexed
  name: string,                    // required
  companyName: string,             // optional
  email: string,                   // required
  phone: string,
  address: string,
  taxId: string,                   // optional
  createdAt: Date,
  updatedAt: Date,
  isDeleted: boolean
}
```

### Invoice

```typescript
{
  _id: ObjectId,
  userId: ObjectId,                // ref: User, indexed
  invoiceNumber: string,           // e.g. "INV-0042" — unique per user (compound index)
  businessSnapshot: {              // copy of business profile at creation time — not a reference
    name: string,
    logoUrl: string,
    email: string,
    phone: string,
    address: string,
    taxNumber: string,
    invoicePrefix: string
  },
  clientSnapshot: {                // copy of client data at creation time
    clientId: ObjectId,            // ref: Client — optional (could be ad-hoc)
    name: string,
    companyName: string,
    email: string,
    address: string,
    taxId: string
  },
  issueDate: Date,
  dueDate: Date,
  currency: string,                // e.g. "USD"
  lineItems: [{
    description: string,           // required
    quantity: number,              // min 1
    unitPrice: number,             // stored in smallest currency unit (cents)
    taxPercent: number,            // 0–100, default 0
    total: number                  // computed: quantity × unitPrice (pre-tax)
  }],
  subtotal: number,                // sum of all line totals (pre-tax)
  taxTotal: number,                // sum of all per-line tax amounts
  discount: {
    type: "flat" | "percent",
    value: number                  // flat: amount in cents | percent: 0–100
  },
  grandTotal: number,              // subtotal + taxTotal − discount
  notes: string,
  paymentTerms: string,
  template: string,                // template name e.g. "classic", "modern"
  status: "draft" | "sent" | "paid" | "overdue",
  pdfUrl: string,                  // Cloudinary or local path for cached PDF
  sentAt: Date,
  paidAt: Date,
  createdAt: Date,
  updatedAt: Date,
  isDeleted: boolean,
  deletedAt: Date
}
```

**Indexes:**
- `User.email`: unique
- `Invoice.userId + status`: compound (for dashboard and list queries)
- `Invoice.userId + invoiceNumber`: unique compound (prevent duplicate numbers per user)
- `Invoice.dueDate + status`: compound (for cron overdue job)
- `Client.userId`: index
- TTL indexes: `User.lockUntil`, `User.passwordResetExpires`, `User.emailVerificationExpires`

### Contact Message

```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  subject: string,
  message: string,
  tag: string,                     // optional — e.g. "upgrade_request"
  createdAt: Date
}
```

---

## 11. API Endpoints

### Standard Response Shape

```json
// Success
{ "success": true, "data": { ... } }

// Paginated
{ "success": true, "data": [...], "pagination": { "total": 100, "page": 1, "limit": 10, "totalPages": 10 } }

// Error
{ "success": false, "error": { "code": "ERROR_CODE", "message": "Human readable", "fields": { } } }
```

### Error Codes

| HTTP | Code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Zod validation failed |
| 400 | `INVALID_REQUEST` | Logically invalid (e.g. end before start) |
| 400 | `CONFIRM_TEXT_MISMATCH` | Destructive action confirmation wrong |
| 401 | `UNAUTHORIZED` | No token provided |
| 401 | `TOKEN_EXPIRED` | Access token expired — client should refresh |
| 401 | `REFRESH_TOKEN_INVALID` | Refresh token missing or rotated |
| 403 | `FORBIDDEN` | Authenticated but wrong role |
| 403 | `PLAN_LIMIT_REACHED` | Free plan limit hit — include `upgradeUrl` in error data |
| 403 | `INVOICE_NOT_EDITABLE` | Attempted edit on non-draft invoice |
| 404 | `NOT_FOUND` | Resource missing or belongs to another user |
| 409 | `CONFLICT` | Duplicate (email already exists) |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Unhandled — check Sentry |

---

### Auth Module

#### `POST /api/v1/auth/register`
- **Auth:** No · **Rate limit:** 10/min
- **Body:** `{ name, email, password, confirmPassword }`
- **Returns 201:** `{ accessToken, user: { _id, name, email, plan, emailVerified } }`
- **Sets:** `HttpOnly` refresh cookie
- **Side effect:** Sends verification email
- **Errors:** 400 validation, 409 email conflict

#### `POST /api/v1/auth/login`
- **Auth:** No · **Rate limit:** 10/min
- **Body:** `{ email, password }`
- **Returns 200:** `{ accessToken, user: { _id, name, email, plan, emailVerified } }`
- **Sets:** `HttpOnly` refresh cookie
- **Errors:** 401 invalid credentials, 429 rate limit / account locked

#### `POST /api/v1/auth/logout`
- **Auth:** Yes
- **Clears:** DB refresh token + cookie
- **Returns 200:** `{ message: "Logged out" }`

#### `POST /api/v1/auth/refresh`
- **Auth:** No (reads refresh cookie)
- **Returns 200:** `{ accessToken }`
- **Errors:** 401 invalid/expired refresh

#### `POST /api/v1/auth/forgot-password`
- **Auth:** No · **Rate limit:** 5/hr per IP
- **Body:** `{ email }`
- **Returns 200:** Always same message (no enumeration)

#### `POST /api/v1/auth/reset-password`
- **Auth:** No
- **Body:** `{ token, password, confirmPassword }`
- **Returns 200:** `{ message: "Password reset successful" }`

#### `POST /api/v1/auth/verify-email`
- **Auth:** No
- **Body:** `{ token }`
- **Returns 200:** `{ message: "Email verified" }`

#### `POST /api/v1/auth/resend-verification`
- **Auth:** Yes · **Rate limit:** 3/hr per user
- **Returns 200:** Always same message

---

### User Module

#### `GET /api/v1/users/me`
- **Auth:** Yes
- **Returns:** Full user profile (no passwordHash, no token fields)

#### `PATCH /api/v1/users/me`
- **Auth:** Yes
- **Body:** `{ name?, currentPassword?, newPassword? }`
- **Returns:** Updated user

#### `PATCH /api/v1/users/me/email`
- **Auth:** Yes
- **Body:** `{ newEmail, currentPassword }`
- **Side effect:** Sends verification email to new address; sends security alert to old address
- **Returns 200:** `{ message: "Verification email sent to new address" }`

#### `DELETE /api/v1/users/me`
- **Auth:** Yes
- **Body:** `{ confirmText: "DELETE MY ACCOUNT" }`
- **Action:** Soft delete user + all owned resources (invoices, clients, business profiles)
- **Returns 200:** `{ message: "Account deleted" }`

---

### Business Profile Module

#### `GET /api/v1/business`
- **Auth:** Yes
- **Returns:** Array of user's business profiles (non-deleted)

#### `POST /api/v1/business`
- **Auth:** Yes
- **Plan guard:** Free: max 1 · Pro: max 3 → 403 `PLAN_LIMIT_REACHED`
- **Body:** `{ name, email?, phone?, address?, taxNumber?, invoicePrefix?, currency?, defaultPaymentTerms?, defaultNotes? }`
- **Returns 201:** Created profile

#### `PATCH /api/v1/business/:id`
- **Auth:** Yes · **Ownership check:** Always
- **Body:** Partial business fields
- **Returns:** Updated profile

#### `DELETE /api/v1/business/:id`
- **Auth:** Yes · **Ownership check:** Always
- **Guard:** Cannot delete the only/default profile if user has active invoices referencing it
- **Action:** Soft delete

#### `POST /api/v1/business/:id/logo`
- **Auth:** Yes · **Ownership check:** Always
- **Body:** `multipart/form-data` with `logo` file field (max 2MB, image/jpeg or image/png)
- **Action:** Upload to Cloudinary, store URL in business profile
- **Returns:** `{ logoUrl: "https://res.cloudinary.com/..." }`

---

### Client Module

#### `GET /api/v1/clients`
- **Auth:** Yes
- **Query:** `?search=name&page=1&limit=10`
- **Returns:** Paginated client list

#### `POST /api/v1/clients`
- **Auth:** Yes
- **Plan guard:** Free: max 10 · Pro: unlimited → 403 `PLAN_LIMIT_REACHED`
- **Body:** `{ name, email, companyName?, phone?, address?, taxId? }`
- **Returns 201:** Created client

#### `GET /api/v1/clients/:id`
- **Auth:** Yes · **Ownership check:** Always
- **Returns:** Client + count of their invoices

#### `PATCH /api/v1/clients/:id`
- **Auth:** Yes · **Ownership check:** Always
- **Returns:** Updated client

#### `DELETE /api/v1/clients/:id`
- **Auth:** Yes · **Ownership check:** Always
- **Guard:** Block if client has `sent` or `paid` invoices — return 400 with message
- **Action:** Soft delete

---

### Invoice Module

#### `GET /api/v1/invoices`
- **Auth:** Yes
- **Query:** `?status=all|draft|sent|paid|overdue&page=1&limit=10&search=INV-0001&sortBy=createdAt&order=desc`
- **Returns:** Paginated invoice list (all queries scoped to `userId`)

#### `POST /api/v1/invoices`
- **Auth:** Yes
- **Plan guard:** Free: `invoiceCount >= 5` → 403 `PLAN_LIMIT_REACHED`
- **Body:** Full invoice payload (see schema)
- **Action:** Increment `invoiceSequence`, compute invoice number, compute totals server-side, save as `draft`, increment `invoiceCount`
- **Returns 201:** Created invoice

#### `GET /api/v1/invoices/:id`
- **Auth:** Yes · **Ownership check:** Always
- **Returns:** Full invoice document

#### `PATCH /api/v1/invoices/:id`
- **Auth:** Yes · **Ownership check:** Always
- **Guard:** `status !== "draft"` → 403 `INVOICE_NOT_EDITABLE`
- **Action:** Recompute totals server-side on update
- **Returns:** Updated invoice

#### `DELETE /api/v1/invoices/:id`
- **Auth:** Yes · **Ownership check:** Always
- **Guard:** `status !== "draft"` → 403 `INVOICE_NOT_EDITABLE`
- **Action:** Soft delete, decrement `invoiceCount`
- **Returns 200:** `{ message: "Invoice deleted" }`

#### `GET /api/v1/invoices/:id/pdf`
- **Auth:** Yes · **Ownership check:** Always
- **Action:** Generate PDF (or serve cached `pdfUrl`) → stream with `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="Invoice-INV-0042.pdf"`
- **Returns:** PDF file stream

#### `POST /api/v1/invoices/:id/send`
- **Auth:** Yes · **Ownership check:** Always
- **Guard:** `status === "paid"` → 400 (already paid)
- **Action:** Generate PDF if not cached → send email to `clientSnapshot.email` with PDF attachment → set `status: "sent"`, `sentAt: now`
- **Returns:** Updated invoice

#### `PATCH /api/v1/invoices/:id/mark-paid`
- **Auth:** Yes · **Ownership check:** Always
- **Guard:** `status === "draft"` → 400 (cannot mark draft as paid)
- **Action:** Set `status: "paid"`, `paidAt: now`
- **Returns:** Updated invoice

#### `POST /api/v1/invoices/:id/duplicate`
- **Auth:** Yes · **Ownership check:** Always
- **Plan guard:** Free: `invoiceCount >= 5` → 403 `PLAN_LIMIT_REACHED`
- **Action:** Clone all fields into new invoice with new sequence number, `status: "draft"`, `issueDate: today`, recalculated `dueDate`
- **Returns 201:** New draft invoice

---

### Dashboard Module

#### `GET /api/v1/dashboard/stats`
- **Auth:** Yes
- **Returns:**
```json
{
  "totalInvoices": 42,
  "totalEarned": 1520000,
  "pendingAmount": 45000,
  "overdueCount": 2,
  "defaultCurrency": "USD",
  "recentInvoices": [...]
}
```
- Note: `totalEarned` and `pendingAmount` are sums of invoices in the user's default business profile currency only. Invoices in other currencies are excluded from the sum and counted separately.

---

### Contact Module

#### `POST /api/v1/contact`
- **Auth:** No · **Rate limit:** 3/hr per IP
- **Body:** `{ name, email, subject, message, tag? }`
- **Action:** Save to DB + send notification email to admin
- **Returns 201:** `{ message: "Message sent" }`

---

### Health Module

#### `GET /health`
- **Auth:** No · **Rate limit:** Excluded
- **Returns 200:** `{ status: "ok", uptime: 12345 }`

#### `GET /ready`
- **Auth:** No · **Rate limit:** Excluded
- **Returns 200:** `{ status: "ready", db: "connected" }` or **503** if DB unreachable

---

## 12. Pricing & Plans

### Plan Comparison

| Feature | Free | Pro ($6/mo) |
|---|---|---|
| Invoices | Up to **5 total** | **Unlimited** |
| Clients | Up to **10** | **Unlimited** |
| Business profiles | **1** | **Up to 3** |
| PDF download | ✅ | ✅ |
| Email delivery | ✅ | ✅ |
| Invoice templates | **1** (Classic) | **5** templates |
| Custom logo | ✅ | ✅ |
| Custom invoice prefix | ✅ | ✅ |
| Invoice tracking | ✅ | ✅ |
| Duplicate invoice | ✅ | ✅ |
| Overdue auto-detection | ✅ | ✅ |
| Overdue email reminders (to you) | ❌ | ✅ |
| Recurring invoices | ❌ | ✅ (v1.1) |
| Remove Invoizmo branding from PDF | ❌ | ✅ |
| Priority support | ❌ | ✅ |

### Pricing Page UI Sections

- Monthly pricing only in v1 (annual billing in v2)
- Two plan cards side by side: Free and Pro — Pro card has purple border and "Most Popular" badge
- Feature checklist comparison table below the cards
- CTA buttons: "Get Started Free" (→ `/signup`) and "Upgrade to Pro" (→ `/app/upgrade` or `/contact`)
- FAQ section: 5–6 questions (What counts as an invoice? Can I cancel anytime? Is my data safe? What currencies are supported? How does the free plan limit work?)

### Plan Enforcement (Backend)

`planGuard.ts` middleware reads `req.user.plan` and checks relevant limits before the controller runs:

```typescript
// Invoice creation plan guard example
if (req.user.plan === "free") {
  if (req.user.invoiceCount >= FREE_PLAN_INVOICE_LIMIT) {
    throw {
      statusCode: 403,
      code: "PLAN_LIMIT_REACHED",
      message: "You've reached the free plan limit of 5 invoices.",
      data: { upgradeUrl: "/app/upgrade" }
    };
  }
}
```

**Note:** In v1, plan upgrades are processed manually. The user contacts Invoizmo and the `plan` field is updated directly in the database. Stripe integration is planned for v2.

---

## 13. Security Checklist

### Backend

- All secrets in `.env` — zero secrets hardcoded in source
- `.env` and all `.env.*` in `.gitignore` — only `.env.example` committed
- Zod env validation at startup — process exits immediately on bad config
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are different, each ≥ 64 chars
- MongoDB connection string uses a restricted DB user (not root)
- MongoDB Atlas IP allowlist configured — only server IPs
- `helmet()` enabled with tuned CSP
- CORS with explicit origin list — never `*` with credentials
- `express-mongo-sanitize()` in middleware chain
- `express-rate-limit` on all routes — strict on auth (10/min), standard on API (100/min), very strict on contact (3/hr/IP), resend-verification (3/hr/user)
- `express.json({ limit: '10kb' })` — prevent payload size attacks
- Zod validation on every route that accepts body/query/params
- `assertOwnership()` used in every controller — always 404 never 403 on wrong user
- All MongoDB queries filtered by `userId`
- Soft delete on all resources with `isDeleted` + `deletedAt`
- Refresh tokens hashed with bcryptjs before DB storage
- Refresh token rotation — new token issued on every `/auth/refresh`
- Reused refresh token triggers full revocation for that user
- `crypto.timingSafeEqual()` for all token comparisons
- Account lockout after 5 failed login attempts (15-min TTL index)
- Password reset tokens: `crypto.randomBytes(32)`, hashed, 1-hour TTL
- Email verification tokens: `crypto.randomBytes(32)`, hashed, 24-hour TTL
- Generic error messages on auth routes — no email enumeration
- Change email flow requires current password verification + sends alert to old address
- Invoice number auto-increment uses a separate monotonic `invoiceSequence` counter
- Cloudinary upload: file type and size validated server-side before upload
- Winston structured logging — no passwords, tokens, API keys, or raw PII in logs
- Sentry configured with `beforeSend` scrubbing for sensitive fields
- `npm audit` clean before every production deploy
- `GET /health` + `GET /ready` implemented and excluded from rate limits
- TTL indexes: `loginAttempts/lockUntil`, `passwordResetExpires`, `emailVerificationExpires`
- `DELETE /users/me` requires confirmation text

### Frontend

- Access token in memory only (`tokenStore.ts`) — never `localStorage` or `sessionStorage`
- Refresh token is `HttpOnly` cookie — JS cannot read it
- Single-flight refresh queue — no duplicate parallel refresh calls
- Separate `refreshClient` without interceptors — prevents refresh infinite loops
- On failed refresh → clear token store + redirect to `/login`
- All forms validated with React Hook Form + Zod before submission
- Error boundary at root level
- `<RequireAuth>` wraps all `/app/*` routes
- `<PlanGuard>` blocks Pro-only features with upgrade prompt for free users
- No `console.log` of tokens or sensitive data in production build
- `npm audit` clean
- `VITE_*` env vars validated with Zod at build time
- 404 page catches all unknown routes
- Toast system provides feedback for every async mutation

---

## 14. UI / Brand Guidelines

### Brand Identity

| Property | Value |
|---|---|
| **Brand Name** | Invoizmo |
| **Tagline** | *"Invoice smarter. Get paid faster."* |
| **Tone** | Professional, clean, friendly, modern |
| **Primary Color** | Purple (`#7C3AED` / Tailwind `violet-600`) |
| **Primary Light** | Light purple (`#EDE9FE` / `violet-100`) |
| **Success** | Green (`#10B981` / `emerald-500`) |
| **Warning** | Amber (`#F59E0B` / `amber-500`) |
| **Danger** | Red (`#EF4444` / `red-500`) |
| **Text Primary** | Gray-900 (`#111827`) |
| **Text Secondary** | Gray-500 (`#6B7280`) |
| **Background** | White / Gray-50 (`#F9FAFB`) |
| **Border** | Gray-200 (`#E5E7EB`) |

### Typography

- **Headings:** Inter or Poppins, weight 600–700
- **Body:** Inter, weight 400, line-height 1.6
- **Code / invoice numbers:** JetBrains Mono or `font-mono`

### Invoice Status Badges

| Status | Background | Text |
|---|---|---|
| Draft | `gray-100` | `gray-600` |
| Sent | `violet-100` | `violet-700` |
| Paid | `emerald-100` | `emerald-700` |
| Overdue | `red-100` | `red-700` |

### Component Patterns

- **Primary button:** `bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2`
- **Secondary button:** `border border-violet-600 text-violet-600 hover:bg-violet-50 rounded-lg px-4 py-2`
- **Danger button:** `bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2`
- **Cards:** `bg-white border border-gray-200 rounded-xl shadow-sm p-6`
- **Sidebar:** `bg-violet-700` background, white icons and text, active item `bg-violet-800` pill
- **Input fields:** `border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500`
- **Toast success:** Green background, white text, checkmark icon
- **Toast error:** Red background, white text, X icon

### Invoice PDF Templates

**Classic Purple (Free):**
- Purple (`violet-700`) header bar with business name and logo
- Clean white body with gray line item rows
- Purple accent on grand total row
- Footer: payment terms + *"Generated by Invoizmo"* (removable on Pro)

**Modern (Pro):**
- Left sidebar in `violet-800` with business info in white text
- Clean white right panel for client info, line items, and totals

**Minimal (Pro):**
- All white, thin `gray-200` borders, elegant serif typography for header

**Bold (Pro):**
- Dark charcoal (`gray-900`) full-width header, white text, violet accent on totals

**Compact (Pro):**
- Condensed line height and font size for service businesses with many line items

---

## 15. Deployment

### Backend (Render / Railway)

- Set all env vars from `.env.example` in the hosting dashboard
- MongoDB Atlas: whitelist the server's outbound IP
- Build command: `npm ci && npm run build` (TypeScript compile)
- Start command: `node dist/server.js`
- Health check URL configured: `GET /health`
- Auto-deploy on push to `main` branch

### Frontend (Vercel)

- Set all `VITE_*` env vars in Vercel project settings
- Build command: `npm run build`
- Output directory: `dist`
- All routes rewrite to `index.html` for SPA routing (add `vercel.json` rewrites config)
- Auto-deploy on push to `main` branch

### Database (MongoDB Atlas)

- Create dedicated DB user with `readWrite` on `invoizmo` database only (not root)
- IP allowlist: backend server IP only — never `0.0.0.0/0`
- Enable Atlas automated backups (daily)
- Create all indexes listed in [Section 10](#10-database-schema) before launch
- Enable Atlas Performance Advisor to catch missing indexes post-launch

### File Storage (Cloudinary)

- Create a dedicated Cloudinary folder: `invoizmo/logos`
- Set upload preset to restrict to image types only (JPG, PNG)
- Store returned `secure_url` in MongoDB — never store the binary file in the database

### CI Pipeline (GitHub Actions)

```yaml
name: CI
on: [push, pull_request]
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 'lts/*' }
      - run: cd backend && npm ci
      - run: cd backend && npx tsc --noEmit
      - run: cd backend && npm audit --audit-level=high
      - run: cd frontend && npm ci
      - run: cd frontend && npx tsc --noEmit
      - run: cd frontend && npm audit --audit-level=high
```

---

## 16. Master Prompts

Use these when prompting your AI assistant to build Invoizmo.

### Bootstrap Prompt

```
Build the Invoizmo SaaS — a professional invoice generator web app.

Industry: Invoice Generator SaaS
Brand: Invoizmo
Color theme: Purple (violet-600 primary, Tailwind CSS)

── Backend ──────────────────────────────────────────────────────────────
Framework: Node.js + Express.js + TypeScript + MongoDB (Mongoose)
Auth: Email/Password only (no OAuth). Include email verification on signup
  with 24-hour TTL token. Change-email flow requires current password + sends
  alert to old address.
JWT: Access token 15min (JSON response), refresh token 7d (HttpOnly; Secure;
  SameSite=Strict cookie) with rotation and hashed refresh tokens in DB.
  Breach detection: reused refresh token revokes all tokens for that user.
Security: helmet, cors (explicit origins), express-mongo-sanitize,
  express-rate-limit (10/min auth, 100/min API, 3/hr contact, 3/hr resend-verify),
  express.json({limit:'10kb'}), Zod on all routes, assertOwnership() in all
  controllers (always 404 not 403), crypto.timingSafeEqual(), bcryptjs (cost 10),
  account lockout 5 attempts → 15min TTL, soft delete on all resources.
Modules: auth, users, business (profiles), clients, invoices, dashboard, contact
Key invoice logic:
  - invoiceSequence (monotonic, never decrements) for invoice number generation
  - invoiceCount (decrements on delete) for free plan enforcement — these are SEPARATE fields
  - Invoice number format: [prefix]-[sequence padded to 4 digits] e.g. INV-0042
  - Prefix from business profile (default: "INV"), customizable per profile
  - Duplicate invoice endpoint clones to new draft with new sequence number
  - assertOwnership() on every invoice/client/business endpoint
  - Plan guard: Free = 5 invoices, 10 clients, 1 business profile; Pro = unlimited
  - 403 PLAN_LIMIT_REACHED includes upgradeUrl in error data
  - 403 INVOICE_NOT_EDITABLE for edit/delete on non-draft invoices
PDF: puppeteer or pdfkit server-side; cache pdfUrl in invoice document;
  stream with Content-Disposition: attachment on download
File storage: Cloudinary for logo uploads — validate type and size server-side,
  store secure_url in MongoDB, never store binary in DB
Email: nodemailer for invoice delivery (with PDF attachment), verification,
  password reset, change-email security alert, overdue reminders (Pro)
Cron: node-cron daily job — find invoices where dueDate < now and status = "sent"
  → set status = "overdue"
Logging: Winston structured (no PII, no tokens). Sentry with beforeSend scrubbing.
Health: GET /health (liveness, no auth, no rate limit), GET /ready (DB check)
Response shape: always { success, data } or { success: false, error: {code, message, fields?, data?} }
Env: Zod-validated at startup, crash on bad config

── Frontend ──────────────────────────────────────────────────────────────
Framework: React.js + Vite + TypeScript + Tailwind CSS
State: TanStack Query for server state, React Hook Form + Zod for forms
HTTP: Axios with single-flight 401 refresh interceptor, separate refreshClient
  (no interceptors) to prevent infinite loops. Access token in memory only
  (tokenStore.ts — never localStorage).
Auth: AuthProvider bootstraps on load via POST /auth/refresh then GET /users/me.
  RequireAuth wraps all /app/* routes. PlanGuard blocks Pro features with upgrade
  prompt linking to /app/upgrade.
Toast: react-hot-toast for all mutation feedback (success green 3s, error red 3s)
Layout: AppLayout with fixed sidebar (Dashboard, Invoices, Clients, Settings nav)
  and top bar (page title, + Create Invoice button, user menu).
  Mobile: sidebar collapses to bottom nav below 768px.
Invoice builder: split panel — left scrollable form, right sticky live preview.
  Mobile: preview hidden behind "Preview" tab toggle.
  Auto-save draft on blur (debounced 1s) with "Saving..." indicator.
  Send confirmation modal before any email is sent (shows recipient, subject, filename).
  Duplicate action available from list and detail view.
Read-only view: /app/invoices/:id for sent/paid/overdue invoices — left panel is
  rendered invoice preview, right panel is metadata + actions.
Edit page: /app/invoices/:id/edit — same as create but pre-filled, only for drafts.
Empty states: dashboard shows onboarding checklist, invoice list shows CTAs.
Upgrade page: /app/upgrade — plan comparison + contact-to-upgrade CTA (v1 manual).
404 page: branded, links to home or dashboard based on auth state.
Settings: tab layout at /app/settings/* with sub-routes: account, business,
  notifications, danger (not hash-based tabs — real sub-routes).

── Pages ─────────────────────────────────────────────────────────────────
Public: / /about /contact /pricing /privacy /terms /login /signup
        /forgot-password /reset-password /verify-email * (404)
App (protected): /app/dashboard /app/invoices /app/invoices/create
        /app/invoices/:id (read-only) /app/invoices/:id/edit
        /app/clients /app/upgrade
        /app/settings/account /app/settings/business
        /app/settings/notifications /app/settings/danger

── Deliverables ───────────────────────────────────────────────────────────
1. .env.example (backend + frontend) with all variables commented
2. .gitignore at repo root
3. .cursorignore at repo root (mirror .env*, node_modules, dist, keys)
4. README with setup, install, seed, run instructions + CI notes
5. Postman collection + environment JSON under backend/postman/
6. TypeScript strict tsconfig.json for backend and frontend
7. Full API docs per endpoint following the standard response shape
8. node-cron daily overdue job

Before writing any package.json: web search each dependency for latest stable
  version + advisory/CVE, confirm with npm show <pkg> version, state what you
  verified. Never copy version numbers from this document.
```

---

*Invoizmo PRD v1.1 — Built on the MERN + TypeScript Blueprint. Industry: Invoice Generator SaaS.*