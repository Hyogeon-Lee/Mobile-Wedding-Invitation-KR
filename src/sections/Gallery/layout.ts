import type { GalleryImage } from '@/config/types'

export const COLLAPSED_COUNT = 5

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
