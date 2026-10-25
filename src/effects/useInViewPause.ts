import { useEffect, type RefObject } from 'react'

/**
 * Sets `data-paused=""` on the element while it is outside the viewport (plus `rootMargin`).
 * effects.css pauses every `.fx-anim` descendant under `[data-paused]`.
 * Writes the attribute directly so scrolling never triggers a React re-render.
 */
export function useInViewPause(ref: RefObject<Element | null>, rootMargin = '120px 0px'): void {
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) el.toggleAttribute('data-paused', !entry.isIntersecting)
      },
      { rootMargin },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      el.removeAttribute('data-paused')
    }
  }, [ref, rootMargin])
}
