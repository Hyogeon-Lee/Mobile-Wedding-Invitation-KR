import { describe, expect, it } from 'vitest'
import { COLLAPSED_COUNT, hasMore, spansBothColumns, splitTiles, tileTilt, toSlides, toggleLabel } from './layout'

describe('spansBothColumns', () => {
  it('spans every third tile so the 2-column grid reads as pair, full, pair, full', () => {
    expect([0, 1, 2, 3, 4, 5, 6, 7, 8].map(spansBothColumns)).toEqual([
      false, false, true, false, false, true, false, false, true,
    ])
  })
})

describe('tileTilt', () => {
  it('alternates a left and a right lean', () => {
    expect([0, 1, 2, 3].map(tileTilt)).toEqual(['rotate-[-1.2deg]', 'rotate-[1deg]', 'rotate-[-1.2deg]', 'rotate-[1deg]'])
  })
})

describe('splitTiles / hasMore', () => {
  const items = Array.from({ length: 12 }, (_, i) => i)

  it('shows the first nine tiles and hides the rest', () => {
    const { head, tail } = splitTiles(items)
    expect(head).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
    expect(tail).toEqual([9, 10, 11])
    expect(hasMore(items.length)).toBe(true)
  })

  it('keeps the collapsed cut on a full-width tile so the tail starts a new row', () => {
    expect(COLLAPSED_COUNT % 3).toBe(0)
    expect(spansBothColumns(COLLAPSED_COUNT - 1)).toBe(true)
  })

  it('needs no toggle for nine or fewer photos', () => {
    const few = items.slice(0, 9)
    expect(splitTiles(few).tail).toEqual([])
    expect(hasMore(few.length)).toBe(false)
  })
})

describe('toSlides', () => {
  const image = { src: '/assets/01-abc.jpg', width: 1200, height: 1500, alt: '사진 1' }

  it('keeps the resolved URL, intrinsic size and alt text by default', () => {
    expect(toSlides([image])).toEqual([image])
  })

  it('applies a resolver when given one', () => {
    expect(toSlides([image], (p) => `/base${p}`)[0].src).toBe('/base/assets/01-abc.jpg')
  })
})

describe('toggleLabel', () => {
  it('counts the hidden photos while collapsed', () => {
    expect(toggleLabel(12, false)).toBe('사진 더 보기 (3장)')
    expect(toggleLabel(12, true)).toBe('접기')
  })
})
