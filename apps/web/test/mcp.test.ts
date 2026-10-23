import { beforeEach, describe, expect, it, vi } from "vitest";
import { properties } from "@apricot/schema";
import { buildStays, type ResolvedMedia } from "../src/data/agent";
import type { Deps } from "../src/api/availability";
import {
  bookingMessage,
  checkDates,
  clashes,
  handleMcp,
  span,
  weekendRule,
  type McpDeps,
} from "../src/api/mcp";
import worker from "../src/worker";
// Raw source (Vite ?raw import), to pin the page calendar's message.
import calendarSrc from "../src/components/AvailabilityCalendar.astro?raw";

// Today in India: Fri 23 Oct 2026.
const NOW = Date.parse("2026-10-23T09:00:00Z");
const TODAY = "2026-10-23";

const media: ResolvedMedia = {
  photos: Object.fromEntries(
    properties.map((p) => [
      p.slug,
      [1, 2, 3, 4].map((n) => ({
        url: `https://apricotstays.in/_astro/${p.slug}-${n}.webp`,
        caption: `${p.name} ${n}`,
      })),
    ]),
  ),
  rooms: {},
};
const stays = buildStays(media, new Date(NOW));

/** Château booked 13–15 Nov (checkout 15th); Cottage booked 20–22 Nov; others open. */
const ics = (events: [string, string][]) =>
  [
    "BEGIN:VCALENDAR",
    ...events.flatMap(([a, b]) => [
      "BEGIN:VEVENT",
      `DTSTART;VALUE=DATE:${a}`,
      `DTEND;VALUE=DATE:${b}`,
      "SUMMARY:Reserved",
      "END:VEVENT",
    ]),
    "END:VCALENDAR",
  ].join("\r\n");
const FEEDS: Record<string, string> = {
  "https://feed/chateau": ics([["20261113", "20261115"]]),
  "https://feed/cottage": ics([["20261120", "20261122"]]),
  "https://feed/courtyard": ics([]),
};
const env = {
  ICAL_GARDEN_CHATEAU: "https://feed/chateau",
  ICAL_GARDEN_COTTAGE: "https://feed/cottage",
  ICAL_GARDEN_COURTYARD: "https://feed/courtyard",
  // Garden Care has no secret: its calendar can't be read.
};

let logs: string[];
const deps = (): McpDeps => ({
  cache: null,
  fetch: vi.fn<Deps["fetch"]>(async (u) => new Response(FEEDS[u] ?? "nope", { status: 200 })),
  now: () => NOW,
  waitUntil: () => {},
  stays: async () => stays,
  log: (l) => void logs.push(l),
});

const post = (body: unknown, raw = false) =>
  new Request("https://apricotstays.in/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
    body: raw ? (body as string) : JSON.stringify(body),
  });
const rpc = async (method: string, params?: unknown, id: unknown = 1) => {
  const res = await handleMcp(post({ jsonrpc: "2.0", id, method, params }), env, deps());
  return { res, body: (await res.json()) as any };
};
const call = async (name: string, args: Record<string, unknown> = {}) => {
  const { body } = await rpc("tools/call", { name, arguments: args });
  return body.result as { isError: boolean; structuredContent: any; content: { text: string }[] };
};

beforeEach(() => {
  logs = [];
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

describe("MCP protocol", () => {
  it("initialize echoes a supported version, else offers the latest", async () => {
    for (const v of ["2025-03-26", "2025-06-18", "2025-11-25"]) {
      const { res, body } = await rpc("initialize", {
        protocolVersion: v,
        capabilities: {},
        clientInfo: { name: "test", version: "1" },
      });
      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toMatch(/^application\/json/);
      expect(res.headers.get("Cache-Control")).toBe("no-store");
      expect(body.result.protocolVersion).toBe(v);
      expect(body.result.capabilities).toEqual({ tools: { listChanged: false } });
      expect(body.result.serverInfo.name).toBe("apricot-stays");
    }
    const { body } = await rpc("initialize", { protocolVersion: "1999-01-01" });
    expect(body.result.protocolVersion).toBe("2025-11-25");
  });

  it("accepts notifications with 202 and no body", async () => {
    const res = await handleMcp(
      post({ jsonrpc: "2.0", method: "notifications/initialized" }),
      env,
      deps(),
    );
    expect(res.status).toBe(202);
    expect(await res.text()).toBe("");
  });

  it("lists four read-only tools with input schemas", async () => {
    const { body } = await rpc("tools/list");
    const tools = body.result.tools;
    expect(tools.map((t: any) => t.name)).toEqual([
      "list_homes",
      "check_availability",
      "get_policies",
      "get_booking_link",
    ]);
    for (const t of tools) {
      expect(t.annotations.readOnlyHint, t.name).toBe(true);
      expect(t.inputSchema.type).toBe("object");
      expect(t.title).toBeTruthy();
      expect(t.description.length).toBeGreaterThan(80);
    }
    expect(tools[1].inputSchema.required).toEqual(["check_in", "check_out"]);
    expect(tools[3].inputSchema.properties.home.enum).toEqual(properties.map((p) => p.slug));
  });

  it("answers ping", async () => {
    expect((await rpc("ping")).body.result).toEqual({});
  });

  it("rejects bad requests with JSON-RPC errors, never a 500", async () => {
    const parse = await handleMcp(post("{nope", true), env, deps());
    expect(parse.status).toBe(400);
    expect(((await parse.json()) as any).error.code).toBe(-32700);

    const batch = await handleMcp(post([{ jsonrpc: "2.0", id: 1, method: "ping" }]), env, deps());
    expect(((await batch.json()) as any).error.code).toBe(-32600);

    expect((await rpc("tools/call", { name: "book_now", arguments: {} })).body.error.code).toBe(
      -32602,
    );
    expect((await rpc("resources/list")).body.error.code).toBe(-32601);
  });

  it("allows POST only", async () => {
    for (const method of ["GET", "DELETE", "HEAD"]) {
      const res = await handleMcp(
        new Request("https://apricotstays.in/mcp", { method }),
        env,
        deps(),
      );
      expect(res.status, method).toBe(405);
      expect(res.headers.get("Allow")).toBe("POST");
    }
  });
});

describe("list_homes", () => {
  it("lists every home with facts, rate and three photos", async () => {
    const r = await call("list_homes");
    expect(r.isError).toBe(false);
    const homes = r.structuredContent.homes;
    expect(homes).toHaveLength(4);
    expect(homes[0].photos).toHaveLength(3);
    expect(homes[0].starting_rate.note).toMatch(/confirmed on WhatsApp/);
    expect(JSON.parse(r.content[0].text)).toEqual(r.structuredContent);
  });

  it("filters by guests: only the Château sleeps four", async () => {
    const r = await call("list_homes", { guests: 4 });
    expect(r.structuredContent.homes.map((h: any) => h.slug)).toEqual(["garden-chateau"]);
    const none = await call("list_homes", { guests: 12 });
    expect(none.structuredContent.homes).toEqual([]);
    expect(none.structuredContent.note).toMatch(/sleeps 10/);
  });

  it("logs the call without personal data", async () => {
    await call("list_homes", { guests: 2 });
    expect(JSON.parse(logs[0])).toEqual({
      mcp: "list_homes",
      home: null,
      check_in: null,
      check_out: null,
      guests: 2,
    });
  });
});

describe("check_availability", () => {
  it("reports a clash over a known booking", async () => {
    const r = await call("check_availability", {
      check_in: "2026-11-14",
      check_out: "2026-11-16",
      guests: 4,
    });
    expect(r.isError).toBe(false);
    const s = r.structuredContent;
    expect(s.homes.map((h: any) => h.home)).toEqual(["garden-chateau"]);
    expect(s.too_small.map((h: any) => h.home)).toEqual([
      "garden-cottage",
      "garden-courtyard",
      "garden-care",
    ]);
    const ch = s.homes[0];
    expect(ch.available).toBe(false);
    expect(ch.booked_nights_in_range).toEqual(["2026-11-14"]);
    expect(ch.nights).toBe(2);
    expect(ch.min_stay).toMatchObject({ applies: true, met: true });
    expect(ch.calendar_updated).toBe("2026-10-23T09:00:00Z");
    expect(ch.starting_rate.amount).toBe(45_000);
    expect(decodeURIComponent(ch.booking_link)).toContain(
      "Hi, are 14–16 Nov (2 nights) free at Apricot Garden Château? We are 4 guests.",
    );
  });

  it("says available over an open week, and null where there is no calendar", async () => {
    const r = await call("check_availability", { check_in: "2026-11-16", check_out: "2026-11-19" });
    const by = Object.fromEntries(r.structuredContent.homes.map((h: any) => [h.home, h]));
    expect(by["garden-chateau"].available).toBe(true);
    expect(by["garden-cottage"].available).toBe(true);
    expect(by["garden-courtyard"].available).toBe(true);
    expect(by["garden-care"].available).toBeNull();
    expect(by["garden-care"].calendar_note).toMatch(/WhatsApp/);
    expect(by["garden-chateau"].min_stay.applies).toBe(false);
  });

  it("checks one home when asked", async () => {
    const r = await call("check_availability", {
      check_in: "2026-11-21",
      check_out: "2026-11-23",
      home: "garden-cottage",
    });
    expect(r.structuredContent.homes).toHaveLength(1);
    expect(r.structuredContent.homes[0].booked_nights_in_range).toEqual(["2026-11-21"]);
  });

  it("returns clear tool errors for bad input", async () => {
    const bad: [Record<string, unknown>, RegExp][] = [
      [{ check_in: "14 Nov", check_out: "2026-11-16" }, /YYYY-MM-DD/],
      [{ check_in: "2026-11-31", check_out: "2026-12-02" }, /YYYY-MM-DD/],
      [{ check_in: "2026-10-01", check_out: "2026-10-03" }, /past/],
      [{ check_in: "2026-11-16", check_out: "2026-11-16" }, /after check_in/],
      [{ check_in: "2026-11-01", check_out: "2027-01-15" }, /At most 60 nights/],
      [{ check_in: "2027-10-20", check_out: "2027-10-25" }, /12 months/],
      [{ check_in: "2026-11-14", check_out: "2026-11-16", home: "the-ritz" }, /Unknown home/],
      [{ check_in: "2026-11-14", check_out: "2026-11-16", guests: 2.5 }, /whole number/],
    ];
    for (const [args, msg] of bad) {
      const r = await call("check_availability", args);
      expect(r.isError, JSON.stringify(args)).toBe(true);
      expect(r.content[0].text).toMatch(msg);
    }
  });
});

describe("get_policies and get_booking_link", () => {
  it("returns per-home and shared policies", async () => {
    const r = await call("get_policies", { home: "garden-chateau" });
    const s = r.structuredContent;
    expect(s.homes).toHaveLength(1);
    expect(s.homes[0]).toMatchObject({ check_in: "3 PM", check_out: "11 AM", pets: "On request" });
    expect(s.payment.join(" ")).toMatch(/₹20,000/);
    expect(s.full_policies).toBe("https://apricotstays.in/policies");
    expect((await call("get_policies")).structuredContent.homes).toHaveLength(4);
  });

  it("builds the WhatsApp hand-off", async () => {
    const r = await call("get_booking_link", {
      home: "garden-chateau",
      check_in: "2026-11-14",
      check_out: "2026-11-16",
      guests: 4,
    });
    const s = r.structuredContent;
    expect(s.message).toBe(
      "Hi, are 14–16 Nov (2 nights) free at Apricot Garden Château? We are 4 guests.",
    );
    expect(s.whatsapp_url).toBe(`https://wa.me/919740544873?text=${encodeURIComponent(s.message)}`);
    expect(s.whatsapp_number).toBe("+91 97405 44873");
    expect(s.airbnb_url).toMatch(/^https:\/\/www\.airbnb\.co\.in\/rooms\//);
  });

  it("refuses more guests than the home sleeps", async () => {
    const r = await call("get_booking_link", {
      home: "garden-cottage",
      check_in: "2026-11-14",
      check_out: "2026-11-16",
      guests: 4,
    });
    expect(r.isError).toBe(true);
    expect(r.content[0].text).toMatch(/sleeps up to 2/);
  });
});

describe("helpers", () => {
  it("writes date spans like the page calendar", () => {
    expect(span("2026-11-14", "2026-11-16")).toBe("14–16 Nov");
    expect(span("2026-11-30", "2026-12-02")).toBe("30 Nov – 2 Dec");
    expect(bookingMessage("Apricot Garden Cottage", "2026-11-14", "2026-11-15", 1)).toBe(
      "Hi, are 14–15 Nov (1 night) free at Apricot Garden Cottage? I am 1 guest.",
    );
    expect(bookingMessage("Apricot Garden Cottage", "2026-11-14", "2026-11-15", null)).toBe(
      "Hi, are 14–15 Nov (1 night) free at Apricot Garden Cottage?",
    );
  });

  it("keeps the page calendar's message in step with the agent's", () => {
    expect(calendarSrc).toContain("const msg = `Hi, are ${span} (${nights}) free at ${name}?`;");
  });

  it("applies the weekend rule as the site words it", () => {
    // Sat 14 Nov, 1 night, far out → not met.
    expect(weekendRule("2026-11-14", "2026-11-15", TODAY)).toMatchObject({
      applies: true,
      met: false,
    });
    // Fri 23 Oct (today), 1 night → within 3 days, met.
    expect(weekendRule("2026-10-23", "2026-10-24", TODAY)).toMatchObject({
      applies: true,
      met: true,
    });
    // Mon–Wed → rule doesn't apply.
    expect(weekendRule("2026-11-16", "2026-11-18", TODAY)).toMatchObject({
      applies: false,
      met: true,
    });
    // Thu night only (checkout Fri) → no weekend night.
    expect(weekendRule("2026-11-19", "2026-11-20", TODAY).applies).toBe(false);
  });

  it("finds booked nights inside a stay", () => {
    const booked = [
      { from: "2026-11-13", to: "2026-11-15" },
      { from: "2026-11-20", to: "2026-11-22" },
    ];
    expect(clashes(booked, "2026-11-15", "2026-11-20")).toEqual([]);
    expect(clashes(booked, "2026-11-10", "2026-11-14")).toEqual(["2026-11-13"]);
    expect(clashes(booked, "2026-11-14", "2026-11-21")).toEqual(["2026-11-14", "2026-11-20"]);
  });

  it("validates dates", () => {
    expect(checkDates("2026-11-14", "2026-11-16", TODAY)).toEqual({
      checkIn: "2026-11-14",
      checkOut: "2026-11-16",
      nights: 2,
    });
    expect(() => checkDates("2026-11-14", "2026-12-14", TODAY)).not.toThrow();
  });
});

describe("worker routing for /mcp", () => {
  const ctx = { waitUntil: () => {} };

  it("serves /mcp from the Worker, reading /stays.json with a fresh GET", async () => {
    const assets = {
      fetch: vi.fn(async (req: Request) => {
        expect(req.method).toBe("GET");
        expect(new URL(req.url).pathname).toBe("/stays.json");
        return new Response(JSON.stringify(stays), { status: 200 });
      }),
    };
    vi.spyOn(console, "log").mockImplementation(() => {});
    const res = await worker.fetch(
      post({
        jsonrpc: "2.0",
        id: 7,
        method: "tools/call",
        params: { name: "list_homes", arguments: {} },
      }),
      { ...env, ASSETS: assets },
      ctx,
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    const body = (await res.json()) as any;
    expect(body.id).toBe(7);
    expect(body.result.structuredContent.homes).toHaveLength(4);
    expect(assets.fetch).toHaveBeenCalledTimes(1);
  });

  it("405s GET /mcp and reports a missing stays.json as a tool error", async () => {
    const assets = { fetch: vi.fn(async () => new Response("<h1>404</h1>", { status: 404 })) };
    const e = { ASSETS: assets };
    expect((await worker.fetch(new Request("https://a.in/mcp"), e, ctx)).status).toBe(405);
    const res = await worker.fetch(
      post({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "list_homes" } }),
      e,
      ctx,
    );
    const body = (await res.json()) as any;
    expect(res.status).toBe(200);
    expect(body.result.isError).toBe(true);
  });
});
