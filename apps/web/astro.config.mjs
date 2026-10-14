// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://apricotstays.in",
  build: { format: "file", inlineStylesheets: "auto" },
  trailingSlash: "never",
  image: { responsiveStyles: true },
  vite: { plugins: [tailwindcss()] },
});
