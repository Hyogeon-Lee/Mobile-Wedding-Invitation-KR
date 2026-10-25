# Project conventions

Mobile wedding invitation (Korean). Vite + React 19 + TypeScript + Tailwind CSS v4. Single page, static build.

- Content: `src/config/wedding.ts` (typed by `src/config/types.ts`). Never hard-code names, dates, or addresses in components.
- Private data (phones, accounts): `src/lib/private.ts` only. Never put real numbers in the repo.
- Sections: `src/sections/<Name>/index.tsx`, default export, no props, reads `wedding` from `@/config/wedding`. Wrap in `<Section id=... eyebrow=... title=...>` from `@/components/Section`. Use `<Reveal>` for entry animation.
- Shared UI: `Button`, `CopyButton`, `Toast` (`ToastProvider`; hook `useToast` from `@/components/toast-context`), `Section`, `Reveal`, `SmoothScroll` in `src/components`.
- Dates: use helpers in `src/lib/date.ts` (KST-fixed). Respect `wedding.event.datePlaceholder` (print "OO월 OO일", "D-OOO").
- Assets under `public/` must be referenced via `asset()` from `@/lib/env` (handles the GitHub Pages base path).
- Styling: Tailwind utilities + tokens from `src/index.css` (`bg-bg`, `text-ink`, `text-ink-muted`, `border-line`, `text-accent`, `bg-accent-soft`, `bg-blush`, `bg-butter`, `bg-mint`, `font-serif`, `font-display`). Palette is pastel greenery: sage accent, mint/blush/butter tints; never use near-black fills. Mobile first, max content width 480px, 24px gutters. Body text ≥ 15px, contrast ≥ 4.5:1.
- Motion: `motion/react` only. 0.4–0.8 s, ease-out, at most two moving elements per viewport. Honor `prefers-reduced-motion`.
- Icons: `lucide-react`.
- Imports use the `@/` alias for `src/`.
- Checks before finishing: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.
- Language: UI text in Korean; code comments in English, only where the code cannot explain itself.
- Backend (guestbook, RSVP): Google Apps Script via `src/lib/sheets.ts` only. `isPreviewBackend` is true until `VITE_APPS_SCRIPT_URL` is set; the UI must work in that mode and show a small "미리보기" notice.
