import { describe, expect, it } from "vitest";
import {
  decryptPayload,
  handleProposal,
  type Payload,
  type ProposalDeps,
  type ProposalEnv,
} from "../src/api/proposal";
import committed from "../src/proposal/payload.enc.json";

// Private proposal pages (CK, Nov 2026): /p/<token> behind a code; content encrypted in the repo.
const b64 = (bytes: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)));
const KEY = b64(new Uint8Array(32).fill(7));
const TOKEN = "test-token-0123456789";
const env: ProposalEnv = { PROPOSAL_TOKEN: TOKEN, PROPOSAL_CODE: "6072", PROPOSAL_KEY: KEY };
const SHELL = `<html><body><main id="main" data-img-hero="/_astro/hero.webp" data-img-parade="/_astro/parade.webp"><div data-private-slot></div></main></body></html>`;
const NOW = Date.UTC(2026, 10, 25);

async function encrypt(text: string): Promise<Payload> {
  const key = await crypto.subtle.importKey(
    "raw",
    Uint8Array.from(atob(KEY), (c) => c.charCodeAt(0)),
    "AES-GCM",
    false,
    ["encrypt"],
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(text),
  );
  return {
    v: 1,
    iv: b64(iv),
    data: b64(data),
  };
}

async function deps(): Promise<ProposalDeps> {
  return {
    asset: async (path) =>
      path === "/p/shell"
        ? new Response(SHELL, { headers: { "Content-Security-Policy": "default-src 'self'" } })
        : new Response("not found page", { status: 404 }),
    payload: await encrypt(`<h1>Secret proposal</h1><img src="{{IMG_HERO}}">`),
    now: () => NOW,
  };
}

const at = (path: string, init?: RequestInit) =>
  new Request(`https://apricotstays.in${path}`, init);
const post = (code: string, headers: Record<string, string> = {}) =>
  at(`/p/${TOKEN}`, { method: "POST", body: new URLSearchParams({ code }), headers });

describe("/p/<token> private proposal", () => {
  it("answers 404 for a wrong token, the shell itself, or missing secrets", async () => {
    const d = await deps();
    for (const path of ["/p/nope", "/p/shell", "/p/shell.html", `/p/${TOKEN}x`]) {
      expect((await handleProposal(at(path), env, d)).status).toBe(404);
    }
    expect((await handleProposal(at(`/p/${TOKEN}`), {}, d)).status).toBe(404);
  });

  it("shows the code screen, not the content, without a cookie", async () => {
    const res = await handleProposal(at(`/p/${TOKEN}`), env, await deps());
    const html = await res.text();
    expect(res.status).toBe(200);
    expect(html).toContain('name="code"');
    expect(html).not.toContain("Secret proposal");
    expect(res.headers.get("Cache-Control")).toBe("private, no-store");
    expect(res.headers.get("X-Robots-Tag")).toContain("noindex");
    expect(res.headers.get("Content-Security-Policy")).toBe("default-src 'self'");
  });

  it("rejects a wrong code", async () => {
    const res = await handleProposal(post("1234"), env, await deps());
    expect(res.status).toBe(401);
    expect(res.headers.get("Set-Cookie")).toBeNull();
    expect(await res.text()).not.toContain("Secret proposal");
  });

  it("accepts the right code, sets a cookie, then shows the decrypted page with images", async () => {
    const d = await deps();
    const ok = await handleProposal(post(" 6072 "), env, d);
    expect(ok.status).toBe(303);
    const cookie = ok.headers.get("Set-Cookie")!;
    expect(cookie).toMatch(/HttpOnly; Secure; SameSite=Lax/);
    const res = await handleProposal(
      at(`/p/${TOKEN}`, { headers: { Cookie: cookie.split(";")[0] } }),
      env,
      d,
    );
    const html = await res.text();
    expect(html).toContain("<h1>Secret proposal</h1>");
    expect(html).toContain('<img src="/_astro/hero.webp">');
    expect(html).not.toContain("data-private-slot");
  });

  it("ignores a forged or expired cookie", async () => {
    const d = await deps();
    for (const value of [`${NOW + 1e9}.forged`, `${NOW - 1}.x`, "junk"]) {
      const res = await handleProposal(
        at(`/p/${TOKEN}`, { headers: { Cookie: `apr_p=${value}` } }),
        env,
        d,
      );
      expect(await res.text()).not.toContain("Secret proposal");
    }
  });

  it("stops guessing once the rate limit is hit", async () => {
    const limited: ProposalEnv = {
      ...env,
      PROPOSAL_LIMITER: { limit: async () => ({ success: false }) },
    };
    const res = await handleProposal(post("6072"), limited, await deps());
    expect(res.status).toBe(429);
  });

  it("commits only ciphertext", async () => {
    const p = committed as Payload;
    expect(p.v).toBe(1);
    expect(p.data.length).toBeGreaterThan(100);
    await expect(decryptPayload(KEY, p)).rejects.toThrow();
  });
});
