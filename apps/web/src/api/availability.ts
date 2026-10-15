/**
 * GET /api/availability?home=<slug>
 *
 * Reads the home's Airbnb calendar export (secret ICAL_<SLUG>), keeps booked dates only and
 * returns { home, updated, through, booked: [{ from, to }] }.
 *
 * Caching (Cloudflare Cache API, per data centre): a fresh copy for 1 hour and a last-good
 * backup for 24 hours. Airbnb down → backup; no backup → 503 and the page hides the calendar.
 * Preview URLs (workers.dev) have no cache, so every request there fetches Airbnb.
 */
import { properties } from "@apricot/schema";
import { addDays, clipRanges, mergeRanges, parseIcal, type Range } from "./ical";

export interface Availability {
  home: string;
  /** When the feed was read, ISO 8601 UTC. */
  updated: string;
  /** Last date covered (exclusive), 12 months ahead. */
  through: string;
  booked: Range[];
}

export type Env = Record<string, unknown>;

export interface Deps {
  /** Cloudflare's cache, or null where there is none (tests, previews). */
  cache: Pick<Cache, "match" | "put"> | null;
  fetch: (input: string, init?: RequestInit) => Promise<Response>;
  now: () => number;
  waitUntil: (p: Promise<unknown>) => void;
}

export const FRESH_SECONDS = 60 * 60;
export const BACKUP_SECONDS = 24 * 60 * 60;
const FETCH_TIMEOUT_MS = 8_000;
const IST_OFFSET_MS = 330 * 60_000;

const slugs = new Set(properties.map((p) => p.slug));

/** "garden-cottage" → "ICAL_GARDEN_COTTAGE". */
export const secretName = (slug: string) => `ICAL_${slug.toUpperCase().replace(/-/g, "_")}`;

/** Today's date in India (the homes' time zone). */
export const todayIST = (nowMs: number) =>
  new Date(nowMs + IST_OFFSET_MS).toISOString().slice(0, 10);

export function buildAvailability(home: string, ics: string, nowMs: number): Availability {
  const today = todayIST(nowMs);
  const through = addDays(today, 365);
  return {
    home,
    updated: new Date(nowMs).toISOString().replace(/\.\d{3}Z$/, "Z"),
    through,
    booked: clipRanges(mergeRanges(parseIcal(ics)), today, through),
  };
}

const API_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
  "Access-Control-Allow-Origin": "*",
};

export function json(body: unknown, status = 200): Response {
  return new Response(typeof body === "string" ? body : JSON.stringify(body), {
    status,
    headers: {
      ...API_HEADERS,
      "Cache-Control": status === 200 ? "public, max-age=300" : "no-store",
    },
  });
}

/** Read a cached copy; null when missing, unreadable or older than maxAgeSeconds. */
async function readCached(
  cache: Deps["cache"],
  key: string,
  nowMs: number,
  maxAgeSeconds: number,
): Promise<string | null> {
  if (!cache) return null;
  try {
    const hit = await cache.match(key);
    if (!hit) return null;
    const text = await hit.text();
    const { updated } = JSON.parse(text) as { updated?: string };
    const age = nowMs - Date.parse(updated ?? "");
    return age >= 0 && age <= maxAgeSeconds * 1000 ? text : null;
  } catch {
    return null;
  }
}

function store(cache: Deps["cache"], key: string, body: string, seconds: number) {
  if (!cache) return Promise.resolve();
  const res = new Response(body, {
    headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${seconds}` },
  });
  return cache.put(key, res).catch(() => undefined);
}

export async function handleAvailability(url: URL, env: Env, deps: Deps): Promise<Response> {
  const home = url.searchParams.get("home") ?? "";
  if (!slugs.has(home)) return json({ error: "Unknown home" }, 404);

  // No secret (or not a URL) → this home has no calendar yet.
  const feed = env[secretName(home)];
  if (typeof feed !== "string" || !/^https:\/\//i.test(feed.trim())) {
    return json({ error: "Availability not available" }, 503);
  }

  const now = deps.now();
  const freshKey = `${url.origin}/__cache/availability/${home}`;
  const backupKey = `${freshKey}/backup`;

  const fresh = await readCached(deps.cache, freshKey, now, FRESH_SECONDS);
  if (fresh) return json(fresh);

  try {
    const res = await deps.fetch(feed.trim(), {
      headers: { Accept: "text/calendar" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ics = await res.text();
    if (!ics.includes("BEGIN:VCALENDAR")) throw new Error("Not a calendar");
    const body = JSON.stringify(buildAvailability(home, ics, now));
    deps.waitUntil(
      Promise.all([
        store(deps.cache, freshKey, body, FRESH_SECONDS),
        store(deps.cache, backupKey, body, BACKUP_SECONDS),
      ]),
    );
    return json(body);
  } catch (err) {
    // Never log the feed URL: it is a secret.
    console.warn(`availability: feed for ${home} failed (${(err as Error).message})`);
    const backup = await readCached(deps.cache, backupKey, now, BACKUP_SECONDS);
    if (backup) return json(backup);
    return json({ error: "Availability not available" }, 503);
  }
}
