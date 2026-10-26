import type { GalleryImage } from '@/config/types'

// Five tiles end on a complete pair, so the expanded tail starts with a full-width photo
export const COLLAPSED_COUNT = 5

/** Every third tile (the 4:3 photos in the config order) spans both columns. */
export function spansBothColumns(index: number): boolean {
  return index % 3 === 2
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
