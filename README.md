# apricot-platform

Monorepo for **Apricot Stays** — boutique homes across the Chandigarh Tricity.

| Path              | What it is                                                     | Status   |
| ----------------- | -------------------------------------------------------------- | -------- |
| `apps/web`        | apricotstays.in (Astro, static) + `/api/availability` + `/mcp` | Live     |
| `apps/api`        | Availability, enquiries, agent API (Cloudflare Workers)        | Reserved |
| `packages/brand`  | Colours, fonts (Tailwind `@theme`), contact details            | Active   |
| `packages/schema` | Homes and their facts (availability later, from STAIZ)         | Active   |

Booking and availability logic belongs in **STAIZ**; this site reads from it rather than re-implementing it.

## Run locally

Requires Node 22 (`.nvmrc`).

```sh
npm ci
npm run dev        # http://localhost:4321
npm run build      # → apps/web/dist
```

## Quality checks (run on every PR)

| Check          | Command                                     | Gate                                         |
| -------------- | ------------------------------------------- | -------------------------------------------- |
| Formatting     | `npm run format:check`                      | Prettier, no diffs                           |
| Types/template | `npm run check`                             | `astro check`, no errors                     |
| Unit tests     | `npm test`                                  | Vitest (availability API, agent files, data) |
| Build          | `npm run build`                             | Must succeed                                 |
| Worker bundle  | `wrangler deploy --dry-run` (in `apps/web`) | Worker bundles without deploying             |
| Broken links   | `npm run links`                             | Internal links resolve                       |
| Accessibility  | `npm run a11y`                              | WCAG 2 AA via axe (needs `npm run preview`)  |
| Page speed     | `npm run lhci`                              | Lighthouse ≥ 90 every category, HTML ≤ 50 KB |

## How changes ship

1. A change is opened as a pull request against `main`.
2. CI runs the checks above; Cloudflare posts a preview link.
3. The owner reviews the preview and merges. Production updates in about a minute.
4. Rollback: revert the PR (or roll back the deployment in Cloudflare).

Nobody pushes straight to `main`.

## For AI agents

Built from the same data as the pages at every deploy, so the site and agents never disagree:

| URL                 | What it is                                                                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/llms.txt`         | Short summary for LLMs ([llmstxt.org](https://llmstxt.org))                                                                                                        |
| `/llms-full.txt`    | Every home in full: facts, amenities, rooms, policies, reviews, FAQ, and the agent endpoints                                                                       |
| `/stays.json`       | Every home as JSON, with 1200 px photo URLs, starting rates, policies and links                                                                                    |
| `/api/availability` | `?home=<slug>` → booked dates from the home's Airbnb calendar                                                                                                      |
| Stay pages' JSON-LD | schema.org `LodgingBusiness` with gallery `image` and an `Accommodation` (occupancy, beds)                                                                         |
| `/mcp`              | Read-only MCP server (POST, Streamable HTTP, JSON, no sign-in): `list_homes`, `check_availability`, `get_policies`, `get_booking_link` (`apps/web/src/api/mcp.ts`) |

Builders: `apps/web/src/data/agent.ts` (pure, tested in `test/agent.test.ts`); photo URLs are resolved at build time in `src/lib/agent-media.ts`. To check a build changed nothing else: `node apps/web/scripts/build-diff.mjs <old-dist> apps/web/dist`. To check every photo URL in `/stays.json`: `node apps/web/scripts/check-photos.mjs <site-or-preview-url>`.

## Hosting

Cloudflare (free plan): DNS, Workers static assets (`apps/web/wrangler.jsonc`, preview per PR), Web Analytics. Only `/api/*` and `/mcp` run Worker code (`apps/web/src/worker.ts`); its secrets (`ICAL_<SLUG>`, one Airbnb calendar link per home) live in the Cloudflare dashboard, never in the repo. No payment method is attached to any account; services that require one are out of scope. See `docs/` for the runbook.

## Licence

Source is public for transparency. **No licence is granted**: code, copy, brand marks and images © Apricot Stays, all rights reserved.
