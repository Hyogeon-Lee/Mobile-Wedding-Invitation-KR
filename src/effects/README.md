# src/effects — soft light & greenery effects

Decorative layers for the "morning light through leaves" look: drifting light blooms, a light
sweep over photos, sunlight through sheer curtains, falling leaves and petals, a breathing glow, and
a swaying botanical divider.

```tsx
import { LightBloom, LightLeak, CurtainLight, PetalDrift, GlowPulse, BotanicalDivider, useInViewPause } from '@/effects'
```

Importing from `@/effects` also loads `effects.css` (keyframes, pause and reduced-motion rules).
Always import from the index, never from individual files, so the stylesheet is present.

## Rules every effect already follows

- Animates only `transform` and `opacity`; softness comes from gradients, never `filter: blur()`.
- Root is `aria-hidden="true"` and `pointer-events-none` (except `GlowPulse`, whose wrapper holds your real content; only its glow is hidden).
- Pauses while off-screen (`useInViewPause` sets `data-paused` on the root).
- Under `prefers-reduced-motion` all keyframes stop and each effect shows a calm static frame.

## Budget (KakaoTalk in-app browser, mid-range Android)

Keep about 20 or fewer animated nodes in one viewport. Costs:

| Effect | Animated nodes |
| --- | --- |
| `LightBloom` | 6 |
| `CurtainLight` | `bands` + 2 (one wash, one drifting group): 8 by default, 5–12 |
| `PetalDrift` | 2 × rendered petals (each petal has a falling wrapper and a swaying wrapper): 24 at the default `count` 12, 14 at `count` 12 with `density="light"` (7 petals) |
| `LightLeak` | 1 |
| `GlowPulse` | 1 |
| `BotanicalDivider` | 1 |

The default `PetalDrift` alone (24) is over budget, so always pass a lower `count` or
`density="light"`. Use at most one `PetalDrift` per section and prefer `density="light"` when it shares
a viewport with `LightBloom` or `CurtainLight`. Use `CurtainLight` instead of `LightBloom` as a section background,
not in addition to it: the two together already cost 14 at their defaults.

## Layering (read this before using LightBloom / CurtainLight / PetalDrift)

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

## CurtainLight

Background of afternoon sunlight through sheer curtains: 3–10 tall, leaning bands of warm-white
light (each a rotated div filled with a horizontal transparent → light → transparent gradient, 28–90 px
wide, unevenly spaced) over one faint radial wash from the top-right corner where the window is.
The whole band group drifts sideways ±6% of the layer width (50–90 s, alternate) while each band
breathes ±15% in opacity (6–11 s, staggered), so the light moves like curtains in a breeze. Band
parameters come from the pure `curtainParams(index, seed)` in `curtain.ts`.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `bands` | `number` | `6` | Clamped 3–10. Cost is `bands` + 2 animated nodes |
| `tone` | `'warm' \| 'neutral'` | `'warm'` | `warm`: warm-white bands (`rgb(255 250 235)`) and a butter wash; `neutral`: white bands and a sky wash |
| `intensity` | `'soft' \| 'medium'` | `'soft'` | Band opacity 0.5–0.65 (soft) or 0.5–0.8 (medium); wash peak alpha 0.40 / 0.55 (warm) or 0.26 / 0.34 (neutral) |
| `angle` | `number` (deg) | `-15` | Lean of the bands, clamped -45–45; each band adds up to ±2.5° so they are not parallel |
| `seed` | `number` | `1` | Band positions, widths and timings; use a different seed per section |
| `className` | `string` | `''` | Appended to the root |

```tsx
<div className="relative isolate overflow-hidden">
  <CurtainLight bands={5} seed={4} />
  <div className="relative z-10">{/* section content */}</div>
</div>
```

The root is `absolute inset-0 z-0`, so the parent must be `relative isolate overflow-hidden` and
content above it `relative z-10` (see Layering). The bands are lighter than the page background, so
they only raise text contrast. The wash is the one part that darkens the background slightly; its
peak alpha is capped so `text-ink-muted` stays at or above 4.5:1 over `bg` (4.59:1 under the warm medium
wash, 4.55:1 under the neutral medium wash). If it sits over another tinted layer, check small
muted text again.

Reduced motion: no drift and no breathing; bands stay at their base opacity and the wash at 0.9.

`curtainParams(index: number, seed = 1): CurtainBandParams` returns
`{ x, width, alpha, opacity, tilt, breatheDuration, breatheDelay }` (`x` in % of width, -4–104,
spread with a golden-ratio sequence). `curtainDrift(seed = 1): CurtainDriftParams` returns the group's
`{ duration, delay }`. `curtainBandSpan(rotationDeg, widthPx): CurtainBandSpan` returns `{ pct, px }`, the
smallest band height that still covers the layer once rotated (`calc(pct% + px px)`, from
H ≥ h / cos θ + w·tan θ); about 104–111% at the default lean, so tall sections such as the gallery do not
paint bands far outside the box. Also exported: `clampBands`, `CURTAIN_MIN` (3), `CURTAIN_MAX` (10),
`CURTAIN_DEFAULT` (6), types `CurtainTone`, `CurtainLightProps`, `CurtainBandParams`, `CurtainDriftParams`,
`CurtainBandSpan`.

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
- CurtainLight (RGB triplets): `--fx-curtain-light-warm`, `--fx-curtain-light-neutral` (bands),
  `--fx-curtain-wash-warm` (butter), `--fx-curtain-wash-neutral` (sky).

These are for decoration only. Text keeps using `text-ink`, `text-ink-muted` or `text-accent`.

## Known integration notes

- `Section` renders its header as non-positioned content, so a `LightBloom` inside a `Section`
  would paint over the header. Until `Section` supports a backdrop, put the effect in a wrapper
  inside `Section`'s children, or ask for the shared `Section` change.
- `App.tsx` notes that sections must stay direct children of `<main>` because the cover's scroll cue
  targets its next sibling. Inserting `BotanicalDivider` between sections changes that sibling.
