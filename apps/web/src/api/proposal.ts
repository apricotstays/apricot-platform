/**
 * Private proposal pages (CK, Nov 2026): one owner proposal served at /p/<token>, behind a short
 * code. Nothing here is secret: the proposal itself is in src/proposal/payload.enc.json, encrypted
 * (AES-GCM), and the token, code and key are Worker secrets set in the Cloudflare dashboard:
 *   PROPOSAL_TOKEN  the unguessable path segment, e.g. /p/<token>
 *   PROPOSAL_CODE   the code the owner types (shared separately on WhatsApp)
 *   PROPOSAL_KEY    base64 of 32 random bytes; decrypts the payload and signs the cookie
 * Optional binding PROPOSAL_LIMITER (wrangler.jsonc ratelimits) caps wrong codes per IP.
 * Any other /p/* path, or a missing secret, answers with the normal 404 page.
 */

export interface ProposalEnv {
  PROPOSAL_TOKEN?: string;
  PROPOSAL_CODE?: string;
  PROPOSAL_KEY?: string;
  PROPOSAL_LIMITER?: { limit(opts: { key: string }): Promise<{ success: boolean }> };
}

export interface Payload {
  v: 1;
  iv: string;
  data: string;
}

export interface ProposalDeps {
  /** GET a static file (the shell page, the 404 page). */
  asset: (path: string) => Promise<Response>;
  payload: Payload;
  now: () => number;
}

const COOKIE = "apr_p";
const COOKIE_DAYS = 30;
const SHELL_PATH = "/p/shell";
const SLOT = "<div data-private-slot></div>";

const enc = new TextEncoder();

function b64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const bin = atob(b64.replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToB64url(bytes: ArrayBuffer): string {
  let bin = "";
  for (const b of new Uint8Array(bytes)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(keyB64: string, text: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    b64ToBytes(keyB64),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return bytesToB64url(await crypto.subtle.sign("HMAC", key, enc.encode(text)));
}

/** Constant-time comparison of two strings via their HMACs. */
async function sameSecret(keyB64: string, a: string, b: string): Promise<boolean> {
  const [x, y] = await Promise.all([hmac(keyB64, `cmp:${a}`), hmac(keyB64, `cmp:${b}`)]);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.min(x.length, y.length); i++) diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diff === 0;
}

export async function decryptPayload(keyB64: string, payload: Payload): Promise<string> {
  const key = await crypto.subtle.importKey("raw", b64ToBytes(keyB64), "AES-GCM", false, [
    "decrypt",
  ]);
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: b64ToBytes(payload.iv) },
    key,
    b64ToBytes(payload.data),
  );
  return new TextDecoder().decode(plain);
}

export async function makeCookieValue(keyB64: string, expiresAt: number): Promise<string> {
  return `${expiresAt}.${await hmac(keyB64, `proposal:${expiresAt}`)}`;
}

async function hasValidCookie(request: Request, keyB64: string, now: number): Promise<boolean> {
  const raw = request.headers.get("Cookie") ?? "";
  const match = raw.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  if (!match) return false;
  const [expStr, sig] = match[1].split(".");
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < now || !sig) return false;
  return sameSecret(keyB64, sig, await hmac(keyB64, `proposal:${exp}`));
}

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!,
  );
}

export function gateHtml(error?: string): string {
  const err = error
    ? `<p role="alert" style="margin: 0; font-size: 15px; color: #9a3a26">${escapeHtml(error)}</p>`
    : "";
  return `<section style="max-width: 28rem; margin: 0 auto; padding: 96px 24px 120px; display: flex; flex-direction: column; gap: 16px">
  <p style="margin: 0; font-size: 14px; font-weight: 500; color: #2f4a3a">A private page</p>
  <h1 class="t-display" style="margin: 0; color: #2f4a3a">Welcome, Sir.</h1>
  <p style="margin: 0; font-size: 17px; line-height: 1.6">This page was shared with you personally. Please enter the code Shiva sent you on WhatsApp.</p>
  <form method="post" style="display: flex; flex-direction: column; gap: 12px; margin-top: 8px">
    <label for="code" style="font-size: 15px; font-weight: 500; color: #1f1f1f">Code</label>
    <input id="code" name="code" type="text" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]*" maxlength="12" required autofocus style="min-height: 56px; padding: 0 16px; font-size: 24px; letter-spacing: 0.3em; border: 1px solid #484848; border-radius: 4px; font-family: inherit">
    ${err}
    <button type="submit" class="btn-primary btn-lg btn-block">Open</button>
  </form>
  <p style="margin: 8px 0 0; font-size: 14px; color: #5c5c5c">No code? <a href="https://wa.me/919740544873?text=Hi%20Shiva%2C%20please%20send%20me%20the%20code%20for%20the%20private%20page." target="_blank" rel="noopener" style="color: #2b2b2b">Ask Shiva on WhatsApp</a>.</p>
</section>`;
}

async function page(
  deps: ProposalDeps,
  body: string,
  status: number,
  extra?: Record<string, string>,
): Promise<Response> {
  const shell = await deps.asset(SHELL_PATH);
  if (!shell.ok) return new Response("Not available yet", { status: 503 });
  const html = await shell.text();
  const imgs: Record<string, string> = {};
  for (const m of html.matchAll(/data-img-([a-z]+)="([^"]+)"/g)) imgs[m[1]] = m[2];
  const filled = body.replace(
    /\{\{IMG_([A-Z]+)\}\}/g,
    (_, k: string) => imgs[k.toLowerCase()] ?? "",
  );
  const headers = new Headers(shell.headers);
  headers.set("Content-Type", "text/html; charset=utf-8");
  headers.set("Cache-Control", "private, no-store");
  headers.set("X-Robots-Tag", "noindex, nofollow");
  headers.set("Referrer-Policy", "no-referrer");
  headers.delete("ETag");
  headers.delete("Last-Modified");
  headers.delete("Content-Length");
  for (const [k, v] of Object.entries(extra ?? {})) headers.set(k, v);
  return new Response(html.replace(SLOT, filled), { status, headers });
}

async function notFound(deps: ProposalDeps): Promise<Response> {
  const res = await deps.asset("/404");
  return new Response(res.body, { status: 404, headers: res.headers });
}

export async function handleProposal(
  request: Request,
  env: ProposalEnv,
  deps: ProposalDeps,
): Promise<Response> {
  const url = new URL(request.url);
  const { PROPOSAL_TOKEN: token, PROPOSAL_CODE: code, PROPOSAL_KEY: key } = env;
  if (!token || !code || !key || token.length < 16) return notFound(deps);
  if (url.pathname !== `/p/${token}`) return notFound(deps);

  const now = deps.now();

  if (request.method === "GET" || request.method === "HEAD") {
    if (await hasValidCookie(request, key, now)) {
      return page(deps, await decryptPayload(key, deps.payload), 200);
    }
    return page(deps, gateHtml(), 200);
  }

  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, POST" } });
  }

  if (env.PROPOSAL_LIMITER) {
    const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
    const { success } = await env.PROPOSAL_LIMITER.limit({ key: `proposal:${ip}` });
    if (!success) {
      return page(deps, gateHtml("Too many tries. Please wait a minute and try again."), 429);
    }
  }

  const form = await request.formData().catch(() => null);
  const typed = String(form?.get("code") ?? "").trim();
  if (!typed || !(await sameSecret(key, typed, code))) {
    return page(deps, gateHtml("That code doesn't match. Please check the WhatsApp message."), 401);
  }

  const exp = now + COOKIE_DAYS * 24 * 60 * 60 * 1000;
  const cookie = `${COOKIE}=${await makeCookieValue(key, exp)}; Path=/p/; Max-Age=${COOKIE_DAYS * 86400}; HttpOnly; Secure; SameSite=Lax`;
  return new Response(null, {
    status: 303,
    headers: { Location: url.pathname, "Set-Cookie": cookie, "Cache-Control": "no-store" },
  });
}
