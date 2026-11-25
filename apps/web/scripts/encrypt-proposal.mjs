#!/usr/bin/env node
/**
 * Encrypts a private proposal fragment for /p/<token> (see src/api/proposal.ts).
 *
 *   PROPOSAL_KEY=<base64 32 bytes> node scripts/encrypt-proposal.mjs <fragment.html> [out.json]
 *
 * The fragment (plain HTML for inside <main>) lives OUTSIDE this public repo, in CK's private
 * Drive folder. Only the encrypted output is committed (default src/proposal/payload.enc.json).
 * New key: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 */
import { readFileSync, writeFileSync } from "node:fs";
import { webcrypto as crypto } from "node:crypto";

const [input, out = new URL("../src/proposal/payload.enc.json", import.meta.url)] =
  process.argv.slice(2);
const keyB64 = process.env.PROPOSAL_KEY;
if (!input || !keyB64) {
  console.error(
    "Usage: PROPOSAL_KEY=<base64> node scripts/encrypt-proposal.mjs <fragment.html> [out.json]",
  );
  process.exit(1);
}
const raw = Buffer.from(keyB64, "base64");
if (raw.length !== 32) {
  console.error("PROPOSAL_KEY must be 32 bytes, base64-encoded.");
  process.exit(1);
}
const key = await crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt"]);
const iv = crypto.getRandomValues(new Uint8Array(12));
const data = await crypto.subtle.encrypt(
  { name: "AES-GCM", iv },
  key,
  new TextEncoder().encode(readFileSync(input, "utf8")),
);
const payload = {
  v: 1,
  iv: Buffer.from(iv).toString("base64"),
  data: Buffer.from(data).toString("base64"),
};
writeFileSync(out, JSON.stringify(payload) + "\n");
console.log(`Encrypted ${input} -> ${out instanceof URL ? out.pathname : out}`);
