import type { APIRoute } from "astro";
import { properties } from "@apricot/schema";
import { waysToStay } from "../data/ways-to-stay";

// Keep in sync with pages in src/pages (excluding 404, /menu (a noindex page for in-house guests) and /shop (noindex during soft launch)).
const paths = [
  "/",
  "/our-story",
  ...properties.map((p) => `/stays/${p.slug}`),
  ...waysToStay.map((w) => `/ways-to-stay/${w.slug}`),
  "/policies",
  "/privacy",
];

export const GET: APIRoute = ({ site }) => {
  const urls = paths.map((p) => `  <url><loc>${new URL(p, site).href}</loc></url>`).join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
