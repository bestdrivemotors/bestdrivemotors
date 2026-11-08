# Best Drive Motors Responsive Redesign

Date: 2026-11-08
Status: approved for implementation

## Intent

Make Best Drive Motors' public website and admin usable on mobile and desktop, with a premium dealership visual direction and contacting the dealership as the primary customer action. Improve vehicle discovery, visibility in search and AI answer surfaces, and measurement without changing the existing finance, inventory, or admin contracts.

## Goals

- Establish a responsive, consistent visual system for public pages and admin.
- Rework the home page around dealership/vehicle photography, inventory discovery, verified finance assistance, and click-to-call contact.
- Use one inventory discovery pattern across `/vehicles` and `/search`.
- Give vehicle detail pages an accessible, animated photo carousel with depth effects, thumbnail navigation, and full-screen viewing.
- Improve mobile usability of finance and admin while preserving current workflows.
- Add public-only GTM-managed GA4 and Meta Pixel events, with no form data or admin activity sent.
- Improve technical/local SEO, AEO, and AI-search readiness with accurate metadata, structured data, sitemap, and answer-first content.

## Non-goals

- No vehicle enquiry form; the existing vehicle inventory spec excludes it.
- No interactive 3D model or 360-degree vehicle capture in the initial phase; current inventory has ordinary photos only.
- No changes to finance questions, validation, submission API, inventory behavior, admin permissions, or CRUD workflows.
- No invented claims about inspections, warranties, trade-ins, delivery, or vehicle condition.
- No promise of AI-search placement or rankings.

## Approved direction

- Visual tone: premium dealership, photography-led, with restrained motion.
- Home: new hero photography is desired but not yet supplied. Use the existing hero image until a replacement is provided. Make call and inventory actions prominent.
- Inventory/search: shared responsive layout, desktop filters, mobile filter sheet, consistent cards and sorting.
- Vehicle detail: depth-styled photo carousel with touch and keyboard operation, thumbnails, full-screen photo view, reduced-motion support, and a persistent mobile phone CTA.
- Finance: presentation-only redesign of the existing four-step flow.
- Privacy and 404: preserve legal copy; improve reading layout and recovery links.
- Admin: visual/usability refresh only, preserving workflows and permissions.
- Primary conversion: phone contact. Existing inventory spec takes precedence over any enquiry-form interpretation.

## Analytics and privacy

- GTM, GA4, and Meta Pixel run on public customer pages only; admin routes are excluded. Finance pages may load tags, but no finance values, other PII, or admin activity may be sent.
- Track page views, vehicle-detail views, phone/enquiry link clicks, finance starts, and successful finance submissions only. Emit submission conversion only after server-confirmed success.
- No consent banner is requested. Review applicable privacy requirements before enabling non-essential third-party tags and update the privacy disclosure as needed.
- GTM container ID, GA4 measurement ID, and Meta Pixel ID are pending; do not hardcode fabricated IDs.

## SEO, AEO, and AI search

- Target South Auckland; do not publish a street address unless a verified public address is supplied.
- Index canonical inventory and vehicle-detail pages. Filtered/sorted search variants remain non-indexed.
- Add route-specific titles/descriptions, canonical/social metadata, accurate vehicle and local-business structured data, and a sitemap generated from public inventory.
- Use concise answer-first content and verified FAQs. Finance assistance is the only service claim confirmed for promotion.

## Constraints and success checks

- Continue using the existing Next.js 16 App Router, React 19, Tailwind CSS 4, and JavaScript conventions.
- Preserve the existing cached inventory/photo contract and R2-hosted image pipeline.
- Respect keyboard access, touch interaction, reduced motion, and mobile layouts without horizontal overflow.
- Verify with repository tests, lint, build, and desktop/mobile review. Confirm analytics never runs on admin or sends finance form values.
