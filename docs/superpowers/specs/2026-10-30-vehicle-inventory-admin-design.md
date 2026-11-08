# Vehicle inventory and admin — Best Drive Motors

Date: 2026-10-30  
Status: approved (brainstorming)  
Host: Vercel (unchanged)  
Public site: [https://bestdrivemotors.co.nz](https://bestdrivemotors.co.nz)

## 1. Purpose

Give shoppers a real used-car inventory (home carousel, listing, search, detail) and give staff a signed-in admin to manage vehicles, lookup lists, photos, and extra team members. Shoppers must not hit Cloudflare D1 on every visit. Photos must be optimized to WebP in Cloudflare R2.

## 2. Success criteria

- Home shows a featured-car carousel only when at least one **available + featured** vehicle exists.
- `/vehicles` lists only `status = available` cars, with filters and sort.
- `/search` finds available cars by year, make, model, variant, or stock number.
- `/vehicles/[slug]` shows gallery and specs. Sold and draft slugs 404.
- No public enquiry form on the detail page; link to existing `/finance`.
- Admin is login-only. No public sign-up.
- First staff come from `INITIAL_ADMIN_EMAILS`; more staff via `/admin/team` (email + OTP, then set password).
- Phone photos (tens of MB) are resized in the browser, re-encoded to WebP on the server, then stored in R2. D1 stores URLs only.
- Public pages use ISR (~5 minutes) plus on-demand revalidation after admin saves.

## 3. Out of scope

- Enquiry / contact forms on a vehicle
- Moving the Next.js app to Cloudflare Workers
- Public self-service sign-up
- Storing VIN
- Live D1 queries on every shopper listing/search request
- Changing the finance application flow (except navigation links)

## 4. Stack

| Concern | Choice |
| --- | --- |
| App | Next.js 16 App Router, existing `bd-motors-web-app` |
| Host | Vercel |
| Database | Cloudflare D1 (SQLite) via D1 HTTP Query API |
| Images | Cloudflare R2 (S3-compatible API) + public CDN base URL |
| Auth | Better Auth, email + password, email OTP for invite/reset, D1 via HTTP (not Workers `env.DB`) |
| Email | Nodemailer (same pattern as finance) |
| Image encode | Browser downscale, then `sharp` to WebP (gallery + thumbnail) |
| Public data | Cached snapshot of available vehicles; in-app filter/search/sort |
| Client persistence | `localStorage` for admin form drafts and listing filter UI only |

D1 free-plan constraints that shape the design: 500 MB per database, 5 million row-reads/day, 100,000 row-writes/day. Unindexed live listing queries are not used on the public site.

## 5. Public routes

| Path | Behaviour |
| --- | --- |
| `/` | Existing hero, features, finance. Featured carousel. Hero “View Stock” → `/vehicles`. |
| `/vehicles` | Grid of available vehicles. Filters: make, model, fuel, body, price range, year range, kms range, features. Sort: newest, price low/high, km low/high. Filter UI remembered in `localStorage`. |
| `/search` | Search box; matches year, make, model, variant, stock number (case-insensitive). Same card UI as listing. |
| `/vehicles/[slug]` | Gallery, price, specs, description. Link to `/finance`. 404 if missing, draft, or sold. |

Header (public): Vehicles, Search, existing Finance. Admin is not in the public header.

Footer Explore: add Vehicles and Search next to Home and Finance.

Carousel: image, year, make, model, price (NZD), odometer (km), link to detail. Hidden when there are no featured available cars.

## 6. Admin routes

| Path | Behaviour |
| --- | --- |
| `/admin/login` | Email + password. “Email me a code” for invite/set-password/reset. Public. |
| `/admin` | Redirect to `/admin/vehicles`. |
| `/admin/vehicles` | Table of all vehicles (draft, available, sold). |
| `/admin/vehicles/new` | Create form. |
| `/admin/vehicles/[id]/edit` | Edit, status, featured, gallery. |
| `/admin/lookups` | Make, model (per make), fuel, body style, reusable features. |
| `/admin/team` | Invite additional staff by email. |

Next.js 16 `proxy.js` (Node runtime) requires a session for `/admin/*` except `/admin/login` and Better Auth API routes.

Admin chrome: simple signed-in layout (vehicles, lookups, team, sign out). Do not wrap admin in the marketing header/footer if that fights the layout; prefer an admin layout that still uses site fonts and primary colour.

## 7. Auth

- Better Auth mounted at `/api/auth/[...all]`.
- Email + password enabled. `autoSignIn` after password set.
- Email OTP plugin for invite and password setup (Nodemailer).
- No public `/sign-up` page and `signUp` disabled in Better Auth config.
- `INITIAL_ADMIN_EMAILS`: comma-separated allowlist. OTP/invite send is allowed if the email is on this list **or** the email already exists as a user (invited staff).
- Logged-in admins on `/admin/team` create a user row and send OTP. Number of admins may grow.
- Sessions: httpOnly cookies. `trustedOrigins` includes production and `*.vercel.app`.

## 8. Data model (D1)

IDs are text primary keys (`crypto.randomUUID()`). Timestamps are ISO-8601 text.

### Lookups

- `make(id, name, created_at)` — unique name
- `model(id, make_id, name, created_at)` — unique `(make_id, name)`
- `fuel_type(id, name, created_at)` — unique name
- `body_style(id, name, created_at)` — unique name
- `feature(id, name, created_at)` — unique name

### Vehicle

`vehicle`:

- `id`, `status` (`draft` \| `available` \| `sold`), `featured` (0/1)
- `stock_number` unique, `slug` unique
- `year` integer
- `make_id`, `model_id`, `fuel_id`, `body_id` (FKs)
- `variant` text nullable
- `price_nzd` integer (whole dollars)
- `odometer_km` integer
- `transmission` (`automatic` \| `manual` \| `cvt`)
- `drivetrain` (`fwd` \| `rwd` \| `awd` \| `4wd`)
- `colour` text
- `seats` integer, `doors` integer
- `origin` (`nz_new` \| `import`)
- `wof_expiry` date text nullable, `rego_expiry` date text nullable
- `description` text nullable
- `created_at`, `updated_at`

`vehicle_feature(vehicle_id, feature_id)` composite PK.

`vehicle_image(id, vehicle_id, r2_key, public_url, sort_order, is_cover, created_at)`.

VIN is not stored.

Slug format: `{year}-{make}-{model}-{stock_number}` lowercased, non-alphanumerics to `-`, collapsed dashes. Must stay unique; if collision, append a short id suffix.

Public queries never return `draft` or `sold`. Admin can still list and edit them.

## 9. Cached snapshot

Module `getPublicInventory()`:

- Loads all `available` vehicles with make/model/fuel/body names, feature names, cover + gallery URLs.
- Cached with `unstable_cache` / `revalidateTag('inventory')` and `revalidate = 300` on pages.
- Admin mutations call `revalidateTag('inventory')` and `revalidatePath` for `/`, `/vehicles`, `/search`, and the vehicle slug path.

Listing, search, carousel, and detail **read this snapshot** (detail 404 if slug not in snapshot). Admin reads live D1.

## 10. Filter and search rules

Pure functions on the snapshot (unit-tested):

- `filterVehicles(vehicles, filters)` — AND across provided filters. Model filter only applies when a make is selected (or model id is present). Features: vehicle must include all selected feature ids.
- `sortVehicles(vehicles, sort)` — `newest` (created_at desc), `price_asc`, `price_desc`, `km_asc`, `km_desc`.
- `searchVehicles(vehicles, query)` — trim, case-insensitive; match if query is a substring of year, make name, model name, variant, or stock number. Empty query returns `[]` on the search page (prompt to type), not the full lot.

## 11. Image pipeline

Staff may pick 30–50 MB phone photos. Vercel request limits cannot accept that raw.

1. **Browser:** canvas resize, long edge max 2400 px, JPEG/WebP blob target under ~4 MB. Reject non-image types client-side.
2. **Server (`sharp`):** always re-encode:
   - Gallery WebP: long edge 1920 px, quality 80, strip metadata
   - Thumbnail WebP: long edge 480 px, quality 75
3. **R2:** put `vehicles/{vehicleId}/{imageId}.webp` and `vehicles/{vehicleId}/{imageId}-thumb.webp`.
4. D1 row stores gallery `public_url` and may store thumb URL in the same row as `public_url` plus a `thumb_url` column (add `thumb_url` so listing cards do not load 1920px files).
5. If R2 put fails, do not insert `vehicle_image`. If vehicle create fails after images, best-effort delete uploaded keys.
6. Reject if after client compress the upload is still over 8 MB, or MIME is not image/jpeg, image/png, image/webp, image/heic, image/heif (HEIC converted by sharp when possible; if sharp cannot decode, return a clear error).

`thumb_url` is in scope (needed for carousel/cards). Spec amendment vs brainstorming: add `vehicle_image.thumb_url`.

## 12. Environment variables

Server-only (never `NEXT_PUBLIC_` except the public R2 base URL):

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_D1_DATABASE_ID`
- `CLOUDFLARE_D1_API_TOKEN`
- `R2_ACCOUNT_ID` (or reuse account id)
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_BASE_URL` — CDN origin for objects (also used in `next.config` `images.remotePatterns`)
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL` — canonical site URL
- `INITIAL_ADMIN_EMAILS`
- Existing SMTP vars used by finance, reused for OTP

`.env.example` documents these. Missing D1/R2 config: admin APIs return 503 with a clear message; public pages show empty stock rather than crash.

## 13. Error handling

- D1 HTTP errors: throw typed `D1Error`; admin UI shows the message.
- Auth/mail failures: login page error, no user enumeration beyond “If that email can be used, we sent a code.”
- Public 404 for unknown/sold/draft slugs.
- If D1 is down, ISR continues serving the last good snapshot until revalidation fails; new deploys with empty cache show an empty listing, not a 500.

## 14. Testing

Vitest for domain and HTTP-client mapping (no live Cloudflare in CI):

- Slug generation and uniqueness suffix
- Public snapshot excludes draft/sold
- Featured carousel: available+featured only; empty → no items
- Filters AND-combine; search matching; empty search query
- Invite/OTP allowlist: initial emails plus existing users only
- Image: reject oversized buffer; WebP pipeline mocked sharp/R2 in unit tests for MIME/size guards

## 15. File boundaries

- `lib/db/d1.js` — only module that talks to D1 HTTP
- `lib/db/schema.sql` — DDL
- `lib/vehicles/slug.js`, `filter.js`, `search.js`, `repository.js`
- `lib/inventory/snapshot.js`
- `lib/images/browser-compress.js`, `optimize.js`
- `lib/r2.js`
- `lib/auth/index.js`, `lib/auth/allowlist.js`
- `lib/email/send.js`
- `app/admin/**` — admin UI
- `app/vehicles/**`, `app/search/**`, `app/components/FeaturedCarousel.js`

## 16. Spec self-review

- Placeholders: none.
- Consistency: Vercel + D1 HTTP + R2 + ISR snapshot + Better Auth login-only + WebP.
- Scope: one product (inventory + admin); not decomposed further.
- Ambiguity resolved: `/vehicles` not `/used-vehicles`; no VIN; hide sold; featured flag for carousel; `thumb_url` added for cards.
