# Changelog

All notable changes to apricotstays.in. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); dates are IST.

## [Unreleased]

## [0.1.0] — 2026-10-14

### Added

- Monorepo: `apps/web` (Astro + TypeScript), `apps/api` (reserved), `packages/brand`, `packages/schema`.
- Coming-soon page rebuilt in Astro, pixel-identical to the Netlify version (verified by screenshot diff at 1440 px and 375 px).
- Brand tokens (colours, fonts, logo) moved to `packages/brand`; property list to `packages/schema`.
- CI: formatting, type check, build, internal link check, WCAG 2 AA (axe), Lighthouse budget.
- README, CHANGELOG, SECURITY policy, CODEOWNERS, PR template, Dependabot.

### Fixed

- Canonical URL now resolves to `https://apricotstays.in/`.

### Known issues (carried over from the Netlify page; fix planned for 0.2.0)

- Colour contrast below WCAG AA: eyebrow text, property numbers (`--apricot-deep` #B8602C on cream ≈ 3.9:1) and the Notify button (white on apricot ≈ 2.6:1). Proposed: darken text uses to #A55628 (4.6:1).
- Lighthouse performance 73–86 (mobile, simulated; varies by machine): Google Fonts stylesheet blocks rendering (~2.3 s). Plan: self-host Fraunces and DM Sans at build time, which also stops sending visitor IPs to Google.
- Email sign-up form posts to Netlify Forms, which was never enabled: no submissions were ever stored. Replaced by WhatsApp in 0.2.0.
