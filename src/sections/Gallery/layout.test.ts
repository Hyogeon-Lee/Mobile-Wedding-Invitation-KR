import { describe, expect, it } from 'vitest'
import { hasMore, splitTiles, toSlides, toggleLabel } from './layout'

describe('splitTiles / hasMore', () => {
  const items = Array.from({ length: 12 }, (_, i) => i)

  it('shows five photos and preserves the remaining order when expanded', () => {
    const { head, tail } = splitTiles(items)
    expect(head).toEqual([0, 1, 2, 3, 4])
    expect(tail).toEqual([5, 6, 7, 8, 9, 10, 11])
    expect(hasMore(items.length)).toBe(true)
  })

  it('needs no toggle for five or fewer photos', () => {
    const few = items.slice(0, 5)
    expect(splitTiles(few).tail).toEqual([])
    expect(hasMore(few.length)).toBe(false)
    expect(hasMore(6)).toBe(true)
    expect(splitTiles([])).toEqual({ head: [], tail: [] })
  })
})

describe('toSlides', () => {
  const image = { src: '/assets/01-abc.jpg', width: 1200, height: 1500, alt: '사진 1' }

  it('keeps the URL, intrinsic size and alt text', () => {
    expect(toSlides([image])).toEqual([image])
  })
})

describe('toggleLabel', () => {
  it('counts the hidden photos while collapsed', () => {
    expect(toggleLabel(12, false)).toBe('사진 더 보기 (7장)')
    expect(toggleLabel(12, true)).toBe('접기')
  })
})
