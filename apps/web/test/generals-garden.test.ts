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
      // Importing its photos (e.g. the private /p/ shell) is not a link to the page.
      .filter(
        ([path, text]) =>
          path !== pagePath &&
          text.replaceAll("assets/generals-garden/", "").includes("generals-garden"),
      )
      .map(([path]) => path);
    expect(hits).toEqual([]);
  });

  // Header v2 (19 Nov 2026) has no per-page button; the request stays on the page itself.
  it("keeps the founding-dates request on the page, with the standard header", () => {
    expect(page).toMatch(/founding dates/i);
    expect(page).toContain("<Navbar />");
  });
});
