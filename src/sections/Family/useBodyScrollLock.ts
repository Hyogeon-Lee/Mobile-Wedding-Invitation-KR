import { useLenis } from 'lenis/react'
import { useEffect } from 'react'

const STYLE_KEYS = ['overflow', 'position', 'top', 'left', 'right', 'width'] as const
type StyleKey = (typeof STYLE_KEYS)[number]

/**
 * Locks page scroll while `locked` is true.
 * Fixes <body> at the current scroll offset (overflow:hidden alone is ignored by iOS
 * in-app browsers) and pauses Lenis when SmoothScroll mounted it. Restores both on unlock.
 */
export function useBodyScrollLock(locked: boolean): void {
  const lenis = useLenis()
  useEffect(() => {
    if (!locked) return
    const { body } = document
    const saved = {} as Record<StyleKey, string>
    for (const key of STYLE_KEYS) saved[key] = body.style[key]
    const y = window.scrollY

    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${y}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
    lenis?.stop()

    return () => {
      for (const key of STYLE_KEYS) body.style[key] = saved[key]
      window.scrollTo(0, y)
      lenis?.start()
    }
  }, [locked, lenis])
}
