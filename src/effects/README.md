# src/effects — soft light & greenery effects

Decorative layers for the "morning light through leaves" look: drifting light blooms, a light
sweep over photos, sunlight through sheer curtains, falling leaves and petals, a breathing glow,
a swaying botanical ornament, and two static helpers that let tints and leaves cross section boundaries
(`Wash`, `Bleed`).

```tsx
import { LightBloom, LightLeak, CurtainLight, PetalDrift, GlowPulse, BotanicalDivider, Wash, Bleed, fadeMask, useInViewPause } from '@/effects'
```

Importing from `@/effects` also loads `effects.css` (keyframes, pause and reduced-motion rules).
Always import from the index, never from individual files, so the stylesheet is present.

## Rules every effect already follows

- Animates only `transform` and `opacity`; softness comes from gradients, never `filter: blur()`.
- Root is `aria-hidden="true"` and `pointer-events-none` (except `GlowPulse`, whose wrapper holds your real content; only its glow is hidden).
- `Wash` and `Bleed` are static (no keyframes), so they cost 0 animated nodes and need no pause or reduced-motion rule.
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
| `Wash` | 0 (static) |
| `Bleed` | 0 (static wrapper; count the effects inside it) |

The default `PetalDrift` alone (24) is over budget, so always pass a lower `count` or
`density="light"`. Use at most one `PetalDrift` per section and prefer `density="light"` when it shares
a viewport with `LightBloom` or `CurtainLight`. Use `CurtainLight` instead of `LightBloom` as a section background,
not in addition to it: the two together already cost 14 at their defaults.

Current page (iPhone 14, 390 × 844, counted as above; a Bleed's effects count wherever the Bleed reaches):

| Viewport | Animated nodes |
| --- | --- |
| Cover | 13 (curtain 8 + petal 2 + leak 1 + glow 1 + scroll cue 1) |
| Cover → greeting | 19 (13 + greeting petals 6) |
| Greeting → family | 7 (petals 6 + sprig 1) |
| Family → calendar | 7 (card bloom 6 + glow 1) |
| Calendar → gallery | 14 (card bloom 6 + glow 1 + gallery curtain 7) |
| Gallery → location | 13 (petals 6 + leaf 1 + location bloom 6) |
| Location → account | 6 (location bloom) |
| Account, RSVP, guestbook | 0 |
| Share → footer | 7 (footer bloom 6 + sprig 1) |

Measured in Chromium (running `.fx-anim` elements intersecting an 844 px viewport, 150 px scroll steps):
at most 17, at the cover → greeting step at 480 px (cover 10 + petals 6 + sprig 1); 16 at 360 and 390 px
(cover 9 + petals 6 + sprig 1; some cover bands are already above the fold); 14 at 390 px and 12 at 360 px in
large-text mode. The scroll cue is a Motion/WAAPI loop, not `.fx-anim`, so it adds 1 there (18 at most).

## Layering (read this before using LightBloom / CurtainLight / PetalDrift)

There are two places a background layer can live.

**Across sections (page ambience).** `<main>` (`.app-frame`, `relative isolate`) is the only stacking
context for page decoration. `Section` is `relative` and never `isolate`, `overflow-hidden`, transformed or
z-indexed, so a layer at `-z-10` inside it paints in `<main>`'s context: above the page background, under every
section's content, and free to extend into the neighbouring sections. Use `Section`'s `wash` prop for a
static tint and its `backdrop` prop for a `Bleed` holding animated effects. Later sections' layers paint over
earlier ones, so never put an opaque fill (for example a `from-bg` overlay) where another section's tint is still
visible; feather with a mask instead.

```tsx
<Section
  id="location"
  top="sm"
  bottom="sm"
  backdrop={
    <Bleed top="-8rem" bottom="0" mask="y" fade="12rem">
      <LightBloom palette={['butter', 'mint']} intensity="soft" className="opacity-65" />
    </Bleed>
  }
>
  …content…
</Section>
```

`Section`'s header is `relative z-20` and its children wrapper `relative z-10`, so light placed inside the
content layer passes under the title.

**Inside a component (a card, a photo frame).** Effects are `absolute inset-0 z-0`. The parent must be
`relative isolate overflow-hidden`, and every piece of content that should sit above the layer must be
positioned with `relative z-10` (non-positioned content paints *under* an absolutely positioned layer).

```tsx
<div className="relative isolate overflow-hidden rounded-2xl">
  <LightBloom />
  <div className="relative z-10">…content…</div>
</div>
```

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
| `tone` | `'warm' \| 'neutral'` | `'warm'` | `warm`: cool green-white bands (`rgb(250 255 248)`) and a leaf wash (`234 246 230`); `neutral`: white bands and a sky wash (`230 240 242`) |
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

The root is `absolute inset-0 z-0`, so the parent must be a `Bleed` or `relative isolate overflow-hidden`, and
content above it `relative z-10` (see Layering). The bands are lighter than the page background, so
they only raise text contrast. The wash is the one part that darkens the background slightly; its
peak alpha is capped so `text-ink-muted` stays at or above 4.5:1 over `bg` (4.91:1 under the warm medium
wash, 4.91:1 under the neutral medium wash). If it sits over another tinted layer, check small
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
| `size` | `number` (px) | `220` | Glow diameter; the glow may extend past the wrapper and sections no longer clip, so keep it no wider than the column (≤ 342 px at 390 px) |
| `className` | `string` | `''` | Wrapper classes, e.g. `'mx-auto'` or `'grid w-full'` |
| `children` | `ReactNode` | required | Rendered above the glow, stays accessible |

```tsx
<GlowPulse color="blush" size={180} className="mx-auto">
  <p className="font-display text-4xl text-accent">D-30</p>
</GlowPulse>
```

Reduced motion: glow static at scale 1, opacity 0.7.

## BotanicalDivider

Centered, line-free 120×28 SVG ornament (the root is 44 px tall), swaying ±2.5° around the stem base
(5 s, ease-in-out, alternate). Decorative only (`aria-hidden`). There are no hairlines: a line across the column
reads as a cut between sections. Use at most three ornaments per page (currently: after the greeting, after the
gallery, and the footer's own sprig).

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `variant` | `'sprig' \| 'dots' \| 'leaf'` | `'sprig'` | `sprig`: two arching stems with six leaves and a blush bud; `leaf`: one leaf on a short stem; `dots`: three sage / blush / mint dots |
| `className` | `string` | `''` | Appended to the root (default padding `px-6 py-2`) |

```tsx
<Greeting />
<BotanicalDivider variant="sprig" />
<Family />
```

Reduced motion: no sway.

## Wash

Static, feathered tint owned by a section that reaches past it into both neighbours: the gradient is
transparent at the layer's top, reaches the peak `2 × reachTop` below that, holds, and fades out over
`max(2 × reachBottom, 160px)`, so a tint always starts before a boundary and ends after it. A faint white
radial highlight sits near the top-left. Usually rendered through `Section`'s `wash` prop.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `tone` | `'leaf' \| 'mint' \| 'sky'` | `'leaf'` | Peak 0.44 of `233 246 224` (leaf), 0.32 of `214 240 222` (mint), 0.44 of `230 240 242` (sky) |
| `reachTop` | `number` (px) | `160` | How far the layer extends above the parent |
| `reachBottom` | `number` (px) | `160` | How far the layer extends below the parent; clamped to `0` automatically in the last section |
| `className` | `string` | `''` | Appended to the root |

```tsx
<Section id="family" top="sm" wash="mint">…</Section>
```

Rules: the parent must be `relative` and never `isolate`, `overflow-hidden`, transformed or z-indexed;
otherwise the wash is clipped to the parent's box or painted inside it instead of across the boundary.
Over a short section the plateau collapses and the wash becomes a soft hump; that is intended.

Contrast at the densest point (sRGB alpha-over on bg `#f8fbf6`, WCAG ratio):

| Tint | Peak composite | `text-ink-muted` | `text-accent` |
| --- | --- | --- | --- |
| mint | `rgb(237 247 238)` | 4.86:1 | 4.94:1 |
| leaf | `rgb(241 249 236)` | 4.93:1 | 5.01:1 |
| sky (unused) | `rgb(240 246 244)` | 4.86:1 | 4.94:1 |

Do not stack a wash on a `LightBloom` that sits under small muted text without recomputing. Hidden under
`prefers-contrast: more` and `forced-colors: active`; kept under `prefers-reduced-transparency` (it is a
tint on an opaque ground, not a see-through surface).

## Bleed

Static decorative wrapper (`absolute inset-x-0 -z-10 overflow-hidden`, `contain: paint`) whose `top` /
`bottom` may be negative, so the effects inside it cross section boundaries: light that starts above a heading,
leaves that fall from one section into the next. A Bleed at `-z-10` is its own stacking context, so effects inside
keep their `absolute inset-0 z-0` layout and `useInViewPause` still observes the effect's own root.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `top` | CSS length | `0` unless only `bottom` is set | Negative reaches into the section above; a `%` resolves against the parent's height |
| `bottom` | CSS length | `0` unless only `top` is set | Negative reaches into the section below |
| `mask` | `'none' \| 'y' \| 'top' \| 'bottom'` | `'none'` | Static feather on those edges |
| `fade` | CSS length | `'10rem'` | Feather length |
| `className` | `string` | `''` | E.g. a height when only one edge is set: `h-[28rem]` |
| `style` | `CSSProperties` | | Merged last |

```tsx
// Leaves fall from the last gallery rows into Location (3 petals, 6 nodes).
<Bleed bottom="-12rem" className="h-[28rem]">
  <PetalDrift count={3} seed={5} />
</Bleed>
```

`fadeMask(edge, fade = '10rem'): CSSProperties` returns the mask as both `mask-image` and
`-webkit-mask-image` (older Android WebViews need the prefix). Use it directly for a masked wrapper that is
not a Bleed, e.g. the cover's curtain, which fades over its last 200 px inside the isolated cover.

Rules: same parent rules as `Wash`. Feather a Bleed with `mask`, never with opaque `from-bg` overlays (they would
hide the washes of earlier sections). Count the effects inside it in every viewport the Bleed reaches. A Bleed
with a negative `bottom` must not sit in the last section of `<main>`: it would add empty scroll below the page.
(A wash in the last section is clamped to `bottom: 0` by `.app-frame > :last-child > .fx-wash`.)

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

- `Section` is never isolated or clipped (`relative px-6` plus `top` / `bottom` padding of 48 / 56 / 64 px).
  Ambient light goes in `wash` or a `Bleed` in `backdrop`; the header is `z-20`, the content `z-10`.
- `.app-frame` (`<main>`) is `relative isolate` so negative-z layers paint above its background. It has no
  overflow rule; Bleeds and washes are `inset-x-0`, so nothing overflows horizontally.
- The cover stays `relative isolate overflow-hidden` (its rotated curtain bands must be clipped sideways). Its
  curtain fades out over the last 200 px through `fadeMask('bottom', '200px')`, and the greeting's leaf wash shows
  through from below.
- Sections stay direct children of `<main>`. The cover's scroll cue skips `aria-hidden` siblings, so the
  ornaments between sections are safe.
- At most three ornaments per page, all line-free; no hairlines between sections.
