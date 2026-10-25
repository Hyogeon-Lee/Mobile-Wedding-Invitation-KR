/** Shared deterministic helpers for effect parameter generators (petals, curtain light). */

export const GOLDEN = 0.6180339887498949

/** mulberry32: small, fast, deterministic 32-bit PRNG returning [0, 1). */
export function mulberry32(state: number): () => number {
  let a = state >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Hashes two integers into one 32-bit PRNG state. */
export function mix(a: number, b: number): number {
  let h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul((b + 0x632be59b) | 0, 0xc2b2ae35)
  h ^= h >>> 16
  h = Math.imul(h, 0x7feb352d)
  h ^= h >>> 15
  return h >>> 0
}

export const round = (n: number, digits = 2) => {
  const f = 10 ** digits
  return Math.round(n * f) / f
}
export const lerp = (min: number, max: number, t: number) => min + (max - min) * t
export const frac = (n: number) => n - Math.floor(n)
