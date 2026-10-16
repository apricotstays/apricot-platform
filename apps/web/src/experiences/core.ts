/**
 * Experiences & services — pure helpers (no Astro, no network), unit-tested in test/experiences.test.ts.
 *
 * Content lives in one Notion database ("Garden - Services & Experiences"). One row = one card on
 * /experiences and one detail page at /experiences/<slug>. See notion.ts for how rows are read and
 * claude/experiences-services-plan.md (Claude project) for the field list.
 */

export type Kind = "Service" | "Experience";
export type Status = "Draft" | "Live" | "Paused";

/** One Notion row, flattened to plain values (what notion.ts returns and the snapshot stores). */
export interface ListingRow {
  name: string;
  kind: string;
  slug: string;
  section: string;
  photos: { url: string; name: string }[];
  badge: string;
  description: string;
  where: string;
  duration: string;
  steps: string;
  included: string;
  thingsToKnow: string;
  priceFrom: number | null;
  unit: string;
  priceNote: string;
  showPrice: boolean;
  options: string;
  cancellation: string;
  status: string;
  order: number | null;
  leadTime: string;
  whatsappText: string;
}

export interface Step {
  title: string;
  text: string;
}
export interface Option {
  name: string;
  duration: string;
  /** Rupees, or null when not a number (e.g. still "[price]"). */
  price: number | null;
}

export interface Listing {
  slug: string;
  title: string;
  kind: Kind;
  section: string;
  status: Status;
  order: number;
  badge: string;
  photos: { url: string; name: string }[];
  description: string;
  where: string;
  duration: string;
  steps: Step[];
  included: string[];
  thingsToKnow: Step[];
  priceFrom: number | null;
  unit: string;
  priceNote: string;
  showPrice: boolean;
  options: Option[];
  cancellation: string;
  leadTime: string;
  whatsappText: string;
  /** Unfilled "[PLACEHOLDER]" text found in guest-facing fields. */
  placeholders: string[];
}

/** Rows on the listing page, in this order. Unknown sections are added after these. */
export const SECTION_ORDER = ["At your door", "Day trips"] as const;

export const SECTION_SUBTITLES: Record<string, string> = {
  "At your door": "We send someone to your Apricot home",
  "Day trips": "We drive. You enjoy the day.",
};

/** Non-empty trimmed lines. */
export function lines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

/** "Title — text" (em dash, en dash or " - ") per line. A line without a separator is all title. */
export function parseSteps(text: string): Step[] {
  return lines(text).map((l) => {
    const m = l.match(/^(.*?)\s+[—–-]\s+(.*)$/);
    return m ? { title: m[1].trim(), text: m[2].trim() } : { title: l, text: "" };
  });
}

/** Rupee amount from "499", "₹1,200", "Rs 300". Null for anything else ("[price]", ""). */
export function parseRupees(text: string): number | null {
  const cleaned = text.replace(/₹|rs\.?|inr|,|\s/gi, "");
  return /^\d+(\.\d+)?$/.test(cleaned) ? Number(cleaned) : null;
}

/** "name | duration | price" per line. Missing parts are empty / null. */
export function parseOptions(text: string): Option[] {
  return lines(text).map((l) => {
    const [name = "", duration = "", price = ""] = l.split("|").map((p) => p.trim());
    return { name, duration, price: parseRupees(price) };
  });
}

const rupee = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
export const formatRupees = (n: number) => `₹${rupee.format(n)}`;

/** Card / booking-box price line. */
export function priceLine(l: Pick<Listing, "showPrice" | "priceFrom" | "unit">): string {
  if (l.showPrice && l.priceFrom != null) {
    return `From ${formatRupees(l.priceFrom)}${l.unit ? ` / ${l.unit}` : ""}`;
  }
  return "Price on WhatsApp";
}

/** URL-safe slug; falls back to the title when the Slug column is empty. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** "[HOURS]", "[price]", "[X]"… left in text meant for guests. */
export function findPlaceholders(texts: string[]): string[] {
  const found = new Set<string>();
  for (const t of texts) for (const m of t.matchAll(/\[[^\]\n]{1,40}\]/g)) found.add(m[0]);
  return [...found];
}

export function toListing(row: ListingRow): Listing | null {
  const title = row.name.trim();
  if (!title) return null;
  const kind: Kind = row.kind === "Experience" ? "Experience" : "Service";
  const status: Status =
    row.status === "Live" ? "Live" : row.status === "Paused" ? "Paused" : "Draft";
  const options = parseOptions(row.options);
  const guestFacing = [
    title,
    row.description,
    row.duration,
    row.steps,
    row.included,
    row.thingsToKnow,
    row.priceNote,
    row.cancellation,
    row.leadTime,
    // Option prices only matter when prices are shown.
    row.showPrice ? row.options : row.options.replace(/\|[^|\n]*$/gm, ""),
  ];
  return {
    slug: slugify(row.slug || title),
    title,
    kind,
    section: row.section.trim() || "More",
    status,
    order: row.order ?? 999,
    badge: row.badge.trim(),
    photos: row.photos.filter((p) => p.url),
    description: row.description.trim(),
    where: row.where.trim(),
    duration: row.duration.trim(),
    steps: parseSteps(row.steps),
    included: lines(row.included),
    thingsToKnow: parseSteps(row.thingsToKnow),
    priceFrom: row.priceFrom,
    unit: row.unit.trim(),
    priceNote: row.priceNote.trim(),
    showPrice: row.showPrice,
    options,
    cancellation: row.cancellation.trim(),
    leadTime: row.leadTime.trim(),
    whatsappText:
      row.whatsappText.trim() || `Hi Apricot Stays, I'd like to know more about: ${title}.`,
    placeholders: findPlaceholders(guestFacing),
  };
}

export interface SelectResult {
  listings: Listing[];
  /** Human-readable reasons rows were left out (logged at build time). */
  skipped: string[];
}

/**
 * Which rows get pages.
 * - Production: only Live rows with no "[PLACEHOLDER]" text left (a half-filled row never goes public).
 * - Previews (showDrafts): Live + Draft, placeholders allowed, so pages can be reviewed before launch.
 * Paused rows never show. Duplicate slugs: the first (by section/order) wins.
 */
export function selectListings(rows: ListingRow[], showDrafts: boolean): SelectResult {
  const skipped: string[] = [];
  const out: Listing[] = [];
  const seen = new Set<string>();
  const all = rows.map(toListing).filter((l): l is Listing => l !== null);
  for (const l of sortListings(all)) {
    const visible = l.status === "Live" || (showDrafts && l.status === "Draft");
    if (!visible) {
      skipped.push(`${l.title}: ${l.status}`);
      continue;
    }
    if (!showDrafts && l.placeholders.length) {
      skipped.push(`${l.title}: Live but still has ${l.placeholders.join(", ")}`);
      continue;
    }
    if (!l.slug || seen.has(l.slug)) {
      skipped.push(`${l.title}: duplicate or empty slug "${l.slug}"`);
      continue;
    }
    seen.add(l.slug);
    out.push(l);
  }
  return { listings: out, skipped };
}

function sectionRank(s: string): number {
  const i = (SECTION_ORDER as readonly string[]).indexOf(s);
  return i === -1 ? SECTION_ORDER.length : i;
}

export function sortListings(ls: Listing[]): Listing[] {
  return [...ls].sort(
    (a, b) =>
      sectionRank(a.section) - sectionRank(b.section) ||
      a.section.localeCompare(b.section) ||
      a.order - b.order ||
      a.title.localeCompare(b.title),
  );
}

export function groupBySection(ls: Listing[]): { title: string; listings: Listing[] }[] {
  const groups = new Map<string, Listing[]>();
  for (const l of sortListings(ls)) {
    groups.set(l.section, [...(groups.get(l.section) ?? []), l]);
  }
  return [...groups].map(([title, listings]) => ({ title, listings }));
}

/** Pre-filled WhatsApp text for one option of a listing. */
export function optionMessage(l: Listing, o: Option): string {
  return `${l.whatsappText}\n\nOption: ${o.name}\nDate:\nYour Apricot home:`;
}
