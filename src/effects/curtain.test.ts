import { describe, expect, it } from 'vitest'
import {
  CURTAIN_DEFAULT,
  CURTAIN_MAX,
  CURTAIN_MIN,
  clampBands,
  curtainBandSpan,
  curtainDrift,
  curtainParams,
} from './curtain'

const all = (seed: number, n = CURTAIN_MAX) => Array.from({ length: n }, (_, i) => curtainParams(i, seed))

describe('curtainParams', () => {
  it('is deterministic for the same index and seed', () => {
    expect(curtainParams(4, 9)).toEqual(curtainParams(4, 9))
    expect(all(42)).toEqual(all(42))
  })

  it('changes with the seed', () => {
    expect(all(1)).not.toEqual(all(2))
  })

  it('keeps every value inside its documented range', () => {
    for (const seed of [0, 1, 2, 99, -5, 123456]) {
      for (const b of all(seed)) {
        expect(b.x).toBeGreaterThanOrEqual(-4)
        expect(b.x).toBeLessThanOrEqual(104)
        expect(b.width).toBeGreaterThanOrEqual(28)
        expect(b.width).toBeLessThanOrEqual(90)
        expect(b.alpha).toBeGreaterThanOrEqual(0.55)
        expect(b.alpha).toBeLessThanOrEqual(0.75)
        expect(b.opacity).toBeGreaterThanOrEqual(0.5)
        expect(b.opacity).toBeLessThanOrEqual(0.8)
        expect(Math.abs(b.tilt)).toBeLessThanOrEqual(2.5)
        expect(b.breatheDuration).toBeGreaterThanOrEqual(6)
        expect(b.breatheDuration).toBeLessThanOrEqual(11)
        expect(b.breatheDelay).toBeLessThanOrEqual(0)
        expect(b.breatheDelay).toBeGreaterThan(-b.breatheDuration - 0.01)
      }
    }
  })

  it('spreads even the minimum band count across both halves with uneven gaps', () => {
    for (const seed of [1, 2, 3, 7]) {
      const xs = all(seed, CURTAIN_MIN).map((b) => b.x)
      expect(xs.some((x) => x < 50)).toBe(true)
      expect(xs.some((x) => x >= 50)).toBe(true)
      const sorted = all(seed, CURTAIN_DEFAULT)
        .map((b) => b.x)
        .sort((a, b) => a - b)
      const gaps = sorted.slice(1).map((x, i) => x - sorted[i])
      expect(Math.max(...gaps) - Math.min(...gaps)).toBeGreaterThan(1)
    }
  })

  it('normalises negative and fractional indices', () => {
    expect(curtainParams(-3.6, 1)).toEqual(curtainParams(3, 1))
  })
})

describe('curtainDrift', () => {
  it('is deterministic and stays in 50–90 s with a negative offset', () => {
    for (const seed of [0, 1, 5, -8, 2024]) {
      const d = curtainDrift(seed)
      expect(d).toEqual(curtainDrift(seed))
      expect(d.duration).toBeGreaterThanOrEqual(50)
      expect(d.duration).toBeLessThanOrEqual(90)
      expect(d.delay).toBeLessThanOrEqual(0)
      expect(d.delay).toBeGreaterThan(-d.duration - 0.01)
    }
  })
})

describe('clampBands', () => {
  it('clamps to 3–10 and falls back to the default', () => {
    expect(clampBands(undefined)).toBe(CURTAIN_DEFAULT)
    expect(clampBands(Number.NaN)).toBe(CURTAIN_DEFAULT)
    expect(clampBands(0)).toBe(CURTAIN_MIN)
    expect(clampBands(99)).toBe(CURTAIN_MAX)
    expect(clampBands(7.4)).toBe(7)
  })
})

describe('curtainBandSpan', () => {
  // Vertical half-extent of the band's trailing corner must reach the layer edge for any height h
  const covers = (deg: number, w: number, h: number) => {
    const { pct, px } = curtainBandSpan(deg, w)
    const H = (pct / 100) * h + px
    const rad = (Math.abs(deg) * Math.PI) / 180
    return (H / 2) * Math.cos(rad) - (w / 2) * Math.sin(rad) >= h / 2
  }

  it('covers the layer top to bottom at every lean, tilt and width', () => {
    for (const deg of [0, -12.5, -17.5, 30, -47.5])
      for (const w of [28, 60, 90]) for (const h of [200, 700, 2600, 4000]) expect(covers(deg, w, h)).toBe(true)
  })

  it('stays near the layer height at the default lean and at most 160% at the clamp', () => {
    expect(curtainBandSpan(-17.5, 90).pct).toBeLessThanOrEqual(105)
    expect(curtainBandSpan(0, 90)).toEqual({ pct: 100, px: 4 })
    expect(curtainBandSpan(-47.5, 90).pct).toBeLessThanOrEqual(160)
  })

  it('handles non-finite input', () => {
    expect(curtainBandSpan(Number.NaN, Number.NaN)).toEqual({ pct: 100, px: 4 })
  })
})
