# apricot-platform

Monorepo for **Apricot Stays** — boutique homes across the Chandigarh Tricity.

| Path              | What it is                                                   | Status   |
| ----------------- | ------------------------------------------------------------ | -------- |
| `apps/web`        | apricotstays.in (Astro, static)                              | Live     |
| `apps/api`        | Availability, enquiries, agent API (Cloudflare Workers)      | Reserved |
| `packages/brand`  | Colours, fonts, logo — single source of truth                | Active   |
| `packages/schema` | Shared data definitions (properties now; availability later) | Active   |

Booking and availability logic belongs in **STAIZ**; this site reads from it rather than re-implementing it.

## Run locally

Requires Node 22 (`.nvmrc`).

```sh
npm ci
npm run dev        # http://localhost:4321
npm run build      # → apps/web/dist
```

## Quality checks (run on every PR)

| Check          | Command                | Gate                                          |
| -------------- | ---------------------- | --------------------------------------------- |
| Formatting     | `npm run format:check` | Prettier, no diffs                            |
| Types/template | `npm run check`        | `astro check`, no errors                      |
| Build          | `npm run build`        | Must succeed                                  |
| Broken links   | `npm run links`        | Internal links resolve                        |
| Accessibility  | `npm run a11y`         | WCAG 2 AA via axe (needs `npm run preview`)   |
| Page speed     | `npm run lhci`         | Lighthouse ≥ 90 perf, ≥ 95 a11y, HTML ≤ 50 KB |

## How changes ship

1. A change is opened as a pull request against `main`.
2. CI runs the checks above; Cloudflare posts a preview link.
3. The owner reviews the preview and merges. Production updates in about a minute.
4. Rollback: revert the PR (or roll back the deployment in Cloudflare).

Nobody pushes straight to `main`.

## Hosting

Cloudflare (free plan): DNS, Pages/Workers static hosting, Web Analytics. No payment method is attached to any account; services that require one are out of scope. See `docs/` for the runbook.

## Licence

Source is public for transparency. **No licence is granted**: code, copy, brand marks and images © Apricot Stays, all rights reserved.
