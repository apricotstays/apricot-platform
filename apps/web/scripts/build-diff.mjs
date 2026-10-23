#!/usr/bin/env node
/**
 * Hash-masked diff of two builds: `node scripts/build-diff.mjs <before-dist> <after-dist>`.
 *
 * Hashed asset names (/_astro/name.HASH.ext) are masked first: Tailwind scans every source
 * file, so adding any file can change the shared CSS hash on every page. CSS is compared on its
 * own. For HTML pages that differ, it reports whether the change is only inside the
 * <script type="application/ld+json"> block, or whether the visible text changed.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const [before, after] = process.argv.slice(2);
if (!before || !after) {
  console.error("usage: build-diff.mjs <before-dist> <after-dist>");
  process.exit(2);
}

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
const list = (dir) =>
  new Set(walk(dir).map((p) => relative(dir, p).replace(/\.[0-9A-Za-z_-]{8}\.(\w+)$/, ".HASH.$1")));

const mask = (s) => s.replace(/(\/_astro\/[^"'\s)]+?)\.[0-9A-Za-z_-]{8}(\.\w+)/g, "$1.HASH$2");
const ldRe = /<script type="application\/ld\+json">[\s\S]*?<\/script>/g;
const decode = (s) =>
  s
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
const text = (html) =>
  decode(
    html
      .replace(ldRe, "")
      .replace(/<script[\s\S]*?<\/script>/g, "")
      .replace(/<style[\s\S]*?<\/style>/g, "")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();

const a = list(before);
const b = list(after);
const added = [...b].filter((f) => !a.has(f) && !f.startsWith("_astro/"));
const removed = [...a].filter((f) => !b.has(f) && !f.startsWith("_astro/"));
const newAssets = [...b].filter((f) => !a.has(f) && f.startsWith("_astro/")).length;

let failed = false;
const report = [];
const htmlFiles = walk(after).filter((p) => p.endsWith(".html"));
for (const p of htmlFiles) {
  const rel = relative(after, p);
  const old = join(before, rel);
  if (!existsSync(old)) continue;
  const x = mask(readFileSync(old, "utf8"));
  const y = mask(readFileSync(p, "utf8"));
  if (x === y) continue;
  const outsideLd = x.replace(ldRe, "") !== y.replace(ldRe, "");
  const sameText = text(x) === text(y);
  report.push(
    `${rel}: ${outsideLd ? "markup changed outside JSON-LD" : "only JSON-LD changed"}; visible text ${sameText ? "identical" : "CHANGED"}`,
  );
  if (!sameText) failed = true;
}

const css = (dir) =>
  walk(dir)
    .filter((p) => p.endsWith(".css"))
    .map((p) => readFileSync(p, "utf8"))
    .sort()
    .join("\n");
const cssSame = css(before) === css(after);

console.log(`Added files: ${added.join(", ") || "none"}`);
console.log(`Removed files: ${removed.join(", ") || "none"}`);
console.log(`New hashed assets: ${newAssets}`);
console.log(`CSS: ${cssSame ? "identical" : "DIFFERS (inspect)"}`);
console.log(report.length ? report.join("\n") : "HTML: no page differs");
if (removed.length) failed = true;
process.exit(failed ? 1 : 0);
