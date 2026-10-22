// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://apricotstays.in",
  build: { format: "file", inlineStylesheets: "auto" },
  trailingSlash: "never",
  image: {
    responsiveStyles: true,
    // Experiences & services photos come from Notion (S3-hosted, signed links that expire).
    // Astro downloads and resizes them at build time; keep in sync with PHOTO_HOSTS in src/experiences/load.ts.
    remotePatterns: [
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "file.notion.so" },
      { protocol: "https", hostname: "www.notion.so" },
    ],
  },
  vite: {
    plugins: [tailwindcss()],
    // Never inline scripts or assets into the HTML: the CSP (public/_headers) has no
    // 'unsafe-inline' for scripts, so an inlined <script> would silently not run.
    build: { assetsInlineLimit: 0 },
  },
});
