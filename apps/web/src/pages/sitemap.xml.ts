import type { APIRoute } from "astro";
import { properties } from "@apricot/schema";

// Keep in sync with pages in src/pages (excluding 404 and /menu, a noindex page for in-house guests).
const paths = ["/", "/our-story", ...properties.map((p) => `/stays/${p.slug}`), "/privacy"];

export const GET: APIRoute = ({ site }) => {
  const urls = paths.map((p) => `  <url><loc>${new URL(p, site).href}</loc></url>`).join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
