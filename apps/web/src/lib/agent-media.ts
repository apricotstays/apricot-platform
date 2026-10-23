/**
 * Build-time only: resolves the gallery and room photos to absolute 1200 px URLs for agents
 * (/stays.json, stay-page JSON-LD). Never import this from src/api/ (image imports cannot
 * bundle into the Worker). Callers pass in astro:assets' getImage, which keeps that import in
 * the pages themselves: importing it from a shared module splits Astro's image CSS into an
 * extra stylesheet on every page.
 */
import type { getImage as GetImage } from "astro:assets";
// Astro's own lightweight getImage module (what astro:assets re-exports, minus the components
// and their image CSS). Endpoints use it so no stylesheet is attached to them; pages keep using
// astro:assets. Astro is pinned to an exact version in package.json.
export { getImage } from "virtual:astro:get-image";
import { brand } from "@apricot/brand";
import { galleries, rooms, type Photo } from "../data/media";
import type { PhotoRef, ResolvedMedia, RoomRef } from "../data/agent";

export const AGENT_PHOTO_WIDTH = 1200;

type Resolver = typeof GetImage;

async function resolve(getImage: Resolver, photo: Photo): Promise<PhotoRef> {
  const img = await getImage({ src: photo.src, width: AGENT_PHOTO_WIDTH, format: "webp" });
  return { url: new URL(img.src, brand.url).href, caption: photo.alt };
}

export async function galleryUrls(getImage: Resolver, slug: string): Promise<PhotoRef[]> {
  return Promise.all((galleries[slug] ?? []).map((ph) => resolve(getImage, ph)));
}

export async function resolveMedia(getImage: Resolver): Promise<ResolvedMedia> {
  const photos: Record<string, PhotoRef[]> = {};
  const roomRefs: Record<string, RoomRef[]> = {};
  for (const slug of Object.keys(galleries)) photos[slug] = await galleryUrls(getImage, slug);
  for (const [slug, list] of Object.entries(rooms)) {
    roomRefs[slug] = await Promise.all(
      list.map(async (r) => ({
        name: r.name,
        bed: r.bed,
        palette: r.palette,
        photo: await resolve(getImage, r.photo),
      })),
    );
  }
  return { photos, rooms: roomRefs };
}
