export type PetalShape = 'leaf' | 'petal' | 'sprig'
export type PetalColor = 'sage' | 'mint' | 'blush'

export interface PetalParams {
  /** Horizontal position, % of container width (4–96) */
  x: number
  /** Rendered size in px (10–22) */
  size: number
  /** Fall duration in s (18–30) */
  duration: number
  /** Negative start offset in s (-duration < delay ≤ 0) so petals are mid-air on mount */
  delay: number
  /** Sideways sway amplitude in px (10–34) */
  swayAmplitude: number
  /** One sway half-cycle in s (3.5–7) */
  swayDuration: number
  /** Negative sway offset in s */
  swayDelay: number
  /** Rotation at each end of the sway, in deg */
  rotateFrom: number
  rotateTo: number
  /** Element opacity (0.55–0.85) */
  opacity: number
  /** Resting vertical position under reduced motion, % of container height (10–85) */
  restY: number
  shape: PetalShape
  color: PetalColor
}

export const PETAL_MAX = 18
export const PETAL_DEFAULT = 12

const GOLDEN = 0.6180339887498949

/** mulberry32: small, fast, deterministic 32-bit PRNG returning [0, 1). */
function mulberry32(state: number): () => number {
  let a = state >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function mix(a: number, b: number): number {
  let h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul((b + 0x632be59b) | 0, 0xc2b2ae35)
  h ^= h >>> 16
  h = Math.imul(h, 0x7feb352d)
  h ^= h >>> 15
  return h >>> 0
}

const round = (n: number, digits = 2) => {
  const f = 10 ** digits
  return Math.round(n * f) / f
}
const lerp = (min: number, max: number, t: number) => min + (max - min) * t
const frac = (n: number) => n - Math.floor(n)

function pickWeighted<T extends string>(t: number, table: ReadonlyArray<readonly [T, number]>): T {
  let acc = 0
  for (const [value, weight] of table) {
    acc += weight
    if (t < acc) return value
  }
  return table[table.length - 1][0]
}

const SHAPES = [
  ['leaf', 0.45],
  ['petal', 0.35],
  ['sprig', 0.2],
] as const
const COLORS = [
  ['sage', 0.4],
  ['mint', 0.35],
  ['blush', 0.25],
] as const

/**
 * Pure, deterministic parameters for petal `index` under `seed`.
 * Horizontal positions follow a golden-ratio sequence (offset by the seed) so any first N
 * petals spread evenly across the width; everything else comes from a seeded PRNG.
 */
export function petalParams(index: number, seed = 1): PetalParams {
  const i = Math.floor(Math.abs(index))
  const s = Math.floor(seed) | 0
  const rand = mulberry32(mix(i, s))
  const seedOffset = mulberry32(mix(0x51ed, s))()

  const x = 4 + frac(i * GOLDEN + seedOffset + (rand() - 0.5) * 0.08) * 92
  const size = lerp(10, 22, rand())
  const duration = lerp(18, 30, rand())
  const delay = -rand() * duration
  const swayAmplitude = lerp(10, 34, rand())
  const swayDuration = lerp(3.5, 7, rand())
  const swayDelay = -rand() * swayDuration
  const spin = lerp(18, 55, rand()) * (rand() < 0.5 ? -1 : 1)
  const rotateFrom = lerp(-40, 40, rand())
  const rotateTo = rotateFrom + spin
  const opacity = lerp(0.55, 0.85, rand())
  const restY = 10 + frac(i * (1 - GOLDEN) + seedOffset * 0.5 + rand() * 0.15) * 75
  const shape = pickWeighted(rand(), SHAPES)
  // Sprigs read as greenery; keep them out of blush.
  const color = shape === 'sprig' ? (rand() < 0.55 ? 'sage' : 'mint') : pickWeighted(rand(), COLORS)

  return {
    x: round(x),
    size: round(size, 1),
    duration: round(duration),
    delay: round(delay),
    swayAmplitude: round(swayAmplitude, 1),
    swayDuration: round(swayDuration),
    swayDelay: round(swayDelay),
    rotateFrom: round(rotateFrom, 1),
    rotateTo: round(rotateTo, 1),
    opacity: round(opacity),
    restY: round(restY, 1),
    shape,
    color,
  }
}
