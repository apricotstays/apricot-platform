import type { APIRoute } from "astro";
import { buildStays } from "../data/agent";
import { getImage, resolveMedia } from "../lib/agent-media";

// Every home as data, for AI agents and the /mcp endpoint (Agent-ready Phase 0).
export const GET: APIRoute = async () => {
  const stays = buildStays(await resolveMedia(getImage), new Date());
  return new Response(JSON.stringify(stays, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
