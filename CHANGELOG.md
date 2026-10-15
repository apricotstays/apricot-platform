# Changelog

All notable changes to apricotstays.in. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); dates are IST.

## [Unreleased]

### Added

- **Our Story page (`/our-story`).** Seven sections: opening ("A garden of your own."), Meet Shivani, Everyone's private garden, How Shivani keeps every garden, Quieter pleasures, Four gardens to stay in, close. Page-only handbook palette (cream ground, forest green `#2f4a3a` headings, band and buttons, terracotta labels); the site theme is unchanged. Real photos only (Cottage garden path leads; one photo per home). Copy and portrait approved by Shivani (15 Oct 2026). Listed in the sitemap, `llms.txt` and the accessibility check.
- **Availability calendar (Part 1: Garden Cottage).** The Cottage page shows which nights are booked, read from its Airbnb calendar and refreshed hourly. Two months side by side on desktop, one on phones, 12 months ahead; booked nights are struck through and shaded; checkout days stay free. Picking dates fills the Book direct card ("Ask about 18–21 Nov on WhatsApp") and pre-fills the WhatsApp message; phones get a bottom booking bar. Keyboard: arrow keys move between days, Enter picks.
- `GET /api/availability?home=<slug>`: the site's first Worker code (`apps/web/src/worker.ts`, runs only for `/api/*`). Returns booked date pairs only — summaries, reservation links and phone digits in the Airbnb feed are discarded before anything is cached or sent. Cached 1 h, with a 24 h last-good backup if Airbnb fails. One encrypted secret per home, `ICAL_<SLUG>`; a home without one shows no calendar (only `ICAL_GARDEN_COTTAGE` for now).
- Unit tests (Vitest) for the iCal parser and the API, run in CI.
- Privacy notice: one line on availability calendars (dates only, no guest information).
- Garden Château: "The Five Rivers" section — one photo per named bedroom (Chenab Suite, Ravi, Beas, Sutlej, Jhelum) with the owner's caption artwork kept uncropped, room name and palette as real text.
- Garden Château gallery: 8 real photos from its Airbnb listing (front, street view, living room, lounge, foyer, hall with snooker table, dining ×2); the Château now shows 9 photos instead of 1. Bedroom photos held back until versions without caption overlays are available.
- Trust line ("4.99 host rating · 93 Airbnb reviews · Superhost") under Our Collection and in each home's Book direct card. Text only — not in schema.org markup. Figures live in `packages/brand` (`trust`), checked Oct 2026.
- New home: Apricot Garden Care (`/stays/garden-care`) — a step-free one-bedroom care stay near PGI and Homi Bhabha Cancer Hospital, with 7 photos from its Airbnb listing and its Airbnb link. Appears in Our Collection, the footer, Also on Airbnb, the sitemap and `llms.txt`.
- Garden Cottage gallery: 8 real photos from the Cottage's Airbnb listing (sunset exterior, porch, bedroom ×2, kitchen ×2, garden ×2); the cottage now shows 9 photos instead of 1.
- Garden Cottage Airbnb link.

### Changed

- Navigation and footer: "Our Story" now links to `/our-story` (was `/#story`); nav marks the current page.
- Homepage Our Story section is now a short teaser (one photo, two lines, "Read our story" link); `#story` anchor kept.
- Our Collection: 2×2 grid on tablet/desktop (was 3 across) to fit four homes.
- Stay facts: singular "1 bedroom" / "1 bathroom".
- Homepage meta description mentions the care stay.
- Homepage, The Garden Club: "privileges—like" → "privileges such as".

## [0.3.0] — 2026-10-14

Full guest site, ported from the Replit design (recovered from the Replit dev server on 14 Oct 2026, ahead of the Replit account expiry).

### Added

- Homepage sections from the Replit design: full-height hero (video on desktop, photo on phones / reduced motion), Our Collection, The Garden Club, Experiences, Our Story, Thoughtful Amenities, Also on Airbnb, "Ready to unwind?" call to action.
- Stay pages: `/stays/garden-cottage`, `/stays/garden-courtyard`, `/stays/garden-chateau` — gallery, facts, amenities, location (Google Maps link, no embed), book-direct card (WhatsApp) and Airbnb link where a listing exists.
- schema.org `LodgingBusiness` per home with address and coordinates (DLF Hyde Park, New Chandigarh); sitemap and `llms.txt` list each home.
- Tailwind CSS v4 (build-time only); Replit class names ported directly.
- Responsive AVIF/WebP images generated at build time; hero video re-encoded 19 MB → 5.9 MB, no audio, desktop only.

### Changed

- **Brand palette now follows the Replit design** (`packages/brand/src/theme.css`): accent `#FF5A5F`, sage `#00A699`, stone `#484848`, pebble `#F7F7F7`, gold `#D4A574`, creams `#FBF8F3` / `#F7F3ED` / `#EEE6DB`. Fonts: Lora (headings) + DM Sans (body), self-hosted.
- Property names follow Replit: Apricot Garden Cottage / Courtyard / Château.
- Footer and navigation rebuilt from Replit; mobile menu uses a native disclosure (no JavaScript).

### Decisions and trade-offs

- **Accent colour contrast (owner decision, 14 Oct 2026).** `#FF5A5F` measures 3.0:1 on white, below WCAG AA (4.5:1). Kept by choice; the axe `color-contrast` rule is ignored in CI. Every other accessibility rule still blocks. Note: `#FF5A5F`/`#00A699`/`#484848` are also Airbnb's brand colours.
- Only real photographs are used. Replit's AI-generated images (4), stock images (2) and a newspaper's hospital photo were not ported.
- Not ported (need real content or owner confirmation): guest testimonials and Wall of Love (placeholder names), "4.9/5" rating badge, Farm Breakfast / Mountain Breeze / Curated Library amenities, Bloom tiers and prices, Medical Long Stays page, Meet the Team, homeowner/partner pages, Instagram link, booking-platform logo wall (only Airbnb listings are linked).
- Not ported, out of scope for the guest site (belong in STAIZ): admin, reservations, gate passes, how-to videos, partner reports, proposals.
- Prices are not shown; rates are quoted on WhatsApp.

### Removed

- v0.2 coming-soon layout, Fraunces font, apricot `#E3874B` palette, `public/og.jpg` (Open Graph images are now generated per page).

## [0.2.0] — 2026-10-14

### Added

- WhatsApp as the single contact channel (+91 97405 44873) with a pre-filled enquiry message.
- Privacy notice at `/privacy` (DPDP Act, 2023): no cookies, no forms, cookie-free analytics, WhatsApp handling, rights and grievance contact.
- Discoverability: schema.org `Organization` + `LodgingBusiness` per home, `robots.txt`, `sitemap.xml`, `llms.txt`, `og:locale`/`og:image:alt`.
- Security headers (`_headers`): CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, COOP; long cache for hashed assets.
- `_redirects`: retired `/thanks.html` and `/index.html` → `/`.
- Custom 404 page.
- Cloudflare Workers static-assets config (`apps/web/wrangler.jsonc`).

### Changed

- Fonts self-hosted (Fontsource: Fraunces, DM Sans) and preloaded. No requests to Google. Lighthouse performance 86 → 99, layout shift 0.
- Small apricot text uses `--apricot-text` #A55628 (WCAG AA). Headline accent unchanged.
- Header/Footer extracted into components; footer links to Privacy.
- CI gates raised: accessibility (axe) now blocking; Lighthouse ≥ 0.9 on all categories.

### Removed

- Email sign-up form (Netlify Forms), thanks page, Instagram placeholders and the script that hid them. The page now ships no JavaScript.

## [0.1.0] — 2026-10-14

### Added

- Monorepo: `apps/web` (Astro + TypeScript), `apps/api` (reserved), `packages/brand`, `packages/schema`.
- Coming-soon page rebuilt in Astro, pixel-identical to the Netlify version (verified by screenshot diff at 1440 px and 375 px).
- Brand tokens (colours, fonts, logo) moved to `packages/brand`; property list to `packages/schema`.
- CI: formatting, type check, build, internal link check, WCAG 2 AA (axe), Lighthouse budget.
- README, CHANGELOG, SECURITY policy, CODEOWNERS, PR template, Dependabot.

### Fixed

- Canonical URL now resolves to `https://apricotstays.in/`.

### Known issues (carried over from the Netlify page; fix planned for 0.2.0)

- Colour contrast below WCAG AA: eyebrow text, property numbers (`--apricot-deep` #B8602C on cream ≈ 3.9:1) and the Notify button (white on apricot ≈ 2.6:1). Proposed: darken text uses to #A55628 (4.6:1).
- Lighthouse performance 73–86 (mobile, simulated; varies by machine): Google Fonts stylesheet blocks rendering (~2.3 s). Plan: self-host Fraunces and DM Sans at build time, which also stops sending visitor IPs to Google.
- Email sign-up form posts to Netlify Forms, which was never enabled: no submissions were ever stored. Replaced by WhatsApp in 0.2.0.
