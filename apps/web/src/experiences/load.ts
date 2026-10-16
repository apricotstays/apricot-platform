/**
 * Build-time source of Experiences & services, shared by every page that needs it.
 *
 * 1. NOTION_TOKEN set (Cloudflare build variable) → read the Notion database.
 * 2. Not set, or Notion fails → the committed snapshot (src/experiences/snapshot.json), so a build
 *    never breaks and never publishes an empty section because Notion had a bad minute.
 *
 * Drafts show on preview builds (any branch except main) and when SHOW_DRAFTS=1 (CI), never on
 * production. See selectListings() for the rules.
 */
import { selectListings, type Listing, type ListingRow } from "./core";
import { fetchRows } from "./notion";
import snapshot from "./snapshot.json";

/**
 * Soft launch: pages are reachable from the footer only, `noindex`, and left out of the sitemap
 * and llms.txt. Set to false to make them public to search engines.
 */
export const SOFT_LAUNCH = true;

/** "Garden - Services & Experiences" in the Apricot Stays Handbook (Notion). Not a secret. */
export const DEFAULT_DATABASE_ID = "3fbde398f10a80b59d04c5581fcc71a4";

/** Hosts whose photos Astro may download and resize at build time (see astro.config.mjs). */
export const PHOTO_HOSTS = [/\.amazonaws\.com$/, /^file\.notion\.so$/, /^www\.notion\.so$/];

const env =
  (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {};

export interface Loaded {
  listings: Listing[];
  source: "notion" | "snapshot";
  showDrafts: boolean;
}

function allowedPhoto(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === "https:" && PHOTO_HOSTS.some((h) => h.test(hostname));
  } catch {
    return false;
  }
}

async function load(): Promise<Loaded> {
  const branch = env.WORKERS_CI_BRANCH;
  const showDrafts = env.SHOW_DRAFTS === "1" || (!!branch && branch !== "main");
  let rows: ListingRow[] = snapshot as ListingRow[];
  let source: Loaded["source"] = "snapshot";
  if (env.NOTION_TOKEN) {
    try {
      rows = await fetchRows(env.NOTION_TOKEN, env.NOTION_EXPERIENCES_DB || DEFAULT_DATABASE_ID);
      source = "notion";
    } catch (err) {
      console.warn(`[experiences] Notion read failed, using snapshot: ${String(err)}`);
    }
  }
  rows = rows.map((r) => {
    const photos = r.photos.filter((p) => allowedPhoto(p.url));
    if (photos.length < r.photos.length) {
      console.warn(`[experiences] ${r.name}: skipped photos not uploaded to Notion`);
    }
    return { ...r, photos };
  });
  const { listings, skipped } = selectListings(rows, showDrafts);
  console.info(
    `[experiences] source=${source} drafts=${showDrafts ? "shown" : "hidden"} pages=${listings.length}`,
  );
  for (const s of skipped) console.info(`[experiences] not shown: ${s}`);
  return { listings, source, showDrafts };
}

let cached: Promise<Loaded> | undefined;
/** Loads once per build; every page shares the result. */
export function loadExperiences(): Promise<Loaded> {
  cached ??= load();
  return cached;
}
