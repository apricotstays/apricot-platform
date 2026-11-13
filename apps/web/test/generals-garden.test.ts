import { describe, expect, it } from "vitest";

// The General's Garden is UNLISTED (CK, Nov 2026): shared only by direct link.
// It must stay noindex and must not be linked or listed anywhere else on the site.
const sources = import.meta.glob<string>("../src/**/*.{astro,ts,md,json}", {
  query: "?raw",
  import: "default",
  eager: true,
});
const pagePath = "../src/pages/generals-garden.astro";
const page = sources[pagePath] ?? "";

describe("/generals-garden (unlisted)", () => {
  it("exists and is noindex", () => {
    expect(page).not.toBe("");
    expect(page).toMatch(/\n\s*noindex\n/);
  });

  it("is not referenced by any other source file", () => {
    const hits = Object.entries(sources)
      .filter(([path, text]) => path !== pagePath && text.includes("generals-garden"))
      .map(([path]) => path);
    expect(hits).toEqual([]);
  });

  it("swaps the header button for the founding-dates request", () => {
    expect(page).toContain('label: "Request founding dates"');
  });
});
