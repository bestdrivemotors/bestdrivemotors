# Best Drive Motors Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the approved responsive, premium, contact-first redesign across public and admin pages, plus privacy-conscious analytics and stronger search visibility.

**Architecture:** Keep the existing Next.js App Router, inventory snapshot, R2 image pipeline, finance flow, and admin contracts. Implement visual changes within existing page/components. Isolate analytics configuration and event dispatch from page UI; keep public indexing/sitemap generation in the existing metadata and robots surfaces.

**Tech Stack:** Next.js 16 App Router, React 19, JavaScript, Tailwind CSS 4, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-08-best-drive-motors-redesign-design.md`

## Global Constraints

- Preserve existing inventory, finance, admin permission, and CRUD behavior.
- Do not add a vehicle enquiry form; use click-to-call and existing finance route.
- Use ordinary inventory photos for a depth-effect gallery; no Three.js/model dependency in the initial phase.
- Respect keyboard/touch use, reduced motion, and responsive layouts.
- Do not send analytics to admin routes or send finance fields/PII to analytics.
- Do not fabricate GTM, GA4, or Meta IDs; they remain configuration prerequisites.
- Use verified facts only; no street address until supplied; target South Auckland.
- Keep filtered/sorted search variants out of the index.

## Review Focus

- Very narrow viewports: navigation, controls, and text must not overflow; validate at 320px and 375px widths.
- Reduced-motion preference: carousel/transitions must remain usable without nonessential animation; validate the preference path.
- Missing/empty vehicle photos: detail gallery must retain a stable layout and useful fallback.
- Finance analytics: submission events must only fire after success and must not contain form values; test failure and success paths.
- Route boundaries: admin must never load GTM/Meta; verify `/admin/login` and an authenticated admin surface.

---

### Task 1: Contact-first home and responsive public chrome

**Files:**
- Modify: `app/components/Hero.jsx`
- Modify: `app/components/Header.jsx`
- Modify: `app/components/Features.jsx`
- Modify: `app/globals.css` only if a shared responsive/reduced-motion rule is needed
- Test: `npm run lint`, `npm run build`, manual viewport review

**Interfaces:**
- Consumes: existing `/vehicles`, `/finance`, hero image, and published dealership phone `022 435 3449`.
- Produces: a home hero with call and inventory actions; responsive public navigation; only verified feature/service claims.

- [x] Replace unsupported hero/feature claims with approved concise copy and add a `tel:+64224353449` action.
- [x] Keep inventory browsing prominent and preserve the existing finance route without claiming approval or best rates.
- [x] Ensure header navigation remains usable on 320px, 375px, tablet, and desktop widths; add visible focus states.
- [x] Run focused lint and `npm run build`; inspect `/` at mobile and desktop widths.

### Task 2: Public inventory and vehicle detail experience

**Files:**
- Modify: `app/vehicles/page.js`, `app/search/page.js`, `app/vehicles/[slug]/page.js`
- Modify as needed: `app/components/VehicleCard.jsx`, `app/components/VehicleFilters.jsx`, `app/components/FeaturedCarousel.js`
- Test: existing inventory/search Vitest suites, `npm run lint`, `npm run build`, manual viewport and keyboard review

**Interfaces:**
- Consumes: `getPublicInventory()` and ordered R2 image URLs from the existing snapshot.
- Produces: shared inventory/search presentation and a vehicle gallery with thumbnail selection, full-screen view, touch/keyboard support, and reduced-motion behavior.

- [x] Align `/vehicles` and `/search` card/filter/sort presentation without changing filtering semantics.
- [x] Replace the static vehicle thumbnail interaction with the approved photo carousel; keep a stable fallback when photos are absent.
- [x] Add a persistent mobile phone action; do not add a vehicle enquiry form.
- [x] Run focused/full tests, changed-file lint, and `npm run build`; inspect mobile layouts and gallery interactions.

### Task 3: Remaining public pages and admin responsive polish

**Files:**
- Modify: `app/finance/page.js`, `app/our-privacy-policy/page.js`, `app/not-found.js`
- Modify: relevant `app/admin/**` pages/components and `app/admin/components/AdminFrame.js`
- Test: existing finance/admin route tests, `npm run lint`, `npm run build`, mobile workflow review

**Interfaces:**
- Consumes: current finance form behavior, privacy copy, admin APIs and permission model.
- Produces: presentation-only finance refresh, readable privacy page, useful 404 recovery, and responsive admin forms/tables.

- [x] Preserve finance field names, validation, step order, and submission contract while improving progress and small-screen layout.
- [x] Preserve privacy/legal text and admin permissions/workflows; improve layout and touch targets.
- [x] Run tests, changed-file lint, and build; review mobile public pages and admin login.

### Task 4: Public-only analytics through GTM

**Files:**
- Create or modify: a public-only analytics loader/event utility under `lib/analytics/` and the public layout integration (`app/layout.js` or `app/components/SiteChrome.js`), plus the finance success boundary.
- Test: `tests/analytics/*.test.js` (route exclusion, event allowlist, no PII) and finance submission event behavior

**Interfaces:**
- Consumes: `NEXT_PUBLIC_GTM_ID`; configure GA4 and Meta Pixel IDs inside GTM; public page/link interactions; server-confirmed finance success.
- Produces: public-page page views, vehicle-detail views, phone/enquiry link clicks, finance starts, and successful submission events only.

- [x] Add tests proving admin routes are excluded and finance payloads cannot carry form values or arbitrary keys.
- [x] Implement optional GTM-managed GA4/Meta integration; do not add fabricated defaults.
- [x] Emit finance conversion only after successful submission; never log field values or other PII.
- [x] Run focused analytics tests and build. Verify no tags appear on admin routes when the GTM ID is unset; route exclusion is unit-tested.

### Task 5: SEO, AEO, and AI-search readiness

**Files:**
- Modify: `app/layout.js`, page-level metadata on home/vehicles/search/finance/detail, `public/robots.txt`
- Replace/extend: `public/sitemap.xml` or add a sitemap route that reads public inventory
- Test: tests for sitemap/indexing policy and `npm run build`; inspect rendered metadata/JSON-LD

**Interfaces:**
- Consumes: verified location/contact/service facts and public inventory snapshot.
- Produces: accurate metadata, canonical/indexing policy, vehicle/local-business JSON-LD, live inventory sitemap, answer-first copy and verified FAQs.

- [x] Remove unsupported/inaccurate address and service details from structured data; use South Auckland only absent a verified street address.
- [x] Index canonical inventory/detail pages and exclude query-driven filter/sort variants.
- [x] Generate sitemap entries from available public inventory and add concise verified answers/FAQs.
- [x] Run SEO tests and build; validate JSON-LD, canonical URLs, robots, and sitemap output.

### Task 6: Full regression and responsive verification

**Files:**
- Test: repository test suite and all touched routes

- [x] Run `npm test` and `npm run build`; run lint on changed files. Repository-wide lint still reports pre-existing errors in untouched `app/components/FormModals.js` and warnings in finance/Tailwind config.
- [x] Review representative public pages and admin login at 320px/390px/desktop, keyboard dialog behavior, reduced-motion CSS, and image fallback code. Authenticated admin workflows require a staff session and were not browser-tested.
- [x] Confirm analytics excludes admin and finance field data, and document outstanding launch inputs.

## Dependencies and launch inputs

- Tasks 1-3 can proceed without external credentials; Task 4 requires GTM container, GA4 measurement, and Meta Pixel IDs to enable production tags.
- A replacement homepage image is desired but not supplied; use the existing hero image until provided.
- Privacy/compliance review is required before enabling non-essential tags without a consent banner.
- A public street address is not required for the initial South Auckland-local SEO plan.
