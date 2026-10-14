// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://apricotstays.in",
  // Emit /thanks.html (not /thanks/index.html) to keep existing URLs stable.
  build: { format: "file", inlineStylesheets: "always" },
  trailingSlash: "never",
});
