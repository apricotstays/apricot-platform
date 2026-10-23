#!/usr/bin/env node
/**
 * Checks every photo URL in /stays.json returns 200: `node scripts/check-photos.mjs <base-url>`.
 * CI's link checker skips apricotstays.in URLs, so this covers them. Against a preview, photo
 * URLs (which name apricotstays.in) are fetched from the preview host instead, since a new
 * build's hashed images exist only there until merge.
 */
const base = (process.argv[2] ?? "https://apricotstays.in").replace(/\/$/, "");
const res = await fetch(`${base}/stays.json`);
if (!res.ok) throw new Error(`/stays.json → ${res.status}`);
const stays = await res.json();
const urls = stays.homes.flatMap((h) => [
  ...h.photos.map((p) => p.url),
  ...h.rooms.map((r) => r.photo.url),
]);
const rebase = (u) => u.replace(/^https:\/\/apricotstays\.in/, base);
const results = await Promise.all(
  urls.map(async (u) => {
    const r = await fetch(rebase(u), { method: "GET" });
    return { u, status: r.status, type: r.headers.get("content-type") };
  }),
);
const bad = results.filter((r) => r.status !== 200 || !/^image\//.test(r.type ?? ""));
console.log(`${stays.homes.length} homes, ${urls.length} photo URLs, ${bad.length} failing`);
for (const b of bad) console.log(`  ${b.status} ${b.type} ${b.u}`);
process.exit(bad.length ? 1 : 0);
