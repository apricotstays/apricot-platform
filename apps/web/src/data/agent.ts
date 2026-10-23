/**
 * What agents read: /stays.json and /llms-full.txt (Agent-ready Phase 0, roadmap 4.0).
 *
 * Pure builders over the same data the pages use, so the site and the agent can never disagree.
 * No Astro or image imports here: photo URLs are resolved by the endpoints at build time and
 * passed in, which keeps these functions testable with Vitest and safe to bundle into the Worker.
 */
import { brand, contact, promise } from "@apricot/brand";
import {
  formatRupees,
  fromLine,
  minStayRule,
  policiesUpdated,
  properties,
  ratesChecked,
  to24h,
  type Property,
} from "@apricot/schema";
import { amenitiesChecked, amenityGroups } from "./amenities";
import { faq, houseRules, paymentLines } from "./policies";
import { reviews, reviewsChecked } from "./reviews";
import { waysToStay } from "./ways-to-stay";

export interface PhotoRef {
  url: string;
  caption: string;
}

export interface RoomRef {
  name: string;
  bed: string;
  palette: string;
  photo: PhotoRef;
}

/** Absolute photo URLs per home, resolved at build time by the caller. */
export interface ResolvedMedia {
  photos: Record<string, readonly PhotoRef[]>;
  rooms: Record<string, readonly RoomRef[]>;
}

export const RATE_NOTE =
  "Starting weekday rate; weekends and festivals cost more. The exact total for your dates is confirmed on WhatsApp.";
export const BOOKING_NOTE =
  "Bookings are made on WhatsApp. Nothing is booked until we confirm on WhatsApp.";

const pageUrl = (slug: string) => `${brand.url}/stays/${slug}`;
const shortName = (name: string) => name.replace(/^Apricot /, "");
export const bookingMessage = (p: Pick<Property, "name">) =>
  `Hi Apricot Stays, I'd like to book ${p.name}.\n\nDates:\nGuests:`;

/** "5 king beds" → { type: "King", count: 5 }. */
export function parseBeds(beds: string): { type: string; count: number } {
  const m = /^(\d+) (\w+) beds?$/.exec(beds);
  if (!m) throw new Error(`Unexpected beds: ${beds}`);
  return { type: m[2][0].toUpperCase() + m[2].slice(1), count: Number(m[1]) };
}

function homeReviews(slug: string) {
  const r = reviews[slug];
  return {
    source: "Airbnb",
    /** Airbnb's listing rating, shown as text on the site. Null until Airbnb shows one. */
    rating: r?.listing?.rating ?? null,
    count: r?.listing?.count ?? null,
    guestFavourite: r?.listing?.guestFavourite ?? false,
    isNew: r?.isNew ?? false,
    checked: reviewsChecked,
    quotes: (r?.reviews ?? []).map((q) => ({
      name: q.name,
      month: q.month,
      text: q.text,
      /** Set when the guest stayed at a different Apricot home. */
      stayedAt: q.stayedAt ?? null,
    })),
  };
}

function home(p: Property, media: ResolvedMedia) {
  return {
    slug: p.slug,
    name: p.name,
    url: pageUrl(p.slug),
    summary: p.summary,
    description: p.description,
    locality: p.locality,
    maxGuests: p.maxGuests,
    bedrooms: p.bedrooms ?? null,
    bathrooms: p.bathrooms ?? null,
    beds: p.beds,
    garden: p.garden,
    amenities: {
      highlights: [...p.amenities],
      groups: (amenityGroups[p.slug] ?? []).map((g) => ({ name: g.name, items: [...g.items] })),
      checked: amenitiesChecked,
    },
    photos: [...(media.photos[p.slug] ?? [])],
    rooms: [...(media.rooms[p.slug] ?? [])],
    startingRate: {
      amount: p.fromPerNight,
      currency: "INR",
      per: "night",
      label: fromLine(p),
      basis: "starting weekday rate",
      checked: ratesChecked,
      note: RATE_NOTE,
    },
    policy: {
      checkIn: p.policy.checkIn,
      checkOut: p.policy.checkOut,
      checkInTime: to24h(p.policy.checkIn),
      checkOutTime: to24h(p.policy.checkOut),
      pets: p.policy.pets,
      minStay: p.policy.minStay,
      minStayRule,
      freeCancellation: p.policy.freeCancellation,
      cancellation: [...p.policy.cancellation],
      rules: [...p.policy.rules],
    },
    reviews: homeReviews(p.slug),
    links: {
      page: pageUrl(p.slug),
      airbnb: p.airbnbUrl ?? null,
      whatsapp: contact.whatsappLink(bookingMessage(p)),
      availability: `${brand.url}/api/availability?home=${p.slug}`,
    },
  };
}

export type StaysHome = ReturnType<typeof home>;

export function buildStays(media: ResolvedMedia, generated: Date) {
  return {
    generated: generated.toISOString().replace(/\.\d{3}Z$/, "Z"),
    brand: {
      name: brand.name,
      tagline: brand.tagline,
      url: brand.url,
      region: brand.region,
      locality: contact.address.locality,
      addressRegion: contact.address.region,
      country: contact.address.country,
      geo: contact.address.geo,
    },
    promise: { name: promise.name, line: promise.line },
    contact: {
      whatsapp: contact.whatsappE164,
      whatsappDisplay: contact.whatsappDisplay,
      whatsappLink: contact.whatsappLink(
        "Hi Apricot Stays, I'd like to book a stay.\n\nDates:\nGuests:",
      ),
      email: contact.email,
    },
    booking: {
      channel: "WhatsApp",
      note: BOOKING_NOTE,
      rateNote: RATE_NOTE,
    },
    policies: {
      updated: policiesUpdated,
      page: `${brand.url}/policies`,
      minStayRule,
      payment: [...paymentLines],
      houseRules: [...houseRules],
      faq: faq.map((g) => ({
        group: g.group,
        items: g.items.map((it) => ({ q: it.q, a: it.a })),
      })),
    },
    waysToStay: waysToStay.map((w) => ({
      slug: w.slug,
      title: w.title,
      line: w.cardLine,
      url: `${brand.url}/ways-to-stay/${w.slug}`,
      homes: [...w.homes],
    })),
    agents: {
      stays: `${brand.url}/stays.json`,
      llmsFull: `${brand.url}/llms-full.txt`,
      availability: {
        url: `${brand.url}/api/availability?home={slug}`,
        method: "GET",
        returns:
          "{ home, updated, through, booked: [{ from, to }] } — booked nights only; `from` is the first booked night, `to` the checkout day. Up to 1 hour old.",
      },
      mcp: `${brand.url}/mcp`,
    },
    homes: properties.map((p) => home(p, media)),
  };
}

export type Stays = ReturnType<typeof buildStays>;

const bullet = (lines: readonly string[]) => lines.map((l) => `- ${l}`).join("\n");

function homeSection(h: StaysHome): string {
  const facts = [
    `Up to ${h.maxGuests} guests`,
    h.bedrooms ? `${h.bedrooms} bedroom${h.bedrooms > 1 ? "s" : ""}` : null,
    h.beds,
    h.bathrooms ? `${h.bathrooms} bathroom${h.bathrooms > 1 ? "s" : ""}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const r = h.reviews;
  const ratingLine =
    r.rating !== null
      ? `Airbnb rating ${r.rating} from ${r.count} reviews${r.guestFavourite ? " (Airbnb Guest Favourite)" : ""}, checked ${r.checked}.`
      : r.count !== null
        ? `${r.count} review${r.count === 1 ? "" : "s"} on Airbnb; no rating shown yet (checked ${r.checked}).`
        : `New home: no Airbnb reviews of its own yet (checked ${r.checked}).`;
  const quotes = r.quotes
    .map(
      (q) =>
        `- "${q.text}" — ${q.name}, ${q.month}${q.stayedAt ? ` (stayed at ${q.stayedAt})` : ""}`,
    )
    .join("\n");
  const rooms = h.rooms.length
    ? `\n\n### Bedrooms\n\n${h.rooms.map((rm) => `- ${rm.name}: ${rm.bed.toLowerCase()}, ${rm.palette.toLowerCase()}`).join("\n")}`
    : "";
  const amenities = h.amenities.groups.map((g) => `- ${g.name}: ${g.items.join(", ")}`).join("\n");
  return `## ${h.name}

${h.url}

${h.summary} ${h.description}

- ${facts}
- Garden: ${h.garden}
- Location: ${h.locality}
- ${h.startingRate.label} (${h.startingRate.basis}, checked ${h.startingRate.checked}; exact total confirmed on WhatsApp)
- Airbnb listing: ${h.links.airbnb ?? "none"}
- Live availability: ${h.links.availability}

### Amenities

${amenities}${rooms}

### Policies

- Check-in from ${h.policy.checkIn}, checkout by ${h.policy.checkOut}
- Pets: ${h.policy.pets.toLowerCase()}
- Minimum stay: ${h.policy.minStayRule}
- Free cancellation: ${h.policy.freeCancellation.toLowerCase()}
${bullet(h.policy.cancellation)}
${bullet(h.policy.rules)}

### Reviews

${ratingLine}${quotes ? `\n\n${quotes}` : ""}`;
}

export function buildLlmsFull(s: Stays): string {
  const ways = s.waysToStay
    .map(
      (w) =>
        `- [${w.title}](${w.url}): ${w.line} Homes: ${w.homes.map((slug) => shortName(s.homes.find((h) => h.slug === slug)?.name ?? slug)).join(", ")}.`,
    )
    .join("\n");
  const faqText = s.policies.faq
    .map((g) => `### ${g.group}\n\n${g.items.map((it) => `Q: ${it.q}\nA: ${it.a}`).join("\n\n")}`)
    .join("\n\n");
  return `# ${s.brand.name} — full guide for AI assistants and agents

> ${s.brand.name} is a small collection of boutique, home-style short-stay homes at ${s.brand.locality}, ${s.brand.addressRegion}, India. "${s.brand.tagline}" This is the long form of ${s.brand.url}/llms.txt. Generated ${s.generated}.

The Apricot promise — ${s.promise.name}: ${s.promise.line}

${s.booking.note} ${s.booking.rateNote}

${s.homes.map(homeSection).join("\n\n")}

## Ways to stay

${ways}

## Policies for every home

Full text: ${s.policies.page} (updated ${s.policies.updated}).

### Payment

${bullet(s.policies.payment)}

### House rules

${bullet(s.policies.houseRules)}

## FAQ

${faqText}

## How to book

- WhatsApp: ${s.contact.whatsappDisplay} — ${s.contact.whatsappLink}
- Email: ${s.contact.email}
- Share dates, number of guests and preferred home. ${s.booking.note}

## For agents

- ${s.agents.stays}: every home as JSON (facts, grouped amenities, photo URLs with captions, rooms, starting rate, policies, Airbnb rating and review quotes, links). Re-read it rather than caching photo URLs for long: photo file names change when a photo is replaced.
- ${s.agents.availability.url} (${s.agents.availability.method}): booked dates for one home, from its Airbnb calendar. Returns ${s.agents.availability.returns}
- ${s.agents.mcp}: a read-only MCP server (Streamable HTTP, no sign-in) with tools to list homes, check availability for dates and guests, read policies and get a pre-filled WhatsApp booking link.
- Ratings are Airbnb's, quoted as text. Prices are starting weekday rates, not quotes.
`;
}
