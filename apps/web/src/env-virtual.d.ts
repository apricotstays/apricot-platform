// Astro's internal lightweight image module (see src/lib/agent-media.ts).
declare module "virtual:astro:get-image" {
  export const getImage: typeof import("astro:assets").getImage;
}
