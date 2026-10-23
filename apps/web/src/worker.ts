/**
 * Worker entry for apricotstays-web. /api/* and /mcp run this script (wrangler.jsonc:
 * assets.run_worker_first); a request with no matching static file also reaches it and is handed
 * back to the static assets (the 404 page). Everything else is a static file, free and unmetered.
 */
import { handleAvailability, json, type Deps, type Env } from "./api/availability";
import { handleMcp } from "./api/mcp";
import type { Stays } from "./data/agent";

interface Assets {
  fetch(request: Request): Promise<Response>;
}

interface Ctx {
  waitUntil(promise: Promise<unknown>): void;
}

export default {
  async fetch(request: Request, env: Env & { ASSETS: Assets }, ctx: Ctx): Promise<Response> {
    const url = new URL(request.url);
    // `caches.default` is Cloudflare-specific; absent in other runtimes.
    const cache = (globalThis.caches as unknown as { default?: Cache } | undefined)?.default;
    const deps: Deps = {
      cache: cache ?? null,
      fetch: (input, init) => fetch(input, init),
      now: () => Date.now(),
      waitUntil: (p) => ctx.waitUntil(p),
    };

    // Read-only MCP server for agents. Above the static pass-through and the GET-only rule.
    if (url.pathname === "/mcp") {
      return handleMcp(request, env, {
        ...deps,
        stays: async () => {
          // A fresh GET for the static file; never forward the agent's POST.
          const res = await env.ASSETS.fetch(new Request(new URL("/stays.json", request.url)));
          if (!res.ok) throw new Error(`stays.json ${res.status}`);
          return (await res.json()) as Stays;
        },
        log: (line) => console.log(line),
      });
    }

    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);

    if (request.method !== "GET" && request.method !== "HEAD") {
      const res = json({ error: "Method not allowed" }, 405);
      res.headers.set("Allow", "GET, HEAD");
      return res;
    }

    if (url.pathname === "/api/availability") return handleAvailability(url, env, deps);

    return json({ error: "Not found" }, 404);
  },
};
