/**
 * Reads the "Garden - Services & Experiences" Notion database at build time.
 * Plain fetch against the public Notion API (no SDK). Needs a read-only integration token with
 * access to that one database only, so nothing else in the workspace is readable from a build.
 */
import type { ListingRow } from "./core";

export const NOTION_VERSION = "2022-06-28";

type Fetch = typeof fetch;

// Minimal shapes of the Notion property values we read.
interface RichText {
  plain_text: string;
}
type Prop =
  | { type: "title"; title: RichText[] }
  | { type: "rich_text"; rich_text: RichText[] }
  | { type: "select"; select: { name: string } | null }
  | { type: "number"; number: number | null }
  | { type: "checkbox"; checkbox: boolean }
  | {
      type: "files";
      files: (
        | { type: "file"; name: string; file: { url: string } }
        | { type: "external"; name: string; external: { url: string } }
      )[];
    }
  | { type: string };

interface Page {
  properties: Record<string, Prop>;
}

const text = (p: Prop | undefined): string => {
  if (!p) return "";
  if (p.type === "title")
    return (p as { title: RichText[] }).title.map((t) => t.plain_text).join("");
  if (p.type === "rich_text")
    return (p as { rich_text: RichText[] }).rich_text.map((t) => t.plain_text).join("");
  if (p.type === "select") return (p as { select: { name: string } | null }).select?.name ?? "";
  return "";
};
const num = (p: Prop | undefined): number | null =>
  p?.type === "number" ? (p as { number: number | null }).number : null;
const bool = (p: Prop | undefined): boolean =>
  p?.type === "checkbox" ? (p as { checkbox: boolean }).checkbox : false;
const files = (p: Prop | undefined): { url: string; name: string }[] => {
  if (p?.type !== "files") return [];
  return (p as Extract<Prop, { type: "files" }>).files.map((f) => ({
    name: f.name,
    url: f.type === "file" ? f.file.url : f.external.url,
  }));
};

/** Notion page → flat row. Column names must match the database exactly. */
export function pageToRow(page: Page): ListingRow {
  const p = page.properties;
  return {
    name: text(p["Name"]),
    kind: text(p["Kind"]),
    slug: text(p["Slug"]),
    section: text(p["Section"]),
    photos: files(p["Photos"]),
    photoCredit: text(p["Photo credit"]),
    badge: text(p["Badge"]),
    description: text(p["Description"]),
    where: text(p["Where"]),
    duration: text(p["Duration"]),
    steps: text(p["Steps"]),
    included: text(p["Included"]),
    thingsToKnow: text(p["Things to know"]),
    priceFrom: num(p["Price from"]),
    unit: text(p["Unit"]),
    priceNote: text(p["Price note"]),
    showPrice: bool(p["Show price"]),
    options: text(p["Options"]),
    cancellation: text(p["Cancellation"]),
    status: text(p["Status"]),
    order: num(p["Order"]),
    leadTime: text(p["Lead time"]),
    whatsappText: text(p["WhatsApp text"]),
    // "Internal notes" is deliberately never read.
  };
}

/** All rows of the database (follows pagination). Throws on any API error. */
export async function fetchRows(
  token: string,
  databaseId: string,
  fetchImpl: Fetch = fetch,
): Promise<ListingRow[]> {
  const rows: ListingRow[] = [];
  let cursor: string | undefined;
  do {
    const res = await fetchImpl(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) }),
    });
    if (!res.ok) {
      throw new Error(`Notion API ${res.status}: ${(await res.text()).slice(0, 200)}`);
    }
    const data = (await res.json()) as {
      results: Page[];
      has_more: boolean;
      next_cursor: string | null;
    };
    rows.push(...data.results.map(pageToRow));
    cursor = data.has_more && data.next_cursor ? data.next_cursor : undefined;
  } while (cursor);
  return rows;
}
