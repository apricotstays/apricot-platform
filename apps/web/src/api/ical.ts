/**
 * Minimal iCalendar (RFC 5545) reader for Airbnb's calendar export.
 *
 * Privacy by construction: only DTSTART and DTEND are read from each VEVENT. Every other
 * property (SUMMARY, DESCRIPTION with the reservation link and the guest's phone digits, UID, …)
 * is never copied anywhere, so it cannot reach the cache or the response.
 */

/** A booked span. `from` is the first booked night; `to` is the checkout day (free). */
export interface Range {
  from: string;
  to: string;
}

const DAY_MS = 86_400_000;

/** "20261018" or "20261018T140000Z" → "2026-10-18"; anything else → null. */
export function toIsoDate(value: string): string | null {
  const m = /^(\d{4})(\d{2})(\d{2})/.exec(value.trim());
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const t = new Date(Date.UTC(y, mo - 1, d));
  if (t.getUTCFullYear() !== y || t.getUTCMonth() !== mo - 1 || t.getUTCDate() !== d) return null;
  return t.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  return new Date(Date.parse(iso) + days * DAY_MS).toISOString().slice(0, 10);
}

/** Every VEVENT's DTSTART/DTEND as a date range. Events without a valid start are skipped. */
export function parseIcal(text: string): Range[] {
  // Normalise line endings, then unfold continuation lines (CRLF followed by a space or tab).
  const lines = text
    .replace(/\r\n?/g, "\n")
    .replace(/\n[ \t]/g, "")
    .split("\n");
  const out: Range[] = [];
  let inEvent = false;
  let start: string | null = null;
  let end: string | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    const upper = line.toUpperCase();
    if (upper === "BEGIN:VEVENT") {
      inEvent = true;
      start = end = null;
    } else if (upper === "END:VEVENT") {
      if (inEvent && start)
        out.push({ from: start, to: end && end > start ? end : addDays(start, 1) });
      inEvent = false;
    } else if (inEvent) {
      const colon = line.indexOf(":");
      if (colon < 0) continue;
      const name = line.slice(0, colon).split(";")[0].toUpperCase();
      if (name === "DTSTART") start = toIsoDate(line.slice(colon + 1));
      else if (name === "DTEND") end = toIsoDate(line.slice(colon + 1));
    }
  }
  return out;
}

/** Sort and merge overlapping or touching ranges. */
export function mergeRanges(ranges: readonly Range[]): Range[] {
  const sorted = [...ranges].sort((a, b) => (a.from < b.from ? -1 : a.from > b.from ? 1 : 0));
  const out: Range[] = [];
  for (const r of sorted) {
    const last = out[out.length - 1];
    if (last && r.from <= last.to) {
      if (r.to > last.to) last.to = r.to;
    } else {
      out.push({ from: r.from, to: r.to });
    }
  }
  return out;
}

/** Keep only the part of each range inside [today, through). */
export function clipRanges(ranges: readonly Range[], today: string, through: string): Range[] {
  return ranges
    .filter((r) => r.to > today && r.from < through)
    .map((r) => ({ from: r.from < today ? today : r.from, to: r.to > through ? through : r.to }));
}
