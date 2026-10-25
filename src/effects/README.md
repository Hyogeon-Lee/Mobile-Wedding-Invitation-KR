# src/effects — soft light & greenery effects

Decorative layers for the "morning light through leaves" look: drifting light blooms, a light
sweep over photos, falling leaves and petals, a breathing glow, and a swaying botanical divider.

```tsx
import { LightBloom, LightLeak, PetalDrift, GlowPulse, BotanicalDivider, useInViewPause } from '@/effects'
```

Importing from `@/effects` also loads `effects.css` (keyframes, pause and reduced-motion rules).
Always import from the index, never from individual files, so the stylesheet is present.

## Rules every effect already follows

- Animates only `transform` and `opacity`; softness comes from gradients, never `filter: blur()`.
- Root is `aria-hidden="true"` and `pointer-events-none` (except `GlowPulse`, whose wrapper holds your real content; only its glow is hidden).
- Pauses while off-screen (`useInViewPause` sets `data-paused` on the root).
- Under `prefers-reduced-motion` all keyframes stop and each effect shows a calm static frame.

## Budget (KakaoTalk in-app browser, mid-range Android)

Keep about 20 or fewer moving items in one viewport. Typical costs: `LightBloom` 6, `PetalDrift` = `count`
(12 by default, 7 with `density="light"`; each petal has two animated wrappers), `LightLeak` 1,
`GlowPulse` 1, `BotanicalDivider` 1. Use at most one `PetalDrift` per section and prefer
`density="light"` when it shares a viewport with `LightBloom`.

## Layering (read this before using LightBloom / PetalDrift)

Background layers are `absolute inset-0 z-0`. The parent must be `relative isolate overflow-hidden`,
and every piece of content that should sit above the layer must be positioned with `relative z-10`
(non-positioned content paints *under* an absolutely positioned layer).

```tsx
<div className="relative isolate overflow-hidden rounded-2xl">
  <LightBloom />
  <div className="relative z-10">…content…</div>
</div>
```

`Section` does not yet put its own header above a background layer; see the note at the end.

---

## LightBloom

Background of six large radial-gradient light blobs that drift (16–32 s, alternate, staggered) and
breathe (scale 0.92 → 1.14, opacity low → high).

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `palette` | `Array<'butter' \| 'mint' \| 'blush' \| 'sage'>` | `['butter', 'mint', 'blush']` | Cycled across the blobs |
| `intensity` | `'soft' \| 'medium'` | `'soft'` | Opacity 0.32–0.62 (soft) or 0.48–0.85 (medium) |
| `className` | `string` | `''` | Appended to the root |

```tsx
<div className="relative isolate overflow-hidden">
  <LightBloom palette={['butter', 'mint']} intensity="medium" />
  <div className="relative z-10">{/* section content */}</div>
</div>
```

Reduced motion: blobs stay at rest at their middle opacity.

## LightLeak

Overlay for a photo frame: a static warm glow in the top-left corner and a soft, semi-transparent
diagonal white band (normal compositing, alpha 0.22–0.35) that sweeps across once per cycle. Place it after the image inside a
`relative overflow-hidden` frame; it inherits the frame's border radius.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `interval` | `number` (s) | `7` | Cycle length, clamped 4–20. The sweep uses the first 3/7 of the cycle (3 s at 7 s) |
| `className` | `string` | `''` | Appended to the root (add `z-10` if the image is positioned with a z-index) |

```tsx
<div className="relative overflow-hidden rounded-2xl">
  <img src={asset('images/main.webp')} alt="" className="block w-full" />
  <LightLeak interval={8} />
</div>
```

Reduced motion: no sweep; the corner glow stays.

## PetalDrift

Small inline-SVG leaves, round petals and tiny sprigs in sage / mint / blush (opacity 0.55–0.85,
10–22 px). An outer wrapper falls (18–30 s, linear, fades in and out at the edges) while an inner
wrapper sways sideways 10–34 px and rotates, so the motion reads as air currents. Parameters come
from the pure `petalParams(index, seed)` in `petals.ts`.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `count` | `number` | `12` | Clamped 1–18 |
| `seed` | `number` | `1` | Use a different seed per section so layouts differ |
| `density` | `'light' \| 'normal'` | `'normal'` | `light` renders 60% of `count` |
| `className` | `string` | `''` | Appended to the root |

```tsx
<div className="relative isolate overflow-hidden">
  <PetalDrift count={10} seed={3} density="light" />
  <div className="relative z-10">{/* section content */}</div>
</div>
```

Reduced motion: only the first 4 petals render, static at scattered resting positions.

`petalParams(index: number, seed = 1): PetalParams` returns
`{ x, size, duration, delay, swayAmplitude, swayDuration, swayDelay, rotateFrom, rotateTo, opacity, restY, shape, color }`.
Also exported: `PETAL_MAX` (18), `PETAL_DEFAULT` (12), types `PetalParams`, `PetalShape`, `PetalColor`.

## GlowPulse

Wraps children and puts a soft radial glow disc behind them that breathes (scale 0.9 → 1.1, opacity
0.5 → 0.9, 3 s each way, about a 6 s cycle). The wrapper is `relative isolate inline-grid place-items-center`.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `color` | `'butter' \| 'mint' \| 'blush'` | `'butter'` | Glow tint |
| `size` | `number` (px) | `220` | Glow diameter; the glow may extend past the wrapper, so keep it inside an `overflow-hidden` section or make it no wider than the column |
| `className` | `string` | `''` | Wrapper classes, e.g. `'mx-auto'` or `'grid w-full'` |
| `children` | `ReactNode` | required | Rendered above the glow, stays accessible |

```tsx
<GlowPulse color="blush" size={180} className="mx-auto">
  <p className="font-display text-4xl text-accent">D-30</p>
</GlowPulse>
```

Reduced motion: glow static at scale 1, opacity 0.7.

## BotanicalDivider

Centered 120×28 SVG ornament between two hairlines (`bg-line`), swaying ±2.5° around the stem base
(5 s, ease-in-out, alternate). Decorative only (`aria-hidden`).

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `variant` | `'sprig' \| 'dots' \| 'leaf'` | `'sprig'` | `sprig`: two arching stems with six leaves and a blush bud; `leaf`: one leaf on a short stem; `dots`: three sage / blush / mint dots |
| `className` | `string` | `''` | Appended to the root (default padding `px-6 py-6`) |

```tsx
<Greeting />
<BotanicalDivider variant="leaf" />
<Family />
```

Reduced motion: no sway.

## useInViewPause(ref, rootMargin?)

`useInViewPause(ref: RefObject<Element | null>, rootMargin = '120px 0px'): void`

Toggles `data-paused` on `ref.current` with an IntersectionObserver. `effects.css` pauses every
`.fx-anim` descendant under `[data-paused]`. Use it on the root of any custom effect you build,
and give animated elements the `fx-anim` class so pause and reduced-motion rules apply.

```tsx
const ref = useRef<HTMLDivElement>(null)
useInViewPause(ref)
return <div ref={ref} aria-hidden="true">…<span className="fx-sway fx-anim" />…</div>
```

## Colour variables (from effects.css)

- Glow tints (RGB triplets for `rgb(var(--x) / alpha)`): `--fx-glow-butter`, `--fx-glow-mint`, `--fx-glow-blush`, `--fx-glow-sage`.
- Decorative fills: `--fx-petal-sage`, `--fx-petal-mint`, `--fx-petal-blush`.

These are for decoration only. Text keeps using `text-ink`, `text-ink-muted` or `text-accent`.

## Known integration notes

- `Section` renders its header as non-positioned content, so a `LightBloom` inside a `Section`
  would paint over the header. Until `Section` supports a backdrop, put the effect in a wrapper
  inside `Section`'s children, or ask for the shared `Section` change.
- `App.tsx` notes that sections must stay direct children of `<main>` because the cover's scroll cue
  targets its next sibling. Inserting `BotanicalDivider` between sections changes that sibling.
