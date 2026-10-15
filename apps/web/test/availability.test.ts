import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  BACKUP_SECONDS,
  FRESH_SECONDS,
  handleAvailability,
  secretName,
  type Deps,
} from "../src/api/availability";
import worker from "../src/worker";

// Raw text, CRLF line endings kept (Vite ?raw import).
import sample from "./fixtures/airbnb-sample.ics?raw";
const FEED = "https://www.airbnb.com/calendar/ical/123.ics?s=secret-token";
const NOW = Date.parse("2026-10-15T09:12:00Z");
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** In-memory stand-in for Cloudflare's cache (ignores Cache-Control; the handler checks age). */
class MemoryCache {
  store = new Map<string, string>();
  async match(key: RequestInfo | URL) {
    const v = this.store.get(String(key));
    return v === undefined ? undefined : new Response(v);
  }
  async put(key: RequestInfo | URL, res: Response) {
    this.store.set(String(key), await res.text());
  }
}

let cache: MemoryCache;
let pending: Promise<unknown>[];
let now: number;
let feed: ReturnType<typeof vi.fn<Deps["fetch"]>>;

const deps = (): Deps => ({
  cache: cache as unknown as Deps["cache"],
  fetch: feed,
  now: () => now,
  waitUntil: (p) => void pending.push(p),
});
const env = { ICAL_GARDEN_COTTAGE: FEED };
const call = async (home = "garden-cottage", e: Record<string, unknown> = env) => {
  const res = await handleAvailability(
    new URL(`https://apricotstays.in/api/availability?home=${home}`),
    e,
    deps(),
  );
  await Promise.all(pending);
  return res;
};

beforeEach(() => {
  cache = new MemoryCache();
  pending = [];
  now = NOW;
  feed = vi.fn<Deps["fetch"]>(async () => new Response(sample, { status: 200 }));
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

describe("GET /api/availability", () => {
  it("returns booked date pairs from the feed, merged and from today on", async () => {
    const res = await call();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      home: "garden-cottage",
      updated: "2026-10-15T09:12:00Z",
      through: "2027-10-15",
      booked: [
        { from: "2026-10-16", to: "2026-10-23" },
        { from: "2026-11-06", to: "2026-11-07" },
        { from: "2026-12-24", to: "2027-01-04" },
      ],
    });
    expect(feed).toHaveBeenCalledWith(FEED, expect.anything());
  });

  it("response contains only home, updated, through and date pairs: nothing else from the feed", async () => {
    const res = await call();
    const text = await res.clone().text();
    const body = (await res.json()) as Record<string, unknown>;
    expect(Object.keys(body).sort()).toEqual(["booked", "home", "through", "updated"]);
    for (const r of body.booked as Record<string, string>[]) {
      expect(Object.keys(r).sort()).toEqual(["from", "to"]);
      expect(r.from).toMatch(ISO_DATE);
      expect(r.to).toMatch(ISO_DATE);
    }
    for (const leak of [
      "Reserved",
      "Not available",
      "airbnb",
      "HMTEST",
      "4821",
      "7350",
      "1906",
      "Phone",
      "secret-token",
      "@",
    ]) {
      expect(text).not.toContain(leak);
    }
    // The cached copies hold exactly the same, nothing more.
    for (const stored of cache.store.values()) expect(stored).toBe(text);
  });

  it("sets the API headers", async () => {
    const res = await call();
    expect(res.headers.get("Content-Type")).toBe("application/json; charset=utf-8");
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(res.headers.get("Cache-Control")).toBe("public, max-age=300");
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("serves the fresh copy for an hour without calling Airbnb", async () => {
    await call();
    now = NOW + (FRESH_SECONDS - 60) * 1000;
    const res = await call();
    expect(res.status).toBe(200);
    expect(feed).toHaveBeenCalledTimes(1);
  });

  it("refetches after an hour", async () => {
    await call();
    now = NOW + (FRESH_SECONDS + 60) * 1000;
    await call();
    expect(feed).toHaveBeenCalledTimes(2);
  });

  it("Airbnb error → backup served", async () => {
    await call();
    now = NOW + 3 * 3600 * 1000;
    feed.mockResolvedValueOnce(new Response("oops", { status: 500 }));
    const res = await call();
    expect(res.status).toBe(200);
    expect(((await res.json()) as { updated: string }).updated).toBe("2026-10-15T09:12:00Z");
  });

  it("Airbnb timeout / network error → backup served", async () => {
    await call();
    now = NOW + 2 * 3600 * 1000;
    feed.mockRejectedValueOnce(new Error("timeout"));
    expect((await call()).status).toBe(200);
  });

  it("Airbnb error and no backup → 503", async () => {
    feed.mockResolvedValueOnce(new Response("oops", { status: 500 }));
    expect((await call()).status).toBe(503);
  });

  it("Airbnb error and a backup older than 24 h → 503", async () => {
    await call();
    now = NOW + (BACKUP_SECONDS + 60) * 1000;
    feed.mockRejectedValueOnce(new Error("down"));
    expect((await call()).status).toBe(503);
  });

  it("a non-calendar reply (e.g. a login page) counts as an error", async () => {
    feed.mockResolvedValueOnce(new Response("<html>Sign in</html>", { status: 200 }));
    expect((await call()).status).toBe(503);
  });

  it("never logs the feed link", async () => {
    feed.mockRejectedValueOnce(new Error("down"));
    await call();
    const logged = vi.mocked(console.warn).mock.calls.flat().join(" ");
    expect(logged).toContain("garden-cottage");
    expect(logged).not.toContain("secret-token");
  });

  it("unknown home → 404", async () => {
    expect((await call("nowhere")).status).toBe(404);
    expect((await call("")).status).toBe(404);
    expect(feed).not.toHaveBeenCalled();
  });

  it("missing secret → 503, not a crash", async () => {
    const res = await call("garden-chateau");
    expect(res.status).toBe(503);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    expect(feed).not.toHaveBeenCalled();
  });

  it("works without a cache (preview URLs)", async () => {
    const res = await handleAvailability(
      new URL("https://x.workers.dev/api/availability?home=garden-cottage"),
      env,
      { ...deps(), cache: null },
    );
    expect(res.status).toBe(200);
  });

  it("names secrets ICAL_<SLUG>", () => {
    expect(secretName("garden-cottage")).toBe("ICAL_GARDEN_COTTAGE");
    expect(secretName("garden-chateau")).toBe("ICAL_GARDEN_CHATEAU");
  });
});

describe("worker routing", () => {
  const ctx = { waitUntil: () => {} };
  const assets = { fetch: vi.fn(async () => new Response("static")) };

  it("hands non-API paths to static assets", async () => {
    const res = await worker.fetch(
      new Request("https://apricotstays.in/"),
      { ASSETS: assets },
      ctx,
    );
    expect(await res.text()).toBe("static");
  });

  it("404s unknown API paths and rejects writes", async () => {
    const e = { ASSETS: assets };
    expect((await worker.fetch(new Request("https://a.in/api/nope"), e, ctx)).status).toBe(404);
    const post = new Request("https://a.in/api/availability?home=garden-cottage", {
      method: "POST",
    });
    expect((await worker.fetch(post, e, ctx)).status).toBe(405);
  });
});
