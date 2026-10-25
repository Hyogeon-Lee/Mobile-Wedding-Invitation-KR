import type PhotoSwipe from 'photoswipe'
import type { SlideData } from 'photoswipe'

type PhotoSwipeCtor = typeof PhotoSwipe

let modulePromise: Promise<PhotoSwipeCtor> | null = null

/**
 * Loads PhotoSwipe and its stylesheet on first use only, so neither is in the initial
 * bundle. A failed load clears the cache so the next tap retries.
 */
export function loadPhotoSwipe(): Promise<PhotoSwipeCtor> {
  if (!modulePromise) {
    modulePromise = Promise.all([import('photoswipe'), import('photoswipe/style.css')]).then(([m]) => m.default)
    modulePromise.catch(() => {
      modulePromise = null
    })
  }
  return modulePromise
}

export interface OpenLightboxOptions {
  dataSource: SlideData[]
  index: number
  /** Fired once the gallery has been removed from the DOM (close, Escape, swipe-down or destroy()). */
  onDestroy?: () => void
}

/** Opens the lightbox at `index` with pinch-zoom, swipe-down-to-close and the "1 / 12" counter. */
export async function openLightbox({ dataSource, index, onDestroy }: OpenLightboxOptions): Promise<PhotoSwipe> {
  const Ctor = await loadPhotoSwipe()
  const pswp = new Ctor({
    dataSource,
    index,
    bgOpacity: 1,
    easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
    showAnimationDuration: 320,
    hideAnimationDuration: 260,
    zoomAnimationDuration: 280,
    closeOnVerticalDrag: true,
    pinchToClose: true,
    escKey: true,
    arrowKeys: true,
    trapFocus: true,
    returnFocus: true,
    counter: true,
    indexIndicatorSep: ' / ',
    preload: [1, 2],
    closeTitle: '닫기',
    zoomTitle: '확대',
    arrowPrevTitle: '이전 사진',
    arrowNextTitle: '다음 사진',
    errorMsg: '사진을 불러오지 못했습니다',
  })
  if (onDestroy) pswp.on('destroy', onDestroy)
  pswp.init()
  // Lenis listens on window; mark the overlay so wheel events over it never scroll the page.
  pswp.element?.setAttribute('data-lenis-prevent', '')
  return pswp
}
