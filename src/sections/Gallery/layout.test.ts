import { describe, expect, it } from 'vitest'
import { hasMore, splitTiles, toSlides, toggleLabel } from './layout'

describe('splitTiles / hasMore', () => {
  const items = Array.from({ length: 15 }, (_, i) => i)

  it('shows twelve photos and preserves the remaining order when expanded', () => {
    const { head, tail } = splitTiles(items)
    expect(head).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    expect(tail).toEqual([12, 13, 14])
    expect(hasMore(items.length)).toBe(true)
  })

  it('needs no toggle for twelve or fewer photos', () => {
    const few = items.slice(0, 12)
    expect(splitTiles(few).tail).toEqual([])
    expect(hasMore(few.length)).toBe(false)
    expect(hasMore(13)).toBe(true)
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
    expect(toggleLabel(15, false)).toBe('사진 더 보기 (3장)')
    expect(toggleLabel(15, true)).toBe('접기')
  })
})
