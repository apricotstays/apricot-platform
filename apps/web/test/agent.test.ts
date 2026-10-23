import { describe, expect, it } from "vitest";
import { contact } from "@apricot/brand";
import { properties } from "@apricot/schema";
import { buildLlmsFull, buildStays, parseBeds, type ResolvedMedia } from "../src/data/agent";
import { faq, houseRules, paymentLines } from "../src/data/policies";

const media: ResolvedMedia = {
  photos: Object.fromEntries(
    properties.map((p) => [
      p.slug,
      [
        { url: `https://apricotstays.in/_astro/${p.slug}-1.webp`, caption: `${p.name} cover` },
        { url: `https://apricotstays.in/_astro/${p.slug}-2.webp`, caption: `${p.name} inside` },
      ],
    ]),
  ),
  rooms: {
    "garden-chateau": [
      {
        name: "Chenab Suite",
        bed: "King bed",
        palette: "Indigo and silver",
        photo: { url: "https://apricotstays.in/_astro/chenab.webp", caption: "Chenab Suite" },
      },
    ],
  },
};
const generated = new Date("2026-10-23T10:00:00.123Z");
const stays = buildStays(media, generated);
const by = Object.fromEntries(stays.homes.map((h) => [h.slug, h]));

describe("/stays.json", () => {
  it("lists all four homes in site order, with the build time", () => {
    expect(stays.homes.map((h) => h.slug)).toEqual(properties.map((p) => p.slug));
    expect(stays.generated).toBe("2026-10-23T10:00:00Z");
  });

  it("carries each home's facts, rate and policy from packages/schema", () => {
    for (const p of properties) {
      const h = by[p.slug];
      expect(h.name).toBe(p.name);
      expect(h.maxGuests).toBe(p.maxGuests);
      expect(h.beds).toBe(p.beds);
      expect(h.url).toBe(`https://apricotstays.in/stays/${p.slug}`);
      expect(h.startingRate).toMatchObject({
        amount: p.fromPerNight,
        currency: "INR",
        basis: "starting weekday rate",
        checked: "Oct 2026",
      });
      expect(h.startingRate.note).toMatch(/confirmed on WhatsApp/);
      expect(h.policy.checkIn).toBe(p.policy.checkIn);
      expect(h.policy.cancellation).toEqual([...p.policy.cancellation]);
      expect(h.policy.minStayRule).toMatch(/Within 3 days of arrival/);
      expect(h.amenities.groups.length, p.slug).toBeGreaterThan(0);
      expect(h.photos).toEqual(media.photos[p.slug]);
      expect(h.links.whatsapp.startsWith("https://wa.me/919740544873?text=")).toBe(true);
      expect(h.links.availability).toBe(`https://apricotstays.in/api/availability?home=${p.slug}`);
    }
  });

  it("keeps ratings as Airbnb text, null where Airbnb shows none", () => {
    expect(by["garden-cottage"].reviews).toMatchObject({ source: "Airbnb", rating: "4.98" });
    expect(by["garden-care"].reviews).toMatchObject({ rating: null, count: 2 });
    expect(by["garden-chateau"].reviews).toMatchObject({ rating: null, count: null, isNew: true });
    // Château quotes are borrowed from the Courtyard and must say so.
    for (const q of by["garden-chateau"].reviews.quotes)
      expect(q.stayedAt).toBe("Garden Courtyard");
    for (const q of by["garden-cottage"].reviews.quotes) expect(q.stayedAt).toBeNull();
  });

  it("gives the Château its named rooms and the others none", () => {
    expect(by["garden-chateau"].rooms.map((r) => r.name)).toEqual(["Chenab Suite"]);
    expect(by["garden-cottage"].rooms).toEqual([]);
  });

  it("carries the shared policies, FAQ and agent pointers", () => {
    expect(stays.policies.payment).toEqual([...paymentLines]);
    expect(stays.policies.houseRules).toEqual([...houseRules]);
    expect(stays.policies.faq.flatMap((g) => g.items).length).toBe(
      faq.flatMap((g) => g.items).length,
    );
    expect(stays.agents).toMatchObject({
      stays: "https://apricotstays.in/stays.json",
      llmsFull: "https://apricotstays.in/llms-full.txt",
      mcp: "https://apricotstays.in/mcp",
    });
    expect(stays.contact.whatsapp).toBe(contact.whatsappE164);
  });

  it("is plain JSON (no undefined, round-trips)", () => {
    expect(JSON.parse(JSON.stringify(stays))).toEqual(stays);
    expect(JSON.stringify(stays)).not.toMatch(/undefined/);
  });
});

describe("/policies data (moved from the page, text unchanged)", () => {
  it("pins the payment lines, house rules and FAQ", () => {
    expect(paymentLines).toHaveLength(3);
    expect(paymentLines[0]).toMatch(/^50% by UPI or bank transfer confirms your booking/);
    expect(paymentLines[2]).toMatch(/security deposit of ₹20,000/);
    expect(houseRules).toHaveLength(8);
    expect(houseRules[2]).toBe("Quiet hours are 10 PM – 7 AM, with no music outdoors after 10 PM.");
    expect(faq.map((g) => [g.group, g.items.length])).toEqual([
      ["Before your stay", 4],
      ["During your stay", 3],
      ["After your stay", 1],
      ["About Apricot", 1],
    ]);
  });
});

describe("/llms-full.txt", () => {
  const text = buildLlmsFull(stays);

  it("covers every home in full", () => {
    for (const p of properties) {
      expect(text).toContain(`## ${p.name}`);
      expect(text).toContain(`From ₹${p.fromPerNight.toLocaleString("en-IN")} / night`);
    }
    expect(text).toContain("Chenab Suite: king bed");
    expect(text).toContain("(stayed at Garden Courtyard)");
    expect(text).toContain("New home: no Airbnb reviews of its own yet");
  });

  it("documents the agent endpoints", () => {
    expect(text).toContain("## For agents");
    expect(text).toContain("https://apricotstays.in/stays.json");
    expect(text).toContain("https://apricotstays.in/api/availability?home={slug}");
    expect(text).toContain("https://apricotstays.in/mcp");
  });
});

describe("JSON-LD beds", () => {
  it("parses the beds line", () => {
    expect(parseBeds("1 king bed")).toEqual({ type: "King", count: 1 });
    expect(parseBeds("5 king beds")).toEqual({ type: "King", count: 5 });
    expect(() => parseBeds("a big bed")).toThrow();
    for (const p of properties) expect(() => parseBeds(p.beds)).not.toThrow();
  });
});
