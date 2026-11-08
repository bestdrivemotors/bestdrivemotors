# Vehicle Inventory and Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add public used-car inventory (carousel, listing, search, detail) and a Better Auth admin on the existing Vercel Next.js app, with Cloudflare D1 over HTTP, R2 WebP images, and ISR snapshots.

**Architecture:** Domain logic is pure JS (slug, filter, search, allowlist, image guards) unit-tested with Vitest. `lib/db/d1.js` is the only D1 HTTP client. Public pages read `getPublicInventory()` (tagged cache). Admin writes D1 + R2 then `revalidateTag('inventory')`. Better Auth uses a Kysely/SQLite adapter over the same HTTP client.

**Tech Stack:** Next.js 16 App Router, Vitest, Better Auth, Kysely, sharp, AWS SDK S3 client for R2, Nodemailer, Tailwind 4.

## Global Constraints

- Stay on Vercel; D1 via HTTP API only (no Workers `env.DB`).
- Images in R2 only; D1 stores URLs. Always re-encode to WebP with sharp.
- Public pages ISR `revalidate = 300` plus `revalidateTag('inventory')` on admin save.
- Public never shows `draft` or `sold`.
- No public sign-up; `INITIAL_ADMIN_EMAILS` plus `/admin/team` invites.
- No VIN, no vehicle enquiry form.
- Existing JS (no TypeScript conversion).
- User did not request git commits; do not commit unless asked.
- Tests: `npx vitest run`.

## File map

Create:

- `vitest.config.mjs`
- `lib/db/d1.js`, `lib/db/schema.sql`, `lib/db/migrate.js`
- `lib/vehicles/slug.js`, `filter.js`, `search.js`, `repository.js`
- `lib/auth/allowlist.js`, `lib/auth/index.js`
- `lib/images/browser-compress.js`, `lib/images/optimize.js`, `lib/images/guards.js`
- `lib/r2.js`
- `lib/inventory/snapshot.js`
- `lib/email/send.js`
- `lib/revalidate-inventory.js`
- `tests/**/*.test.js`
- `app/api/auth/[...all]/route.js`
- `app/api/admin/**`
- `app/admin/**`
- `app/vehicles/**`, `app/search/page.js`
- `app/components/FeaturedCarousel.js`, `VehicleCard.js`, `VehicleFilters.js`
- `proxy.js`
- `.env.example`

Modify: `package.json`, `next.config.mjs`, `app/page.js`, `app/components/Header.js`, `app/components/Hero.js`, `app/components/Footer.js`, `app/layout.js` (admin split).

---

### Task 1: Vitest + slug + public filter/search/allowlist

**Files:**

- Create: `vitest.config.mjs`
- Create: `lib/vehicles/slug.js`, `lib/vehicles/filter.js`, `lib/vehicles/search.js`
- Create: `lib/auth/allowlist.js`
- Create: `tests/vehicles/slug.test.js`, `tests/vehicles/filter.test.js`, `tests/vehicles/search.test.js`, `tests/auth/allowlist.test.js`
- Modify: `package.json` (test script, vitest)

**Interfaces:**

- Produces: `buildVehicleSlug({ year, makeName, modelName, stockNumber })` → string
- Produces: `ensureUniqueSlug(slug, existingSlugs, vehicleId)` → string; collisions append the first 8 characters of the vehicle ID, with a numeric fallback only if that candidate is also taken.
- Produces: `filterVehicles(vehicles, filters)`, `sortVehicles(vehicles, sort)`, `searchVehicles(vehicles, query)`
- Produces: `canSendAdminOtp(email, { initialEmails, existingUserEmails })` → boolean

- [ ] **Step 1:** Add vitest and failing tests for slug, filter, search, allowlist.
- [ ] **Step 2:** Run `npx vitest run` — expect FAIL (modules missing).
- [ ] **Step 3:** Implement the four modules.
- [ ] **Step 4:** Run `npx vitest run` — expect PASS.

---

### Task 2: Image size/MIME guards + optimize contract

**Files:**

- Create: `lib/images/guards.js`, `lib/images/optimize.js`
- Create: `tests/images/guards.test.js`

**Interfaces:**

- Produces: `assertUploadAllowed({ mime, byteLength, maxBytes = 8 * 1024 * 1024 })` throws or returns void
- Produces: `async optimizeToWebp(buffer)` → `{ gallery, thumb }` (sharp)

- [ ] **Step 1:** Failing tests: reject `application/pdf`, reject byteLength > 8MB, accept `image/jpeg` under limit.
- [ ] **Step 2:** Implement guards; `optimize.js` uses sharp to emit gallery 1920 and thumb 480 WebP.

---

### Task 3: D1 HTTP client + schema + repositories

**Files:**

- Create: `lib/db/d1.js`, `lib/db/schema.sql`, `lib/db/migrate.js`
- Create: `lib/vehicles/repository.js`
- Create: `lib/lookups/repository.js`
- Create: `tests/db/d1.test.js`

**Interfaces:**

- Produces: `d1Query(sql, params)`, `d1Batch(statements)`
- Produces: `isD1Configured()`
- Vehicle repo: `listAllVehicles()`, `getVehicleById(id)`, `insertVehicle(row)`, `updateVehicle(id, row)`, `replaceFeatures(vehicleId, featureIds)`, `listImages(vehicleId)`, `insertImage(row)`, `deleteImage(id)`
- Lookups: CRUD for make/model/fuel/body/feature

- [ ] **Step 1:** Test `d1Query` posts to the Cloudflare URL with Bearer token and `{ sql, params }` (mock fetch).
- [ ] **Step 2:** Implement client; schema.sql with all tables including `vehicle_image.thumb_url`.
- [ ] **Step 3:** `npm run db:migrate` script calling D1 HTTP execute of schema.sql when env is set.

---

### Task 4: Inventory snapshot + revalidate

**Files:**

- Create: `lib/inventory/snapshot.js`, `lib/revalidate-inventory.js`
- Create: `tests/inventory/snapshot.test.js`

**Interfaces:**

- Produces: `mapPublicVehicle(row)` strips draft/sold (caller filters)
- Produces: `getPublicInventory()` cached tag `inventory`
- Produces: `revalidateInventory(slug?)`

---

### Task 5: R2 put + Better Auth + email OTP + proxy

**Files:**

- Create: `lib/r2.js`, `lib/email/send.js`, `lib/auth/index.js`
- Create: `app/api/auth/[...all]/route.js`
- Create: `proxy.js`
- Modify: `next.config.mjs` remotePatterns from `R2_PUBLIC_BASE_URL`

Better Auth: emailAndPassword, signUp disabled, emailOTP via nodemailer, database Kysely sqlite over D1 HTTP dialect.

`canSendAdminOtp` used before sending OTP.

---

### Task 6: Admin API routes

**Files:**

- Create: `app/api/admin/vehicles/route.js` GET/POST
- Create: `app/api/admin/vehicles/[id]/route.js` GET/PATCH/DELETE
- Create: `app/api/admin/vehicles/[id]/images/route.js` POST
- Create: `app/api/admin/vehicles/[id]/images/[imageId]/route.js` DELETE
- Create: `app/api/admin/lookups/route.js`
- Create: `app/api/admin/team/route.js`
- Create: `app/api/admin/session.js` helper requiring session

All require session. Mutations call `revalidateInventory`. Image POST: guards + sharp + R2 + D1 row.

---

### Task 7: Admin UI

**Files:**

- Create: `app/admin/layout.js`, `login/page.js`, `page.js` (redirect), `vehicles/page.js`, `vehicles/new/page.js`, `vehicles/[id]/edit/page.js`, `lookups/page.js`, `team/page.js`
- Create: `app/admin/components/*` forms
- Create: `lib/images/browser-compress.js` — long edge 2400, target < 4MB

Login: email/password + OTP code form. Vehicles table with status. Lookups: add/rename lists. Team: invite email. Form drafts in localStorage key `vehicle_form_draft`.

---

### Task 8: Public pages + header/footer + ISR

**Files:**

- Create: `app/components/FeaturedCarousel.js`, `VehicleCard.js`, `VehicleFilters.js`
- Create: `app/vehicles/page.js`, `app/vehicles/[slug]/page.js`, `app/search/page.js`
- Modify: `app/page.js`, `Header.js`, `Hero.js`, `Footer.js`
- Modify: `next.config.mjs` `images.remotePatterns`

Pages: `export const revalidate = 300`. Home renders carousel from snapshot featured flag.

---

### Task 9: `.env.example` + verification

- Create `.env.example` with every server var from the spec.
- Run `npx vitest run` and `npm run lint`.
- If a local Next server is running, browse `/`, `/vehicles`, `/search`, `/admin/login`.

## Spec coverage

| Spec section | Task |
| --- | --- |
| Slug, filter, search, hide sold | 1, 4, 8 |
| Allowlist / no sign-up | 1, 5, 7 |
| D1 schema + thumb_url | 3 |
| WebP pipeline | 2, 5, 6 |
| ISR snapshot | 4, 8 |
| Admin CRUD / lookups / team | 6, 7 |
| Public routes / nav | 8 |

## Type consistency

- `status`: `draft` \| `available` \| `sold`
- `sort`: `newest` \| `price_asc` \| `price_desc` \| `km_asc` \| `km_desc`
- Cache tag: `inventory`
- OTP gate: `canSendAdminOtp`
