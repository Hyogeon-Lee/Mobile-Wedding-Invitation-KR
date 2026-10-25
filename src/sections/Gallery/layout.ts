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

/**
 * Alternating polaroid tilt. Literal class names so Tailwind generates them.
 * Even indices lean left, odd lean right; with the pair/full rhythm this varies per row.
 */
export function tileTilt(index: number): string {
  return index % 2 === 0 ? 'rotate-[-1.2deg]' : 'rotate-[1deg]'
}

export function hasMore(total: number): boolean {
  return total > COLLAPSED_COUNT
}

/** Always-visible head and the collapsible tail, in config order. */
export function splitTiles<T>(items: readonly T[]): { head: T[]; tail: T[] } {
  return { head: items.slice(0, COLLAPSED_COUNT), tail: items.slice(COLLAPSED_COUNT) }
}

export interface Slide {
  src: string
  width: number
  height: number
  alt: string
}

/** PhotoSwipe data-source items; `resolve` maps `src` to its served URL (sources from config/images are final already). */
export function toSlides(images: readonly GalleryImage[], resolve: (src: string) => string = (src) => src): Slide[] {
  return images.map(({ src, width, height, alt }) => ({ src: resolve(src), width, height, alt }))
}

/** "사진 더 보기 (3장)" while collapsed, "접기" once expanded. */
export function toggleLabel(total: number, expanded: boolean): string {
  if (expanded) return '접기'
  return `사진 더 보기 (${total - COLLAPSED_COUNT}장)`
}
