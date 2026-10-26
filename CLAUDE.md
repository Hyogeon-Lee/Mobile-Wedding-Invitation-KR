# Project conventions

Mobile wedding invitation (Korean). Vite + React 19 + TypeScript + Tailwind CSS v4. Single page, static build.

- Content: text in `config/wedding.json` (typed by `src/config/types.ts`, checked by `src/config/validate.ts`, loaded by `src/config/wedding.ts`); photos in `config/images/` (`cover.jpg`, `gallery/*` in file-name order), sized and URL-resolved at build time by `vite/content-images.ts` (`virtual:content-images`). Every section's `enabled`, eyebrow, title and intro copy comes from the JSON. Never hard-code names, dates, addresses or section copy in components; form labels, button labels, toasts and errors stay in code. Owner guide: `config/README.md`.
- Private data (phones, accounts): `src/lib/private.ts` only. Never put real numbers in the repo.
- Sections: `src/sections/<Name>/index.tsx`, default export, no props, reads `wedding` from `@/config/wedding`. Wrap in `<Section id=... eyebrow=... title=...>` from `@/components/Section`. Use `<Reveal>` for entry animation.
- Shared UI: `Button`, `CopyButton`, `Toast` (`ToastProvider`; hook `useToast` from `@/components/toast-context`), `Section`, `Reveal`, `SmoothScroll` in `src/components`.
- Dates: use helpers in `src/lib/date.ts` (KST-fixed). Respect `wedding.event.datePlaceholder` (print "OO월 OO일", "D-OOO").
- `public/` holds only UI assets (favicon, `og-image.png`, `images/map-fallback.svg`); reference them via `asset()` from `@/lib/env` (handles the GitHub Pages base path). Content images from `config/images/` already carry their final URL; do not wrap them in `asset()`.
- Styling: Tailwind utilities + tokens from `src/index.css` (`bg-bg`, `text-ink`, `text-ink-muted`, `border-line`, `text-accent` (fresh green: labels, links, icons), `bg-accent-tint` + `text-accent-deep` (primary buttons: pale green fill, deep green text; never white text on a light green), `text-orange` (large numerals ≥ 24px and tiny marks only), `bg-accent-soft`, `bg-mint`, `bg-butter` (cool leaf-light), `bg-sand`, `bg-sky`, `font-serif`, `font-display`). Palette: pale, cool fresh greens on an ivory-white ground with a clean orange spark; keep greens light (the owner asked for paler greens twice). No pink, apricot, peach or golden-warm tints anywhere; never use near-black fills. Mobile first, max content width 480px, 24px gutters. Body text ≥ 15px, contrast ≥ 4.5:1.
- Motion: content entry animations use `motion/react` (0.4–0.8 s, ease-out, at most two at once). Decorative ambient effects come from `src/effects` (CSS keyframes, transform/opacity only, about 20 animated nodes per viewport, paused off-screen, static under `prefers-reduced-motion`); see `src/effects/README.md`. Ambient tints are `wash` on `Section` or `Bleed` layers (in `backdrop`) that may cross section boundaries; sections are never `isolate overflow-hidden`, there are no hairlines between sections, and at most three ornaments per page.
- Icons: `lucide-react`.
- Imports use the `@/` alias for `src/`.
- Checks before finishing: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.
- Language: UI text in Korean; code comments in English, only where the code cannot explain itself.
- Backend (guestbook, RSVP): Google Apps Script via `src/lib/sheets.ts` only. `isPreviewBackend` is true until `VITE_APPS_SCRIPT_URL` is set; the UI must work in that mode and show a small "미리보기" notice.
