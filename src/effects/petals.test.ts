import { describe, expect, it } from 'vitest'
import { PETAL_MAX, petalParams } from './petals'

const all = (seed: number, n = PETAL_MAX) => Array.from({ length: n }, (_, i) => petalParams(i, seed))

describe('petalParams', () => {
  it('is deterministic for the same index and seed', () => {
    expect(petalParams(3, 7)).toEqual(petalParams(3, 7))
    expect(all(42)).toEqual(all(42))
  })

  it('changes with the seed', () => {
    expect(all(1)).not.toEqual(all(2))
  })

  it('keeps every value inside its documented range', () => {
    for (const seed of [0, 1, 2, 99, -5, 123456]) {
      for (const p of all(seed)) {
        expect(p.x).toBeGreaterThanOrEqual(4)
        expect(p.x).toBeLessThanOrEqual(96)
        expect(p.size).toBeGreaterThanOrEqual(10)
        expect(p.size).toBeLessThanOrEqual(22)
        expect(p.duration).toBeGreaterThanOrEqual(18)
        expect(p.duration).toBeLessThanOrEqual(30)
        expect(p.delay).toBeLessThanOrEqual(0)
        expect(p.delay).toBeGreaterThan(-p.duration - 0.01)
        expect(p.swayAmplitude).toBeGreaterThanOrEqual(10)
        expect(p.swayAmplitude).toBeLessThanOrEqual(34)
        expect(p.swayDuration).toBeGreaterThanOrEqual(3.5)
        expect(p.swayDuration).toBeLessThanOrEqual(7)
        expect(p.opacity).toBeGreaterThanOrEqual(0.55)
        expect(p.opacity).toBeLessThanOrEqual(0.85)
        expect(p.restY).toBeGreaterThanOrEqual(10)
        expect(p.restY).toBeLessThanOrEqual(85)
        expect(Math.abs(p.rotateTo - p.rotateFrom)).toBeGreaterThanOrEqual(17.9)
        expect(['leaf', 'petal', 'sprig']).toContain(p.shape)
        expect(['sage', 'mint', 'blush']).toContain(p.color)
        if (p.shape === 'sprig') expect(p.color).not.toBe('blush')
      }
    }
  })

  it('spreads the first petals across both halves of the width', () => {
    for (const seed of [1, 2, 3]) {
      const xs = all(seed, 6).map((p) => p.x)
      expect(xs.some((x) => x < 50)).toBe(true)
      expect(xs.some((x) => x >= 50)).toBe(true)
    }
  })

  it('mixes shapes and colours over a full set', () => {
    const set = all(1)
    expect(new Set(set.map((p) => p.shape)).size).toBeGreaterThanOrEqual(2)
    expect(new Set(set.map((p) => p.color)).size).toBeGreaterThanOrEqual(2)
  })

  it('normalises negative and fractional indices', () => {
    expect(petalParams(-2.7, 1)).toEqual(petalParams(2, 1))
  })
})
