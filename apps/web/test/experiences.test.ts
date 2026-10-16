import { describe, expect, it, vi } from "vitest";
import {
  findPlaceholders,
  groupBySection,
  parseOptions,
  parseRupees,
  parseSteps,
  priceLine,
  selectListings,
  slugify,
  toListing,
  type ListingRow,
} from "../src/experiences/core";
import { fetchRows, fetchSectionOrder, pageToRow } from "../src/experiences/notion";
import snapshot from "../src/experiences/snapshot.json";

const row = (over: Partial<ListingRow> = {}): ListingRow => ({
  name: "Car wash at your door",
  kind: "Service",
  slug: "car-wash",
  section: "At your door",
  photos: [],
  photoCredit: "",
  badge: "",
  description: "Washed in the driveway.",
  where: "Your home",
  duration: "30 min",
  steps: "",
  included: "Supplies\nWater-saving wash",
  thingsToKnow: "When — 8 am to 6 pm",
  priceFrom: 499,
  unit: "car",
  priceNote: "",
  showPrice: true,
  options: "Exterior wash | 30 min | 499",
  cancellation: "Free until the night before.",
  status: "Live",
  order: 1,
  leadTime: "Book 1 day before",
  whatsappText: "Hi, a car wash please.",
  ...over,
});

describe("text parsing", () => {
  it("splits steps on em dash, en dash or hyphen", () => {
    expect(parseSteps("Pickup — At your door\nHills – Tea stop\nHome - Bed\nJust a title")).toEqual(
      [
        { title: "Pickup", text: "At your door" },
        { title: "Hills", text: "Tea stop" },
        { title: "Home", text: "Bed" },
        { title: "Just a title", text: "" },
      ],
    );
  });

  it("parses options and rupee prices", () => {
    expect(parseOptions("Exterior | 30 min | ₹1,200\n\nInside | 60 min | [price]\nPlain")).toEqual([
      { name: "Exterior", duration: "30 min", price: 1200 },
      { name: "Inside", duration: "60 min", price: null },
      { name: "Plain", duration: "", price: null },
    ]);
    expect(parseRupees("Rs 300")).toBe(300);
    expect(parseRupees("")).toBeNull();
  });

  it("formats the price line, or asks on WhatsApp", () => {
    expect(priceLine({ showPrice: true, priceFrom: 1499, unit: "car" })).toBe("From ₹1,499 / car");
    expect(priceLine({ showPrice: false, priceFrom: 1499, unit: "car" })).toBe("Price on WhatsApp");
    expect(priceLine({ showPrice: true, priceFrom: null, unit: "car" })).toBe("Price on WhatsApp");
  });

  it("slugifies titles", () => {
    expect(slugify("Tasting menu at NAAR, Kasauli: we drive")).toBe(
      "tasting-menu-at-naar-kasauli-we-drive",
    );
    expect(slugify("Château")).toBe("chateau");
  });

  it("finds unfilled placeholders", () => {
    expect(findPlaceholders(["Lunch [TIME], dinner [TIME]", "FSSAI [NUMBER]"])).toEqual([
      "[TIME]",
      "[NUMBER]",
    ]);
  });

  it("ignores option prices when prices are hidden", () => {
    const l = toListing(row({ showPrice: false, options: "Exterior | 30 min | [price]" }));
    expect(l?.placeholders).toEqual([]);
    const shown = toListing(row({ showPrice: true, options: "Exterior | 30 min | [price]" }));
    expect(shown?.placeholders).toEqual(["[price]"]);
  });
});

describe("selectListings", () => {
  const rows = [
    row(),
    row({ name: "Tiffin", slug: "tiffin", status: "Draft", order: 2 }),
    row({ name: "Paused thing", slug: "paused", status: "Paused" }),
    row({ name: "Half done", slug: "half", thingsToKnow: "When — [HOURS]" }),
    row({ name: "Copy", slug: "car-wash", order: 5 }),
    row({ name: "" }),
  ];

  it("production: Live and complete only", () => {
    const { listings, skipped } = selectListings(rows, false);
    expect(listings.map((l) => l.slug)).toEqual(["car-wash"]);
    expect(skipped.join("\n")).toMatch(/Half done: Live but still has \[HOURS\]/);
    expect(skipped.join("\n")).toMatch(/Copy: duplicate/);
  });

  it("previews: drafts and placeholders allowed, paused still hidden", () => {
    const { listings } = selectListings(rows, true);
    expect(listings.map((l) => l.slug)).toEqual(["car-wash", "half", "tiffin"]);
  });

  it("groups by section in the fixed order", () => {
    const { listings } = selectListings(
      [
        row({ name: "NAAR", slug: "naar", section: "Day trips", kind: "Experience" }),
        row({ name: "Other", slug: "other", section: "Zzz" }),
        row(),
      ],
      false,
    );
    expect(groupBySection(listings).map((g) => g.title)).toEqual([
      "At your door",
      "Day trips",
      "Zzz",
    ]);
  });

  it("follows a section order from Notion, unknown sections last", () => {
    const { listings } = selectListings(
      [
        row(),
        row({ name: "NAAR", slug: "naar", section: "Day trips", kind: "Experience" }),
        row({ name: "Other", slug: "other", section: "Zzz" }),
      ],
      false,
      ["Day trips", "At your door"],
    );
    expect(groupBySection(listings, ["Day trips", "At your door"]).map((g) => g.title)).toEqual([
      "Day trips",
      "At your door",
      "Zzz",
    ]);
  });

  it("the committed snapshot builds three preview pages and nothing public yet", () => {
    expect(selectListings(snapshot as ListingRow[], true).listings.map((l) => l.slug)).toEqual([
      "car-wash",
      "tiffin",
      "naar-kasauli",
    ]);
    expect(selectListings(snapshot as ListingRow[], false).listings).toEqual([]);
  });
});

describe("Notion", () => {
  const rt = (s: string) => ({ type: "rich_text", rich_text: [{ plain_text: s }] });
  const page = (name: string) => ({
    properties: {
      Name: { type: "title", title: [{ plain_text: name }] },
      Kind: { type: "select", select: { name: "Experience" } },
      Status: { type: "select", select: { name: "Live" } },
      "Price from": { type: "number", number: 2500 },
      "Show price": { type: "checkbox", checkbox: true },
      Steps: { type: "rich_text", rich_text: [{ plain_text: "A — b\n" }, { plain_text: "C — d" }] },
      Photos: {
        type: "files",
        files: [{ type: "file", name: "a.jpg", file: { url: "https://x.s3.amazonaws.com/a.jpg" } }],
      },
      "Internal notes": rt("vendor phone 98765"),
    },
  });

  it("flattens a page and never reads Internal notes", () => {
    const r = pageToRow(page("NAAR"));
    expect(r).toMatchObject({
      name: "NAAR",
      kind: "Experience",
      status: "Live",
      priceFrom: 2500,
      showPrice: true,
      steps: "A — b\nC — d",
      photos: [{ name: "a.jpg", url: "https://x.s3.amazonaws.com/a.jpg" }],
      section: "",
    });
    expect(JSON.stringify(r)).not.toContain("98765");
  });

  it("follows pagination and sends the token", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ results: [page("One")], has_more: true, next_cursor: "c2" })),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ results: [page("Two")], has_more: false, next_cursor: null }),
        ),
      );
    const rows = await fetchRows("secret_t", "db1", fetchMock as unknown as typeof fetch);
    expect(rows.map((r) => r.name)).toEqual(["One", "Two"]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toBe("https://api.notion.com/v1/databases/db1/query");
    expect(init.headers.Authorization).toBe("Bearer secret_t");
    expect(JSON.parse(init.body)).toEqual({ page_size: 100, start_cursor: "c2" });
  });

  it("reads the Section option order from the database schema", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          properties: {
            Section: {
              type: "select",
              select: { options: [{ name: "Day trips" }, { name: "At your door" }] },
            },
          },
        }),
      ),
    );
    expect(await fetchSectionOrder("t", "db1", fetchMock as unknown as typeof fetch)).toEqual([
      "Day trips",
      "At your door",
    ]);
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.notion.com/v1/databases/db1");
    const noSection = vi.fn().mockResolvedValue(new Response(JSON.stringify({ properties: {} })));
    expect(await fetchSectionOrder("t", "db1", noSection as unknown as typeof fetch)).toEqual([]);
  });

  it("throws on API errors (the loader then falls back to the snapshot)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("nope", { status: 401 }));
    await expect(fetchRows("bad", "db1", fetchMock as unknown as typeof fetch)).rejects.toThrow(
      /Notion API 401/,
    );
  });
});
