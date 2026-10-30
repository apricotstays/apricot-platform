import { describe, expect, it } from "vitest";
import page from "../src/pages/shoots.astro?raw";
import sitemap from "../src/pages/sitemap.xml.ts?raw";
import llms from "../src/pages/llms.txt.ts?raw";
import { properties } from "@apricot/schema";
import { chateauSpaces, shootHomes, shootWhatsapp } from "../src/data/shoots";

// Shoots V1 (CK, 30 Oct 2026): soft launch until the society NOC is in hand.
describe("shoots page", () => {
  it("covers all four homes, Château first as the set", () => {
    expect(shootHomes.map((h) => h.slug).sort()).toEqual(properties.map((p) => p.slug).sort());
    expect(shootHomes[0].slug).toBe("garden-chateau");
  });

  it("stays soft-launched: noindex and out of the sitemap and llms.txt", () => {
    expect(page).toMatch(/const SOFT_LAUNCH = true/);
    for (const [f, src] of Object.entries({ sitemap, llms })) {
      expect(src, f).not.toMatch(/\/shoots/);
    }
  });

  it("asks for project, dates and crew size, with no prices", () => {
    expect(shootWhatsapp).toMatch(/Dates:/);
    expect(shootWhatsapp).toMatch(/Crew size/);
    expect(shootWhatsapp).not.toMatch(/₹/);
    expect(chateauSpaces.length).toBe(6);
  });
});
