/**
 * POST /mcp — a read-only MCP server for AI agents (roadmap 4.7, first slice).
 *
 * Transport: MCP Streamable HTTP, stateless, plain JSON replies (no SSE), as Claude's connectors
 * speak it (revisions 2025-03-26, 2025-06-18, 2025-11-25). No sign-in: it serves only what the
 * public site shows. Home facts come from /stays.json (read through the ASSETS binding); booked
 * dates come from the same code and cache as /api/availability, so an agent sees exactly what
 * the page calendar shows. Nothing is stored; logs carry tool, home, dates and guest count only.
 *
 * Bundle rule: never import images, src/data/media.ts or astro:* here (type imports are fine).
 */
import { contact } from "@apricot/brand";
import type { Stays } from "../data/agent";
import {
  handleAvailability,
  todayIST,
  type Availability,
  type Deps,
  type Env,
} from "./availability";
import { addDays, toIsoDate } from "./ical";

export const SUPPORTED_VERSIONS = ["2025-11-25", "2025-06-18", "2025-03-26"] as const;
export const SERVER_INFO = { name: "apricot-stays", title: "Apricot Stays", version: "1.0.0" };
export const MAX_NIGHTS = 60;

const INSTRUCTIONS =
  "Apricot Stays: four boutique homes with private gardens at DLF Hyde Park, New Chandigarh, India. " +
  "Use list_homes to see the homes, check_availability for dates and guests (from the live Airbnb " +
  "calendars, at most 1 hour old), get_policies for terms, and get_booking_link for a pre-filled " +
  "WhatsApp message the guest can send. Rates are starting weekday rates, not quotes: the exact " +
  "total is confirmed on WhatsApp, and nothing is booked until the team confirms there.";

export const RATE_NOTE = "Starting weekday rate; the exact price is confirmed on WhatsApp.";
export const BOOKING_NOTE = "Nothing is booked until we confirm on WhatsApp.";

type Json = Record<string, unknown>;
type Home = Stays["homes"][number];

/** A tool input problem: reported to the agent as a tool error (isError), never a 500. */
class InputError extends Error {}

// ---------------------------------------------------------------------------------------------
// Tool definitions

const DATE = { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" } as const;
const homeProp = (slugs: readonly string[], required: boolean) => ({
  type: "string",
  enum: [...slugs],
  description: required
    ? "Home slug, from list_homes."
    : "Home slug, from list_homes. Omit for all homes.",
});
const guestsProp = (description: string) => ({
  type: "integer",
  minimum: 1,
  maximum: 50,
  description,
});
const readOnly = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

export function toolDefinitions(slugs: readonly string[]) {
  return [
    {
      name: "list_homes",
      title: "List Apricot homes",
      description:
        "List the Apricot Stays homes in DLF Hyde Park, New Chandigarh, optionally only those that sleep a given number of guests. Returns each home's slug, guests, bedrooms, beds, garden, starting weekday rate in INR, three photo URLs and page link. Use the slug with the other tools.",
      inputSchema: {
        type: "object",
        properties: { guests: guestsProp("Only homes that sleep at least this many guests.") },
        additionalProperties: false,
      },
      annotations: { title: "List Apricot homes", ...readOnly },
    },
    {
      name: "check_availability",
      title: "Check availability",
      description: `Check whether homes are free for a stay, from each home's live Airbnb calendar (at most 1 hour old). Dates are YYYY-MM-DD in India time; check_out is the departure day. Up to ${MAX_NIGHTS} nights, within the next 12 months. Returns per home: available yes/no, nights, any clashing booked nights, the weekend minimum-stay note, when the calendar was read, the starting rate and a WhatsApp booking link. Homes too small for the guest count are listed separately. Availability is not a hold: nothing is booked until the team confirms on WhatsApp.`,
      inputSchema: {
        type: "object",
        properties: {
          check_in: { ...DATE, description: "Arrival date, YYYY-MM-DD." },
          check_out: { ...DATE, description: "Departure date, YYYY-MM-DD (after check_in)." },
          guests: guestsProp("Number of guests. Homes that sleep fewer are left out."),
          home: homeProp(slugs, false),
        },
        required: ["check_in", "check_out"],
        additionalProperties: false,
      },
      annotations: { title: "Check availability", ...readOnly, openWorldHint: true },
    },
    {
      name: "get_policies",
      title: "Get stay policies",
      description:
        "Stay policies for one home or all: check-in and checkout times, pets, minimum stay, cancellation terms and house rules; plus payment terms (including the Garden Château's security deposit) and the FAQ, with a link to the full policies page.",
      inputSchema: {
        type: "object",
        properties: { home: homeProp(slugs, false) },
        additionalProperties: false,
      },
      annotations: { title: "Get stay policies", ...readOnly },
    },
    {
      name: "get_booking_link",
      title: "Get a WhatsApp booking link",
      description:
        "A WhatsApp link (wa.me) to the Apricot Stays team with a pre-filled message naming the home, dates, nights and guests, for the guest to tap and send. Also returns the number and message as text and the home's Airbnb listing as an alternative. Booking happens on WhatsApp; nothing is booked until the team confirms.",
      inputSchema: {
        type: "object",
        properties: {
          home: homeProp(slugs, true),
          check_in: { ...DATE, description: "Arrival date, YYYY-MM-DD." },
          check_out: { ...DATE, description: "Departure date, YYYY-MM-DD (after check_in)." },
          guests: guestsProp("Number of guests."),
        },
        required: ["home", "check_in", "check_out", "guests"],
        additionalProperties: false,
      },
      annotations: { title: "Get a WhatsApp booking link", ...readOnly },
    },
  ];
}

// ---------------------------------------------------------------------------------------------
// Dates, the weekend rule and the booking message

const MON = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");
const DAY_MS = 86_400_000;
const parts = (iso: string) => {
  const d = new Date(`${iso}T00:00:00Z`);
  return { day: d.getUTCDate(), month: d.getUTCMonth(), weekday: d.getUTCDay() };
};
const fmt = (iso: string) => `${parts(iso).day} ${MON[parts(iso).month]}`;
export const nightsBetween = (a: string, b: string) =>
  Math.round((Date.parse(b) - Date.parse(a)) / DAY_MS);

/** "14–16 Nov" or "30 Nov – 2 Dec", as the page calendar writes it. */
export function span(checkIn: string, checkOut: string): string {
  return parts(checkIn).month === parts(checkOut).month
    ? `${parts(checkIn).day}–${fmt(checkOut)}`
    : `${fmt(checkIn)} – ${fmt(checkOut)}`;
}

const nightsLabel = (n: number) => `${n} night${n === 1 ? "" : "s"}`;

/**
 * The calendar's WhatsApp message (AvailabilityCalendar.astro) plus the guest count:
 * "Hi, are 14–16 Nov (2 nights) free at Apricot Garden Château? We are 4 guests."
 */
export function bookingMessage(
  name: string,
  checkIn: string,
  checkOut: string,
  guests: number | null,
) {
  const n = nightsBetween(checkIn, checkOut);
  const who = guests === null ? "" : guests === 1 ? " I am 1 guest." : ` We are ${guests} guests.`;
  return `Hi, are ${span(checkIn, checkOut)} (${nightsLabel(n)}) free at ${name}?${who}`;
}

/**
 * Weekend rule (CK, 20 Oct 2026): 2 nights if the stay includes a Friday or Saturday night;
 * within 3 days of arrival, 1 night is fine. Reported as a note, never used to hide a home.
 */
export function weekendRule(checkIn: string, checkOut: string, today: string) {
  const n = nightsBetween(checkIn, checkOut);
  const weekendNight = Array.from({ length: n }, (_, i) => addDays(checkIn, i)).some((d) =>
    [5, 6].includes(parts(d).weekday),
  );
  const lastMinute = nightsBetween(today, checkIn) <= 3;
  const met = !weekendNight || n >= 2 || lastMinute;
  const note = !weekendNight
    ? "No Friday or Saturday night: 1 night is fine."
    : n >= 2
      ? "Includes a Friday or Saturday night: the 2-night weekend minimum is met."
      : lastMinute
        ? "Includes a Friday or Saturday night, but check-in is within 3 days, so 1 night is fine."
        : "Includes a Friday or Saturday night: weekend stays need 2 nights (1 night is fine within 3 days of arrival). Ask on WhatsApp.";
  return { applies: weekendNight, met, note };
}

/** "2026-11-14" → "2026-11-14" if it is a real calendar date, else null. */
const isoDate = (v: unknown): string | null =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? toIsoDate(v.replace(/-/g, "")) : null;

/** Validates a stay's dates; throws InputError with a sentence the agent can act on. */
export function checkDates(checkIn: unknown, checkOut: unknown, today: string) {
  const ci = isoDate(checkIn);
  const co = isoDate(checkOut);
  if (!ci) throw new InputError("check_in must be a date as YYYY-MM-DD.");
  if (!co) throw new InputError("check_out must be a date as YYYY-MM-DD.");
  if (ci < today) throw new InputError(`check_in is in the past (today in India is ${today}).`);
  if (co <= ci) throw new InputError("check_out must be after check_in.");
  const nights = nightsBetween(ci, co);
  if (nights > MAX_NIGHTS)
    throw new InputError(
      `At most ${MAX_NIGHTS} nights per request; ask on WhatsApp for longer stays.`,
    );
  const through = addDays(today, 365);
  if (co > through)
    throw new InputError(`The calendars cover the next 12 months only (check-out by ${through}).`);
  return { checkIn: ci, checkOut: co, nights };
}

function checkGuests(v: unknown, required: boolean): number | null {
  if (v === undefined || v === null) {
    if (required) throw new InputError("guests is required (a whole number, 1 or more).");
    return null;
  }
  if (typeof v !== "number" || !Number.isInteger(v) || v < 1 || v > 50)
    throw new InputError("guests must be a whole number from 1 to 50.");
  return v;
}

function pickHome(stays: Stays, v: unknown, required: boolean): Home | null {
  if (v === undefined || v === null || v === "") {
    if (required) throw new InputError("home is required (a slug from list_homes).");
    return null;
  }
  const h = stays.homes.find((x) => x.slug === v);
  if (!h)
    throw new InputError(
      `Unknown home "${String(v)}". Use one of: ${stays.homes.map((x) => x.slug).join(", ")}.`,
    );
  return h;
}

/** Booked nights inside [checkIn, checkOut). Ranges are { from: first night, to: checkout day }. */
export function clashes(
  booked: Availability["booked"],
  checkIn: string,
  checkOut: string,
): string[] {
  const out: string[] = [];
  for (const r of booked) {
    if (r.from >= checkOut || r.to <= checkIn) continue;
    for (let d = r.from < checkIn ? checkIn : r.from; d < r.to && d < checkOut; d = addDays(d, 1))
      out.push(d);
  }
  return [...new Set(out)].sort();
}

// ---------------------------------------------------------------------------------------------
// Tools

export interface McpDeps extends Deps {
  /** /stays.json, read through the ASSETS binding. */
  stays: () => Promise<Stays>;
  log: (line: string) => void;
}

const rate = (h: Home) => ({
  amount: h.startingRate.amount,
  currency: h.startingRate.currency,
  label: h.startingRate.label,
  basis: h.startingRate.basis,
  checked: h.startingRate.checked,
  note: RATE_NOTE,
});

const whatsappLink = (text: string) => contact.whatsappLink(text);

function listHomes(stays: Stays, args: Json) {
  const guests = checkGuests(args.guests, false);
  const homes = stays.homes
    .filter((h) => guests === null || h.maxGuests >= guests)
    .map((h) => ({
      slug: h.slug,
      name: h.name,
      summary: h.summary,
      locality: h.locality,
      max_guests: h.maxGuests,
      bedrooms: h.bedrooms,
      bathrooms: h.bathrooms,
      beds: h.beds,
      garden: h.garden,
      starting_rate: rate(h),
      airbnb_rating: h.reviews.rating,
      photos: h.photos.slice(0, 3).map((p) => p.url),
      url: h.url,
    }));
  return {
    guests,
    homes,
    note:
      homes.length === 0
        ? `No single home sleeps ${guests}. The largest, ${stays.homes.reduce((a, b) => (b.maxGuests > a.maxGuests ? b : a)).name}, sleeps ${Math.max(...stays.homes.map((h) => h.maxGuests))}. Ask on WhatsApp about booking more than one home.`
        : `${RATE_NOTE} ${BOOKING_NOTE}`,
  };
}

async function readCalendar(home: Home, origin: string, env: Env, deps: McpDeps) {
  const res = await handleAvailability(
    new URL(`/api/availability?home=${home.slug}`, origin),
    env,
    deps,
  );
  if (!res.ok) return null;
  return (await res.json()) as Availability;
}

async function checkAvailability(
  stays: Stays,
  args: Json,
  origin: string,
  env: Env,
  deps: McpDeps,
) {
  const today = todayIST(deps.now());
  const { checkIn, checkOut, nights } = checkDates(args.check_in, args.check_out, today);
  const guests = checkGuests(args.guests, false);
  const one = pickHome(stays, args.home, false);
  const candidates = one ? [one] : stays.homes;
  const fits = candidates.filter((h) => guests === null || h.maxGuests >= guests);
  const tooSmall = candidates
    .filter((h) => !fits.includes(h))
    .map((h) => ({ home: h.slug, name: h.name, max_guests: h.maxGuests }));
  const minStay = weekendRule(checkIn, checkOut, today);

  const homes = await Promise.all(
    fits.map(async (h) => {
      const cal = await readCalendar(h, origin, env, deps);
      const clash = cal ? clashes(cal.booked, checkIn, checkOut) : [];
      const message = bookingMessage(h.name, checkIn, checkOut, guests);
      return {
        home: h.slug,
        name: h.name,
        max_guests: h.maxGuests,
        available: cal ? clash.length === 0 : null,
        ...(cal
          ? {}
          : { calendar_note: "This home's calendar can't be read right now: ask on WhatsApp." }),
        nights,
        booked_nights_in_range: clash,
        min_stay: minStay,
        calendar_updated: cal?.updated ?? null,
        starting_rate: rate(h),
        booking_link: whatsappLink(message),
        url: h.url,
      };
    }),
  );
  return {
    check_in: checkIn,
    check_out: checkOut,
    nights,
    guests,
    homes,
    too_small: tooSmall,
    note: `Calendars are at most 1 hour old. Availability is not a hold. ${BOOKING_NOTE} ${RATE_NOTE}`,
  };
}

function getPolicies(stays: Stays, args: Json) {
  const one = pickHome(stays, args.home, false);
  return {
    homes: (one ? [one] : stays.homes).map((h) => ({
      home: h.slug,
      name: h.name,
      check_in: h.policy.checkIn,
      check_out: h.policy.checkOut,
      pets: h.policy.pets,
      min_stay: h.policy.minStayRule,
      free_cancellation: h.policy.freeCancellation,
      cancellation: h.policy.cancellation,
      house_rules: h.policy.rules,
    })),
    payment: stays.policies.payment,
    house_rules_all_homes: stays.policies.houseRules,
    faq: stays.policies.faq,
    updated: stays.policies.updated,
    full_policies: stays.policies.page,
  };
}

function getBookingLink(stays: Stays, args: Json, deps: McpDeps) {
  const h = pickHome(stays, args.home, true)!;
  const today = todayIST(deps.now());
  const { checkIn, checkOut, nights } = checkDates(args.check_in, args.check_out, today);
  const guests = checkGuests(args.guests, true)!;
  if (guests > h.maxGuests)
    throw new InputError(
      `${h.name} sleeps up to ${h.maxGuests} guests; use list_homes to find a larger home.`,
    );
  const message = bookingMessage(h.name, checkIn, checkOut, guests);
  return {
    home: h.slug,
    name: h.name,
    check_in: checkIn,
    check_out: checkOut,
    nights,
    guests,
    whatsapp_url: whatsappLink(message),
    whatsapp_number: stays.contact.whatsappDisplay,
    message,
    airbnb_url: h.links.airbnb,
    note: `The guest taps the link and sends the message. ${BOOKING_NOTE}`,
  };
}

// ---------------------------------------------------------------------------------------------
// JSON-RPC over Streamable HTTP

const HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "Access-Control-Allow-Origin": "*",
};

const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: HEADERS });
const rpcError = (id: unknown, code: number, message: string, status = 200) =>
  reply({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }, status);
const rpcResult = (id: unknown, result: unknown) => reply({ jsonrpc: "2.0", id, result });

function toolResult(data: Json) {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    structuredContent: data,
    isError: false,
  };
}

export async function handleMcp(request: Request, env: Env, deps: McpDeps): Promise<Response> {
  if (request.method !== "POST") {
    const res = rpcError(null, -32000, "Method not allowed: this MCP server takes POST only.", 405);
    res.headers.set("Allow", "POST");
    return res;
  }

  let msg: unknown;
  try {
    msg = JSON.parse(await request.text());
  } catch {
    return rpcError(null, -32700, "Parse error: body is not valid JSON.", 400);
  }
  if (Array.isArray(msg)) return rpcError(null, -32600, "Batch requests are not supported.", 400);
  if (!msg || typeof msg !== "object" || (msg as Json).jsonrpc !== "2.0")
    return rpcError(null, -32600, "Invalid request: expected a JSON-RPC 2.0 object.", 400);

  const { id, method, params } = msg as { id?: unknown; method?: unknown; params?: Json };
  // Notifications (and responses) carry no id: accept and move on.
  if (id === undefined || typeof method !== "string")
    return new Response(null, { status: 202, headers: { "Cache-Control": "no-store" } });

  switch (method) {
    case "initialize": {
      const asked = typeof params?.protocolVersion === "string" ? params.protocolVersion : "";
      const protocolVersion = (SUPPORTED_VERSIONS as readonly string[]).includes(asked)
        ? asked
        : SUPPORTED_VERSIONS[0];
      return rpcResult(id, {
        protocolVersion,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions: INSTRUCTIONS,
      });
    }
    case "ping":
      return rpcResult(id, {});
    case "tools/list": {
      const stays = await deps.stays();
      return rpcResult(id, { tools: toolDefinitions(stays.homes.map((h) => h.slug)) });
    }
    case "tools/call": {
      const name = params?.name;
      const args = (params?.arguments ?? {}) as Json;
      const known = ["list_homes", "check_availability", "get_policies", "get_booking_link"];
      if (typeof name !== "string" || !known.includes(name))
        return rpcError(id, -32602, `Unknown tool: ${String(name)}`);
      if (typeof args !== "object" || Array.isArray(args))
        return rpcError(id, -32602, "Tool arguments must be an object.");
      deps.log(
        JSON.stringify({
          mcp: name,
          home: typeof args.home === "string" ? args.home : null,
          check_in: typeof args.check_in === "string" ? args.check_in : null,
          check_out: typeof args.check_out === "string" ? args.check_out : null,
          guests: typeof args.guests === "number" ? args.guests : null,
        }),
      );
      try {
        const stays = await deps.stays();
        const origin = new URL(request.url).origin;
        const data =
          name === "list_homes"
            ? listHomes(stays, args)
            : name === "check_availability"
              ? await checkAvailability(stays, args, origin, env, deps)
              : name === "get_policies"
                ? getPolicies(stays, args)
                : getBookingLink(stays, args, deps);
        return rpcResult(id, toolResult(data));
      } catch (err) {
        const text =
          err instanceof InputError
            ? err.message
            : "Something went wrong reading the homes. Please try again, or ask on WhatsApp.";
        if (!(err instanceof InputError))
          console.warn(`mcp: ${name} failed (${(err as Error).message})`);
        return rpcResult(id, { content: [{ type: "text", text }], isError: true });
      }
    }
    default:
      return rpcError(id, -32601, `Method not found: ${method}`);
  }
}
