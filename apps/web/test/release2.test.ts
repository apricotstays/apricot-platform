import { describe, expect, it } from "vitest";
import { properties } from "@apricot/schema";
import { allAmenities, amenityGroups } from "../src/data/amenities";
import { rooms } from "../src/data/media";
import { waysToStay } from "../src/data/ways-to-stay";

const slugs = properties.map((p) => p.slug);

describe("beds", () => {
  it("states the beds for every home (all king beds, CK 21 Oct 2026)", () => {
    const by = Object.fromEntries(properties.map((p) => [p.slug, p.beds]));
    expect(by).toEqual({
      "garden-cottage": "1 king bed",
      "garden-courtyard": "1 king bed",
      "garden-chateau": "5 king beds",
      "garden-care": "1 king bed",
    });
    for (const r of rooms["garden-chateau"]) expect(r.bed, r.name).toBe("King bed");
  });
});

describe("amenities", () => {
  it("has a grouped list for every home", () => {
    for (const s of slugs) expect(amenityGroups[s]?.length, s).toBeGreaterThan(0);
  });

  it("keeps every highlight in the full list (no orphans)", () => {
    for (const p of properties) {
      const all = allAmenities(p.slug).map((a) => a.toLowerCase());
      for (const h of p.amenities) {
        const word = h.toLowerCase().split(" (")[0];
        expect(
          all.some((a) => a.includes(word) || word.includes(a.split(" (")[0])),
          `${p.slug}: ${h}`,
        ).toBe(true);
      }
    }
  });

  it("never lists duplicates or smoking", () => {
    for (const s of slugs) {
      const all = allAmenities(s);
      expect(new Set(all).size, s).toBe(all.length);
      expect(all.join(" ").toLowerCase(), s).not.toContain("smoking");
    }
  });

  it("gives the Cottage its full Airbnb list (39)", () => {
    expect(allAmenities("garden-cottage")).toHaveLength(39);
  });
});

describe("ways to stay", () => {
  it("leads with the Cottage and Courtyard, then the Château, then Care (CK)", () => {
    expect(waysToStay.map((w) => w.homes)).toEqual([
      ["garden-cottage", "garden-courtyard"],
      ["garden-chateau"],
      ["garden-care"],
    ]);
  });

  it("only points at real homes and has unique slugs", () => {
    for (const w of waysToStay) for (const h of w.homes) expect(slugs, w.slug).toContain(h);
    expect(new Set(waysToStay.map((w) => w.slug)).size).toBe(waysToStay.length);
  });
});

describe("amenity depth (CK confirmed extras, 21 Oct 2026)", () => {
  it("lists 20+ amenities at every home", () => {
    const counts = Object.fromEntries(properties.map((p) => [p.slug, allAmenities(p.slug).length]));
    expect(counts).toEqual({
      "garden-cottage": 39,
      "garden-courtyard": 20,
      "garden-chateau": 25,
      "garden-care": 21,
    });
  });
});

describe("garden promise (option A, CK 21 Oct 2026)", () => {
  it("names the promise and gives every home its private garden line", async () => {
    const { promise } = await import("@apricot/brand");
    expect(promise.name).toBe("A garden of your own");
    for (const p of properties) expect(p.garden, p.slug).toMatch(/^Private /);
  });
});

describe("photo tour (design review round 2, item 12)", () => {
  it("puts every gallery photo in exactly one group", async () => {
    const { galleries, photoTour } = await import("../src/data/media");
    for (const [slug, gallery] of Object.entries(galleries)) {
      const tour = photoTour[slug];
      expect(tour, slug).toBeDefined();
      const all = tour.flatMap((g) => g.photos);
      expect(all.length, slug).toBe(gallery.length);
      for (const ph of gallery) expect(all.filter((x) => x === ph).length, slug).toBe(1);
    }
  });
});
