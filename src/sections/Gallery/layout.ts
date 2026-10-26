import type { GalleryImage } from '@/config/types'

/**
 * Tiles shown before "더 보기". Kept a multiple of 3 so the collapsed grid ends on a
 * full-width tile and the expanded tail starts a fresh row with the same rhythm.
 */
export const COLLAPSED_COUNT = 9

/** Every third tile (the 4:3 photos in the config order) spans both columns. */
export function spansBothColumns(index: number): boolean {
  return index % 3 === 2
}

/** Literal class names so Tailwind generates them. Alternating lean varies per row against the pair/full rhythm. */
export function tileTilt(index: number): string {
  return index % 2 === 0 ? 'rotate-[-1.2deg]' : 'rotate-[1deg]'
}

export function hasMore(total: number): boolean {
  return total > COLLAPSED_COUNT
}

export function splitTiles<T>(items: readonly T[]): { head: T[]; tail: T[] } {
  return { head: items.slice(0, COLLAPSED_COUNT), tail: items.slice(COLLAPSED_COUNT) }
}

interface Slide {
  src: string
  width: number
  height: number
  alt: string
}

/** PhotoSwipe data-source items. Sources from config/images already carry their final URL. */
export function toSlides(images: readonly GalleryImage[]): Slide[] {
  return images.map(({ src, width, height, alt }) => ({ src, width, height, alt }))
}

export function toggleLabel(total: number, expanded: boolean): string {
  if (expanded) return '접기'
  return `사진 더 보기 (${total - COLLAPSED_COUNT}장)`
}
