import type { APIRoute } from "astro";
import { buildLlmsFull, buildStays } from "../data/agent";
import { getImage, resolveMedia } from "../lib/agent-media";

// https://llmstxt.org — the long form of /llms.txt: every home in full, policies, FAQ, and how
// agents can read live availability.
export const GET: APIRoute = async () => {
  const body = buildLlmsFull(buildStays(await resolveMedia(getImage), new Date()));
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
