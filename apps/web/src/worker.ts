/**
 * Worker entry for apricotstays-web. Only /api/* reaches this script (wrangler.jsonc:
 * assets.run_worker_first); every other request is served as a static file, free and unmetered.
 */
import { handleAvailability, json, type Env } from "./api/availability";

interface Assets {
  fetch(request: Request): Promise<Response>;
}

interface Ctx {
  waitUntil(promise: Promise<unknown>): void;
}

export default {
  async fetch(request: Request, env: Env & { ASSETS: Assets }, ctx: Ctx): Promise<Response> {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);

    if (request.method !== "GET" && request.method !== "HEAD") {
      const res = json({ error: "Method not allowed" }, 405);
      res.headers.set("Allow", "GET, HEAD");
      return res;
    }

    if (url.pathname === "/api/availability") {
      // `caches.default` is Cloudflare-specific; absent in other runtimes.
      const cache = (globalThis.caches as unknown as { default?: Cache } | undefined)?.default;
      return handleAvailability(url, env, {
        cache: cache ?? null,
        fetch: (input, init) => fetch(input, init),
        now: () => Date.now(),
        waitUntil: (p) => ctx.waitUntil(p),
      });
    }

    return json({ error: "Not found" }, 404);
  },
};
