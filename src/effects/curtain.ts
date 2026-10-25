import { GOLDEN, frac, lerp, mix, mulberry32, round } from './random'

export interface CurtainBandParams {
  /** Band centre, % of container width (-4–104, so the drift never reveals an empty edge) */
  x: number
  /** Band width in px (28–90) */
  width: number
  /** Peak alpha of the band's gradient core (0.55–0.75) */
  alpha: number
  /** Element opacity at `intensity="medium"` (0.5–0.8); `soft` maps it into 0.5–0.65 */
  opacity: number
  /** Added to the component's `angle`, in deg (-2.5–2.5), so bands are not perfectly parallel */
  tilt: number
  /** One breathe half-cycle in s (6–11) */
  breatheDuration: number
  /** Negative start offset in s (-breatheDuration < delay ≤ 0) */
  breatheDelay: number
}

export interface CurtainDriftParams {
  /** One sideways drift half-cycle in s (50–90) */
  duration: number
  /** Negative start offset in s (-duration < delay ≤ 0) */
  delay: number
}

export const CURTAIN_MIN = 3
export const CURTAIN_MAX = 10
export const CURTAIN_DEFAULT = 6

/** Clamps a requested band count to CURTAIN_MIN–CURTAIN_MAX (non-finite → default). */
export function clampBands(n: number | undefined): number {
  if (n === undefined || !Number.isFinite(n)) return CURTAIN_DEFAULT
  return Math.min(CURTAIN_MAX, Math.max(CURTAIN_MIN, Math.round(n)))
}

/**
 * Pure, deterministic parameters for curtain-light band `index` under `seed`.
 * Positions follow a golden-ratio sequence (offset by the seed, with a small jitter) so any first
 * N bands cover the width with uneven gaps; everything else comes from a seeded PRNG.
 */
export function curtainParams(index: number, seed = 1): CurtainBandParams {
  const i = Math.floor(Math.abs(index))
  const s = Math.floor(seed) | 0
  const rand = mulberry32(mix(i + 0x0c17, s))
  const seedOffset = mulberry32(mix(0xc0a7, s))()

  const x = -4 + frac(i * GOLDEN + seedOffset + (rand() - 0.5) * 0.1) * 108
  const width = lerp(28, 90, rand())
  const alpha = lerp(0.55, 0.75, rand())
  const opacity = lerp(0.5, 0.8, rand())
  const tilt = lerp(-2.5, 2.5, rand())
  const breatheDuration = lerp(6, 11, rand())
  const breatheDelay = -rand() * breatheDuration

  return {
    x: round(x),
    width: round(width, 1),
    alpha: round(alpha),
    opacity: round(opacity),
    tilt: round(tilt, 1),
    breatheDuration: round(breatheDuration),
    breatheDelay: round(breatheDelay),
  }
}

/** Deterministic timing for the sideways drift of the whole band group. */
export function curtainDrift(seed = 1): CurtainDriftParams {
  const rand = mulberry32(mix(0xd71f, Math.floor(seed) | 0))
  const duration = lerp(50, 90, rand())
  return { duration: round(duration), delay: round(-rand() * duration) }
}

export interface CurtainBandSpan {
  /** Band height as % of the layer height (100 / cos θ) */
  pct: number
  /** Extra band height in px (w · |tan θ| plus a 4 px safety margin) */
  px: number
}

/**
 * Smallest height of a band rotated by `rotationDeg` about its centre that still covers the layer
 * from top to bottom. The centreline spans H·cos θ vertically, and the square ends cut a corner of
 * (w/2)·sin θ at each edge, so H ≥ h / cos θ + w·tan θ. The result is split into a % part
 * (layer-relative) and a px part (band-width-relative), applied as `calc(pct% + px px)`.
 */
export function curtainBandSpan(rotationDeg: number, widthPx: number): CurtainBandSpan {
  const deg = Math.min(60, Math.abs(Number.isFinite(rotationDeg) ? rotationDeg : 0))
  const rad = (deg * Math.PI) / 180
  const w = Math.max(0, Number.isFinite(widthPx) ? widthPx : 0)
  return {
    pct: Math.ceil((100 / Math.cos(rad)) * 10) / 10,
    px: Math.ceil(w * Math.tan(rad) + 4),
  }
}
