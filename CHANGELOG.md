# Changelog

All notable changes to apricotstays.in. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); dates are IST.

## [Unreleased]

### Added

- **The Apricot promise: "A garden of your own."** A named promise (benchmark: "Named signature promise"): every home has its own private garden, lawn or courtyard, never shared. New homepage band under the hero listing each home's garden; a badge under each stay page's title; one line in the Book direct card; a line at the top of /policies; llms.txt and the homepage meta description. Text in `promise` (`packages/brand/src/index.ts`) and `garden` per home (`packages/schema/src/index.ts`). Option A chosen by CK, 21 Oct 2026 (mockups: "Release 3 mockups" canvas).

- **Why Apricot?** The name comes from Shivani's grandmother's garden in Ludhiana, where roses and apricots grew. Our Story's Meet Shivani section gets one line after that paragraph: "That's where our name comes from. Apricot is her grandmother's garden, shared." (with a small apricot sketch, anchor `#name`). The /policies FAQ gets an "About Apricot" group with "Why is it called Apricot?" linking to Our Story; FAQ answers can now carry a link. llms.txt's Our Story line mentions the origin. Mockups B + D approved by CK, 21 Oct 2026.

### Fixed

- **Our Story typo:** "Roses and guava grew there" → "Roses and apricots grew there" (CK, 21 Oct 2026).

### Added

- **Ways to stay: three use-case pages and a homepage row.** "What brings you to Chandigarh?" after Our Collection, with cards in CK's order: A garden for two (Garden Cottage, Garden Courtyard) → `/ways-to-stay/garden-for-two`, Family gatherings (Garden Château) → `/ways-to-stay/family-gatherings`, Hospital & treatment visits (Garden Care) → `/ways-to-stay/hospital-visits`. Each page: headline, intro, cover photo, six reasons, the home(s) with guests, beds and "from" price, a pre-filled WhatsApp message and links to the other two. Copy uses only facts already on the site. schema.org `CollectionPage`; sitemap and llms.txt updated. Data: `src/data/ways-to-stay.ts`.
- **Full amenities list per home.** Highlights stay as before (the Cottage's now match the approved mockup), plus "Show all N amenities", which expands a grouped list (Garden & outdoors, Bedroom & laundry, Bathroom, Kitchen & dining, Work & entertainment, Comfort, Arrival & parking, The estate, Services). Cottage 39, Courtyard 20, Château 25, Care 21 — from each Airbnb amenities list (21 Oct 2026), facts already on the site and items CK confirmed per home; nothing unconfirmed. Also feeds schema.org `amenityFeature`. Data: `src/data/amenities.ts`.
- **Beds.** Every home's facts row now shows its beds (1 king bed; Château 5 king beds), with a "Where you'll sleep" card on the Cottage, Courtyard and Care pages and "King bed" on each Five Rivers caption at the Château (CK, 21 Oct 2026). Also in llms.txt.

- **Minimum stay.** 2 nights when the stay includes a Friday or Saturday night, at all four homes; 1 night otherwise, and 1 night is fine within 3 days of arrival. Shown in each home's "Things to know" (check-in card), as a column in the /policies at-a-glance table and under Check-in & checkout, and in llms.txt. Data: `minStay` + `minStayRule` in `packages/schema/src/index.ts`, pinned in `apps/web/test/policies.test.ts`. CK, 20 Oct 2026.

### Added

- **Stay policies & FAQ (`/policies`), "Things to know" on each home's page, and "Why book with us directly".** New page with an at-a-glance table for the four homes, cancellation and changes (Cottage and Courtyard: free up to 14 days before; Château: 30 days, peak dates non-refundable but movable once; Garden Care: free change or cancellation up to 48 hours before; stay credit worth more than cash; one free date change), payment (50% advance, balance 7 days before; Château ₹20,000 refundable deposit), check-in and checkout (2 PM / 12 PM; Château 3 PM / 11 AM), eight house rules and an 8-question FAQ. Each home's page gets a three-card "Things to know" block (check-in & checkout, house rules, cancellation) after the availability calendar, and the Book direct card gets four direct-booking perks (no discount). Footer link, sitemap and llms.txt (times, cancellation and pets per home). schema.org adds `checkinTime`, `checkoutTime` and `petsAllowed`. One source of truth: `policy` per home in `packages/schema/src/index.ts`, pinned by `apps/web/test/policies.test.ts`. Terms approved by CK 20 Oct 2026; mockups on the "Policies & FAQ mockups (v1)" canvas.

### Changed

- **Garden Shop: Birds of the Garden posters now shown in white frames.** All ten poster images replaced with CK's white-frame versions (same birds, borders and numbering); "black frame" → "white frame" in the collection specs, product details and image descriptions. (CK, 19 Oct 2026.)

### Added

- **Garden Shop v1: shelves, collection pages and product pages; "Birds of the Garden" framed posters.** `/shop` now opens with a button per collection (name, product type, "from" price) and one sideways-scrolling shelf per collection, in the order set by `position` — Birds of the Garden first (marked New), then Words of the Garden (the tumblers). Each shelf has "See all" leading to a collection page (`/shop/birds-of-the-garden`, `/shop/words-of-the-garden`: full grid, price and specs, an Order button on every card, and a link to the other collection). Every design has its own product page (`/shop/<collection>/<item>`, e.g. `/shop/birds-of-the-garden/indian-grey-hornbill`): large image, price, a short description, "Order on WhatsApp", details (size, frame or material, delivery), "More from …" and "Pairs well with". New collection: ten A4 framed watercolour posters of Chandigarh garden birds, ₹999 each (the Indian grey hornbill — Chandigarh's state bird — through to a coppersmith barbet on apricot blossom). The tumbler collection is now named "Words of the Garden". Still soft launch: noindex, not in the sitemap, footer link only. Data: `src/data/shop.ts` (`collections`); shared parts in `src/components/shop/`. Product descriptions drafted by Claude for CK's review. Mockups approved by CK 19 Oct 2026.

### Changed

- **Garden Shop: removed "A garden is not an amenity. It is a reason."** (CK, 18 Oct 2026). Ten designs remain, renumbered No. 01–10 in the same order (Jasmine is now No. 01, Apricot No. 10); image files renamed to match.

### Added

- **The Garden Shop (`/shop`), soft launch.** Eleven 20 oz tumblers, each wrapped in watercolour garden artwork and carrying one line from our garden (CK's own copy; No. 11 is Shivani's line from Our Story). ₹1,199 each. Each card has "Order on WhatsApp", which opens a message naming the design and its number; payment by UPI; printed to order by Qikink and shipped to the customer. "How ordering works", gift note, damage policy and an Our Story quote. Page-scoped Our Story palette (cream, forest green); site header and footer unchanged apart from one "The Garden Shop" link in the footer's Explore list. Noindex and not in the sitemap until the first printed sample is approved. Products and price in `src/data/shop.ts`; images in `src/assets/shop/` (design previews, labelled as such). Unit tests for numbering, price formatting and the order message; `/shop` added to the accessibility check. Mockup approved by CK 18 Oct 2026.

- **"Powered by STAIZ" credit, in two places.** (1) The footer's bottom line on every page, between the copyright and Privacy (centred, stacked on phones). (2) Under the availability calendar on each home's page: "Live availability · powered by STAIZ" (only where the calendar is on — today Garden Cottage). The wordmark is one component, `src/components/StaizMark.astro`: ST·AI·Z with "AI" in the apricot accent (the AI inside STAIZ). Plain text for now; set `poweredBy.url` in `packages/brand/src/index.ts` when the STAIZ site is live and both credits become links (new tab). No schema.org change. Mockups approved by CK 17 Oct 2026.

- **"Coming 2027" teaser for The Mushroom Garden in Our Collection.** One card after the four homes, spanning both columns on desktop (same height as a home card; stacks as a 4:3 card on phones): a line sketch on a linen tile with a dashed border (not a photo — nothing built yet), "Coming 2027" label, "Early sketch" caption, "A whole garden, made to stay in." (desktop), then "The Mushroom Garden / Chandigarh · In the making" and "Join the first-look list", which opens WhatsApp with a pre-filled message. Not bookable, so it is deliberately not in `properties`: no schema.org, sitemap, `llms.txt`, "Also on Airbnb" or booking entries; no nav link or new page. Component: `src/components/MushroomGardenCard.astro`. Approved by CK 16 Oct 2026.

- **Guest reviews on each home's page ("What guests say").** Under "About this stay": the Airbnb listing line as text (Cottage "Airbnb Guest Favourite · 4.98 from 64 reviews", Courtyard "Airbnb Guest Favourite · 5.0 from 27 reviews", Care "2 reviews on Airbnb"), up to 3 short quoted reviews (first name, month, "via Airbnb"), and "Read all N reviews on Airbnb". Garden-led picks, quoted with the guests' consent. The Château, with no reviews yet, shows "New to the collection", the host line and two Courtyard guests' reviews, labelled. Text only — no review or rating structured data. Reviews live in `src/data/reviews.ts`. Airbnb's badge graphic is not used. Unit tests for the data and the listing line; Garden Care added to the accessibility check.

- **Bedrooms and bathrooms for Garden Cottage and Garden Courtyard** (1 bedroom · 1 bathroom each, from their Airbnb listings, Oct 2026). Their pages now show the same facts row as the Château and Care, and schema.org gets `numberOfRooms`. Data only; no design change.

- **Starting prices on every home ("From ₹X / night").** Garden Cottage from ₹5,500, Garden Courtyard from ₹8,500, Garden Château from ₹45,000, Garden Care from ₹4,500 (rates set by the owner, Oct 2026). Shown under each home in Our Collection (with one line: starting weekday rates, exact price for your dates on WhatsApp, rates checked Oct 2026), at the top of each home's Book direct card, in the phone booking bar, in `llms.txt`, and as schema.org `priceRange`. Rates live in `packages/schema` (`fromPerNight`, plus `ratesChecked`) — update by hand. Existing styles only; no design change. Replaces the "no prices on the site" rule. Unit tests for the formatting and the four rates.

- **Experiences & services: shareable tab links and row order from Notion.** The All / Experiences / Services tabs are now links, so `apricotstays.in/experiences#experiences` and `#services` open already filtered and can be sent to guests (still no JavaScript: CSS `:target`; Back/Forward work). The order of the rows ("At your door", "Day trips", …) now follows the order of the options in the Notion "Section" property — drag an option up in Notion and the row moves at the next build. Falls back to the built-in order if Notion can't be read.
- **Experiences & services (`/experiences`, `/experiences/<slug>`).** A simpler take on Airbnb Experiences / Services: rows of cards ("At your door", "Day trips") with All / Experiences / Services tabs (no JavaScript), and a page per listing with photos, how the day goes (experiences), options with their own "Ask for this" WhatsApp link, what's included, "Arranged by Apricot Stays", things to know and a Request on WhatsApp box (bottom bar on phones). "Looking for something else?" asks on WhatsApp. First three listings: Car wash at your door, Home-style tiffin, Tasting menu at NAAR, Kasauli (we drive, you dine).
  - **Content comes from Notion** (database "Garden - Services & Experiences"), read at build time with a read-only integration token (`NOTION_TOKEN`, a Cloudflare build secret). Only `Status = Live` rows are published, and a Live row that still has `[PLACEHOLDER]` text is held back. Preview builds (any branch but `main`) also show Draft rows, labelled. "Internal notes" is never read. Photos uploaded to Notion are downloaded and resized at build time. No token, or Notion down → the committed snapshot (`src/experiences/snapshot.json`) is used, so a build never breaks.
  - **Soft launch:** reachable only from a new footer link (Explore → "Experiences & services", shown only when at least one listing is published), `noindex`, not in the sitemap or `llms.txt` (`SOFT_LAUNCH` in `src/experiences/load.ts`). Header unchanged.
  - **Nightly refresh:** `.github/workflows/refresh-experiences.yml` calls a Cloudflare deploy hook (secret `CF_DEPLOY_HOOK`) at 03:00 IST and on demand (Actions → Run workflow), so Notion edits go live without a code change.
  - Unit tests for the Notion reader and listing rules; the listing and two detail pages added to the accessibility check; CI builds with drafts shown. The link checker skips `/experiences` itself (a page with a same-named folder, which linkinator can't resolve locally; Cloudflare serves it, checked with `wrangler dev`).
  - Icons: home, car, clock, check.
  - Optional "Photo credit" column, shown under the photos (e.g. "Photos: NAAR" for the NAAR listing, used with NAAR's permission).

- **Club menu page (`/menu`).** For guests already staying: The City Club (DLF Hyde Park) menu, "Call to order" button (+91 96469 64064), kitchen hours (9:30 am – 10 pm), three-step how-to-order, section shortcuts, the 7 menu pages as images (tap for full size) and the PDF to download; phones get a bottom Call / WhatsApp bar. Site header and footer. `noindex`, not in the nav or sitemap; shared by WhatsApp and a QR card in each home. Menu details live in `src/data/club-menu.ts`. Added to the accessibility check.
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
